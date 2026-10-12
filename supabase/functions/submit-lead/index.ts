import { createClient } from "npm:@supabase/supabase-js@2";
import { allowedOrigin, escapeHtml, parseLead } from "./lead.ts";

const env = (key: string) => Deno.env.get(key) ?? "";

const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
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

const sendEmail = async (lead: Record<string, unknown>) => {
  const rows: Array<[string, unknown]> = [
    ["Name", lead.name],
    ["Company", lead.company],
    ["Email", lead.email],
    ["WhatsApp", lead.whatsapp],
    ["Service line", lead.service_line],
    ["Package", lead.package],
    ["Budget", lead.budget],
    ["Timeline", lead.timeline],
    ["Links", lead.links],
    ["Locale", lead.locale],
    ["Referrer", lead.page_referrer],
    ["UTM source", lead.utm_source],
    ["UTM medium", lead.utm_medium],
    ["UTM campaign", lead.utm_campaign],
  ];
  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;color:#536D82;font-size:12px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#1A1A2E;font-size:14px">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env("RESEND_FROM"),
      to: [env("LEAD_NOTIFY_EMAIL")],
      reply_to: lead.email,
      subject: `New brief — ${lead.name} (${lead.service_line})`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;background:#F7F9FB;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #DDE6ED">
    <div style="background:#26374D;color:#FFFFFF;padding:20px 24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.75">New brief</div>
      <div style="font-size:20px;margin-top:6px">${escapeHtml(lead.name)}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">${table}</table>
    <div style="padding:0 24px 24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#536D82;margin-bottom:8px">Project description</div>
      <div style="white-space:pre-wrap;color:#1A1A2E;font-size:14px;line-height:1.7;border-inline-start:2px solid #DDE6ED;padding-inline-start:12px">${escapeHtml(lead.description)}</div>
    </div>
  </div>
</div>`,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
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

  const parsed = parseLead(body);
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

  const { error } = await supabase.from("leads").insert(parsed.lead);
  if (error) {
    if (error.message.includes("rate_limit_exceeded")) {
      return respond({ error: "rate_limited" }, 429, origin);
    }
    console.error("lead insert failed", error);
    return respond({ error: "unexpected_error" }, 500, origin);
  }

  try {
    await sendEmail(parsed.lead);
    return respond({ ok: true, notified: true }, 200, origin);
  } catch (err) {
    // The lead is saved and visible in /admin, so the visitor still sees success.
    console.error("lead email failed", err);
    return respond({ ok: true, notified: false }, 200, origin);
  }
});
