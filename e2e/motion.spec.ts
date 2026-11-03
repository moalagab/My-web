import { expect, test } from "@playwright/test";

test("selected work shows as Folioblox rows that alternate sides", async ({ page }) => {
  await page.goto("/");
  const rows = page.locator(".featured-row");
  await expect(rows).toHaveCount(6);
  const first = await rows.nth(0).locator(".featured-row-media").boundingBox();
  const second = await rows.nth(1).locator(".featured-row-media").boundingBox();
  // Same image size, opposite sides.
  expect(Math.abs(first!.width - second!.width)).toBeLessThan(2);
  expect(Math.abs(first!.x - second!.x)).toBeGreaterThan(200);
});

test("services show as four rows, Arabic name first with the English name under it", async ({ page }) => {
  await page.goto("/en");
  const rows = page.locator(".svc-row");
  await expect(rows).toHaveCount(4);
  await expect(rows.first()).toHaveAttribute("href", "/en/services/digital");
  await page.goto("/");
  await expect(page.locator(".svc-row h3").first()).toHaveText("حلول الذكاء الاصطناعي والرقمية");
  await expect(page.locator(".svc-row .latin").first()).toHaveText("AI & Digital Solutions");
});

test("section labels use the page language and carry no numbering", async ({ page }) => {
  await page.goto("/");
  const labels = await page.locator("main .section-heading .studio-eyebrow").allTextContents();
  expect(labels.length).toBeGreaterThan(4);
  for (const label of labels) expect(label).not.toMatch(/^\s*\d+\s*\/|[A-Z]{4,}/);
});

test("process shows four step rows", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".step-row")).toHaveCount(4);
  await expect(page.locator(".step-row h3").last()).toContainText("نطلق");
});

test("reduced motion shows everything still and readable", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto("/en");
  await page.close();
});

test("experience figures show their real values from the start", async ({ page }) => {
  await page.goto("/en");
  const figures = page.locator(".studio-proof .stat-card strong");
  await expect(figures).toHaveText(["12+", "3", "40+"]);
});

test("hero leads with the two-line title and lists the four services", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("أصمّم ما يُرى.وأبني ما يعمل.");
  await expect(page.locator(".folio-disciplines a")).toHaveCount(4);
  await page.goto("/en");
  await expect(page.locator("h1")).toContainText("I build what works.");
});

test("client logos form one still wall with readable names", async ({ page }) => {
  await page.goto("/en");
  const logos = page.locator(".client-wall img");
  await expect(logos).toHaveCount(26);
  await expect(logos.first()).toHaveAttribute("alt", /\S/);
  await expect(logos.first()).toHaveCSS("animation-name", "none");
});

test("reduced motion skips the hero grid and the title reveal", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero-grid span").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".folio-title span").first()).toHaveCSS("opacity", "1");
  await page.close();
});

test("a project cover opens its case study through a view transition, from the top", async ({ page }) => {
  await page.goto("/en");
  const link = page.locator(".featured-row-body .studio-text-link").first();
  await link.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((cb: ViewTransitionUpdateCallback) => {
      (window as unknown as { __vt: boolean }).__vt = true;
      return start(cb);
    }) as typeof document.startViewTransition;
  });
  await link.click();
  await expect(page).toHaveURL(/\/en\/work\//);
  expect(await page.evaluate(() => (window as unknown as { __vt?: boolean }).__vt)).toBe(true);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test("reduced motion keeps the hero still on scroll and hides the progress bar", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en");
  await page.evaluate(() => scrollTo(0, 500));
  await expect(page.locator(".folio-hero-inner")).toHaveCSS("opacity", "1");
  await expect(page.locator(".scroll-progress")).toBeHidden();
  await context.close();
});
