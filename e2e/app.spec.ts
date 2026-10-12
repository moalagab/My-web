import { expect, test } from "@playwright/test";

test("hydrates without console errors and switches language", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.locator('a[href="/en"]').first().click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://moalagab.art/en");
  expect(errors).toEqual([]);
});

test("start form shows step 1", async ({ page }) => {
  await page.goto("/en/start");
  await expect(page.locator("#name")).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
});

test("admin login renders through the SPA fallback", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page).toHaveTitle(/لوحة التحكم/);
});

test("legacy paths redirect to the brief form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page).toHaveURL(/\/start$/);
});

for (const path of ["/", "/en", "/work", "/en/start"]) {
  test(`no horizontal scroll at 375px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
