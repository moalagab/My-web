import { createClient } from "npm:@supabase/supabase-js@2";
import { allowedOrigin } from "../submit-lead/lead.ts";
import { parseSignup } from "./signup.ts";

const env = (key: string) => Deno.env.get(key) ?? "";

// Same key lookup as submit-lead: new projects expose SUPABASE_SECRET_KEYS.
const serviceKey = () => {
  if (env("SUPABASE_SERVICE_ROLE_KEY")) return env("SUPABASE_SERVICE_ROLE_KEY");
  try {
    const keys = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}");
    return String(keys.default ?? Object.values(keys)[0] ?? "");
  } catch {
    return "";
  }
};

const supabase = createClient(env("SUPABASE_URL"), serviceKey(), {
  auth: { persistSession: false },
});

const respond = (body: unknown, status: number, origin: string | null) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      Vary: "Origin",
      ...(origin
        ? {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Headers":
              "authorization, x-client-info, apikey, content-type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          }
        : {}),
    },
  });

const verifyTurnstile = async (token: string, ip: string | null) => {
  const secret = env("TURNSTILE_SECRET_KEY");
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not set");
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form },
  );
  const data = await res.json();
  return data?.success === true;
};

Deno.serve(async (req) => {
  const origin = allowedOrigin(req.headers.get("origin"), env("ALLOWED_ORIGINS"));
  if (!origin) return respond({ error: "forbidden_origin" }, 403, null);
  if (req.method === "OPTIONS") return respond(null, 204, origin);
  if (req.method !== "POST") return respond({ error: "method_not_allowed" }, 405, origin);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return respond({ error: "invalid_payload" }, 400, origin);
  }

  const parsed = parseSignup(body);
  if (parsed.kind === "invalid") return respond({ error: "invalid_payload" }, 400, origin);
  if (parsed.kind === "spam") return respond({ ok: true }, 200, origin);

  const ip = req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  try {
    if (!(await verifyTurnstile(parsed.token, ip))) {
      return respond({ error: "captcha_failed" }, 400, origin);
    }
  } catch (err) {
    console.error("turnstile verification failed", err);
    return respond({ error: "unexpected_error" }, 500, origin);
  }

  const { error } = await supabase.from("guide_signups").insert(parsed.signup);
  // 23505 = the address is already signed up; tell the visitor it worked.
  if (error && error.code !== "23505") {
    console.error("guide signup insert failed", error);
    return respond({ error: "unexpected_error" }, 500, origin);
  }
  return respond({ ok: true }, 200, origin);
});
