import { expect, test, type Page } from "@playwright/test";

const scrollToFraction = async (page: Page, selector: string, fraction: number) => {
  await page.locator(selector).evaluate((el, f) => {
    const top = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top: top + (el.scrollHeight - window.innerHeight) * f, behavior: "instant" });
  }, fraction);
};

test("selected work cards stack as you scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".stack-card")).toHaveCount(6);
  const first = page.locator(".stack-card").first();
  await first.evaluate((el) => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + el.offsetHeight, behavior: "instant" }));
  await expect.poll(() => first.evaluate((el) => Number(el.style.getPropertyValue("--cover")))).toBeGreaterThan(0.3);
});

test("services pin a number that follows the active service", async ({ page }) => {
  await page.goto("/en");
  await page.locator(".svc-block").nth(2).evaluate((el) =>
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.45, behavior: "instant" }),
  );
  await expect(page.locator(".svc-digit")).toHaveText("3");
  await expect(page.locator(".svc-block").nth(2)).toHaveClass(/is-in/);
});

test("process steps advance with scroll", async ({ page }) => {
  await page.goto("/");
  await scrollToFraction(page, ".proc-track", 0.8);
  await expect(page.locator(".proc-card.is-active h3")).toHaveText("نطلق");
});

test("reduced motion shows everything still and readable", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect(page.locator(".stack-card").first()).toHaveCSS("position", "relative");
  for (const card of await page.locator(".proc-card").all()) await expect(card).toHaveCSS("opacity", "1");
  await expect(page.locator(".word-reveal span").first()).toHaveCSS("opacity", "1");
  await page.close();
});

test("proof numbers count up when the strip comes into view", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.goto("/en");
  const strip = page.locator(".studio-proof");
  await expect(strip).toHaveAttribute("data-proof", "waiting");
  await strip.scrollIntoViewIfNeeded();
  await expect(strip).toHaveAttribute("data-proof", "in");
  await expect(strip.locator("strong span[aria-hidden]").last()).toHaveText("40+");
  // The real value is always in the DOM for readers.
  await expect(strip.locator("strong .sr-only").first()).toHaveText("12+");
});
