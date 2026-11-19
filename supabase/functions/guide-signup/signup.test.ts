import { assertEquals } from "jsr:@std/assert@1";
import { parseSignup } from "./signup.ts";

const valid = {
  email: " Sara@Example.com ",
  name: "",
  role: "Marketing lead",
  consent: true,
  utm_source: "linkedin",
  utm_medium: null,
  utm_campaign: "",
  page_referrer: "",
  website: "",
  turnstileToken: "token",
};

Deno.test("accepts a valid signup and normalises fields", () => {
  const result = parseSignup(valid);
  if (result.kind !== "ok") throw new Error(`expected ok, got ${result.kind}`);
  assertEquals(result.signup.email, "sara@example.com");
  assertEquals(result.signup.name, null);
  assertEquals(result.signup.utm_campaign, null);
  assertEquals(result.token, "token");
});

Deno.test("rejects a signup without consent", () => {
  assertEquals(parseSignup({ ...valid, consent: false }).kind, "invalid");
});

Deno.test("rejects a malformed email", () => {
  assertEquals(parseSignup({ ...valid, email: "not-an-email" }).kind, "invalid");
});

Deno.test("treats a filled honeypot as spam", () => {
  assertEquals(parseSignup({ ...valid, website: "http://spam" }).kind, "spam");
});
