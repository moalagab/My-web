import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "mo@moalagab.art";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const esc = (value: unknown) =>
  String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const lead = await req.json();

    if (!lead || typeof lead.email !== "string" || typeof lead.name !== "string") {
      return json({ error: "invalid_payload" }, 400);
    }

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
          `<tr><td style="padding:6px 12px;color:#536D82;font-size:12px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#1A1A2E;font-size:14px">${esc(value)}</td></tr>`,
      )
      .join("");

    const { error } = await resend.emails.send({
      from: "Mo Alagab Site <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      reply_to: lead.email,
      subject: `New brief — ${lead.name} (${lead.service_line ?? "—"})`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;background:#F7F9FB;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #DDE6ED">
    <div style="background:#26374D;color:#FFFFFF;padding:20px 24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.75">New brief</div>
      <div style="font-size:20px;margin-top:6px">${esc(lead.name)}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">${table}</table>
    <div style="padding:0 24px 24px">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#536D82;margin-bottom:8px">Project description</div>
      <div style="white-space:pre-wrap;color:#1A1A2E;font-size:14px;line-height:1.7;border-inline-start:2px solid #DDE6ED;padding-inline-start:12px">${esc(lead.description)}</div>
    </div>
  </div>
</div>`,
    });

    if (error) {
      console.error("resend error", error);
      return json({ error: "send_failed" }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("notify-lead failed", err);
    return json({ error: "unexpected_error" }, 500);
  }
});
