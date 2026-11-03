import { expect, test } from "@playwright/test";

test("hero frames follow the scroll and light up the service paths", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator(".hero-visual canvas");
  await expect(canvas).toHaveAttribute("data-frame", "1");
  const travel = await page.locator(".hero-spacer").evaluate((el) => el.getBoundingClientRect().height);

  await page.mouse.wheel(0, travel * 0.6);
  await expect.poll(async () => Number(await canvas.getAttribute("data-frame"))).toBeGreaterThan(40);
  await expect(page.locator(".studio-hero")).toHaveAttribute("data-path", /^[0-3]$/);

  await page.mouse.wheel(0, travel);
  await expect(canvas).toHaveAttribute("data-frame", "96");
  await expect(page.locator(".studio-hero")).toHaveAttribute("data-path", "all");
});

test("reduced motion shows a still and does not pin the hero", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.locator(".hero-track")).toHaveAttribute("data-still", "");
  await expect(page.locator(".hero-spacer")).toBeHidden();
  await expect(page.locator(".studio-hero")).toHaveCSS("position", "relative");
  const src = await page.locator(".hero-visual img").evaluate((img: HTMLImageElement) => img.currentSrc);
  expect(src).toMatch(/\/hero\/desktop\/096\.(avif|webp)$/);
  await page.close();
});

test("phones get the portrait frame set", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("/");
  const src = await page.locator(".hero-visual img").evaluate((img: HTMLImageElement) => img.currentSrc);
  expect(src).toMatch(/\/hero\/mobile\/001\.(avif|webp)$/);
  await expect(page.locator(".hero-visual canvas")).toHaveAttribute("data-frame", "1");
  await page.close();
});
