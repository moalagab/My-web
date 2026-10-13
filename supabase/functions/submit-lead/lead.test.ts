import { assertEquals } from "jsr:@std/assert@1";
import { allowedOrigin, escapeHtml, parseLead } from "./lead.ts";

const valid = {
  name: "Sara Ahmed",
  company: "",
  email: "Sara@Example.com ",
  whatsapp: "+966 50 123 4567",
  service_line: "Brand",
  package: null,
  budget: "10–25k",
  timeline: "1–3 months",
  description: "We need a full identity for a new coffee brand in Riyadh.",
  links: "",
  consent: true,
  locale: "ar",
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  page_referrer: "",
  website: "",
  turnstileToken: "token",
};

Deno.test("accepts a valid lead and normalises optional fields", () => {
  const result = parseLead(valid);
  if (result.kind !== "ok") throw new Error(`expected ok, got ${result.kind}`);
  assertEquals(result.lead.email, "sara@example.com");
  assertEquals(result.lead.company, null);
  assertEquals(result.lead.links, null);
  assertEquals(result.lead.page_referrer, null);
  assertEquals(result.token, "token");
  assertEquals("website" in result.lead, false);
});

Deno.test("keeps a valid heard_from and defaults a missing one to null", () => {
  const withSource = parseLead({ ...valid, heard_from: "linkedin" });
  if (withSource.kind !== "ok") throw new Error("expected ok");
  assertEquals(withSource.lead.heard_from, "linkedin");
  const without = parseLead(valid);
  if (without.kind !== "ok") throw new Error("expected ok");
  assertEquals(without.lead.heard_from, null);
});

Deno.test("treats a filled honeypot as spam", () => {
  assertEquals(parseLead({ ...valid, website: "http://spam" }).kind, "spam");
});

const invalidCases: Array<[string, Record<string, unknown>]> = [
  ["short name", { name: "S" }],
  ["bad email", { email: "nope" }],
  ["bad whatsapp", { whatsapp: "abc" }],
  ["missing service", { service_line: "" }],
  ["short description", { description: "too short" }],
  ["long description", { description: "x".repeat(1501) }],
  ["no consent", { consent: false }],
  ["unknown locale", { locale: "fr" }],
  ["missing token", { turnstileToken: "" }],
  ["unknown heard_from", { heard_from: "tiktok" }],
];

for (const [label, patch] of invalidCases) {
  Deno.test(`rejects ${label}`, () => {
    assertEquals(parseLead({ ...valid, ...patch }).kind, "invalid");
  });
}

Deno.test("rejects non-object bodies", () => {
  assertEquals(parseLead(null).kind, "invalid");
  assertEquals(parseLead("lead").kind, "invalid");
});

Deno.test("escapes HTML including quotes", () => {
  assertEquals(
    escapeHtml(`<a href="x" onclick='y'>&</a>`),
    "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;",
  );
  assertEquals(escapeHtml(null), "—");
});

Deno.test("allows only listed origins", () => {
  const list = "https://moalagab.art, http://localhost:5173";
  assertEquals(allowedOrigin("https://moalagab.art", list), "https://moalagab.art");
  assertEquals(allowedOrigin("https://evil.example", list), null);
  assertEquals(allowedOrigin(null, list), null);
});
