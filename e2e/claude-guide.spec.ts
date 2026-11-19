import { expect, test } from "@playwright/test";

test("claude guide lists, filters and offers the PDF", async ({ page }) => {
  await page.goto("/claude-guide");
  await expect(page.locator("h1")).toHaveText("دليل مهارات كلود");
  await expect(page.locator("#count")).toContainText("636");
  await page.locator("#q").fill("systematic-debugging");
  await expect(page.locator(".card h4", { hasText: "systematic-debugging" }).first()).toBeVisible();
  const pdf = await page.request.get("/claude-guide/claude-skills-guide.pdf");
  expect(pdf.headers()["content-type"]).toContain("pdf");
});

test("claude guide signup asks for consent before sending", async ({ page }) => {
  await page.goto("/claude-guide");
  await page.locator("#su-email").fill("someone@example.com");
  await page.locator("#su-btn").click();
  await expect(page.locator("#su-msg")).toContainText("توافق");
});
