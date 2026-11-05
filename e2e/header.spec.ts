import { expect, test } from "@playwright/test";

test("services dropdown opens on hover and by keyboard, Escape closes it", async ({ page }) => {
  await page.goto("/en");
  const trigger = page.locator(".nav-services > button");
  const panel = page.locator(".nav-dropdown");
  await trigger.hover();
  await expect(panel).toBeVisible();
  await expect(panel.locator("li a")).toHaveCount(4);
  await page.mouse.move(700, 600);
  await expect(panel).toBeHidden();

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("language pill switches to the other language on the same page", async ({ page }) => {
  await page.goto("/services");
  await page.locator(".nav-actions .nav-pill--outline").click();
  await expect(page).toHaveURL(/\/en\/services$/);
});

test("phone menu expands with large links and closes with Escape", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("/");
  const burger = page.locator(".nav-burger");
  await expect(page.locator(".nav-links")).toBeHidden();
  await burger.click();
  await expect(page.locator(".nav-mobile li a")).toHaveCount(4);
  await expect(page.locator(".nav-mobile")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".nav-mobile")).toBeHidden();
  await page.close();
});
