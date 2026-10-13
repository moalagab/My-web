import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// The local static server sends no headers, so apply the production CSP from
// vercel.json to every HTML response and fail on any violation.
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const csp: string = vercel.headers
  .flatMap((h: { headers: { key: string; value: string }[] }) => h.headers)
  .find((h: { key: string }) => h.key === "Content-Security-Policy").value
  .replace("upgrade-insecure-requests", "");

for (const path of ["/", "/en/work", "/work/logofolio-2", "/services/brand", "/en/start?service=brand", "/admin"]) {
  test(`no CSP violations on ${path}`, async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (m) => /Content Security Policy/.test(m.text()) && violations.push(m.text()));
    await page.route("**/*", async (route) => {
      if (route.request().resourceType() !== "document") return route.continue();
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), "content-security-policy": csp },
      });
    });
    await page.goto(path);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState("networkidle");
    expect(violations).toEqual([]);
  });
}
