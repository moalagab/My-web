import { expect, test, type Page } from "@playwright/test";

/**
 * The router restores scroll when hydration finishes, which can undo a scroll
 * made just before it. Re-apply the scroll on every poll until the effect shows.
 */
const scrollUntil = async (page: Page, scroll: () => Promise<unknown>, done: () => Promise<boolean>) => {
  await expect.poll(async () => {
    await scroll();
    await page.waitForTimeout(150);
    return done();
  }, { timeout: 10_000 }).toBe(true);
};

const scrollToFraction = (page: Page, selector: string, fraction: number) =>
  page.locator(selector).evaluate((el, f) => {
    const top = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top: top + (el.scrollHeight - window.innerHeight) * f, behavior: "instant" });
  }, fraction);

test("selected work cards stack as you scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".stack-card")).toHaveCount(6);
  const first = page.locator(".stack-card").first();
  const list = page.locator(".stack");
  await scrollUntil(
    page,
    () => list.evaluate((el) => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + 600, behavior: "instant" })),
    async () => (await first.evaluate((el) => Number(el.style.getPropertyValue("--cover")))) > 0.3,
  );
});

test("services pin a number that follows the active service", async ({ page }) => {
  await page.goto("/en");
  await scrollUntil(
    page,
    () => page.locator(".svc-block").nth(2).evaluate((el) =>
      // Top at 30% of the viewport: well inside the 40–45% band that marks the active service.
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.3, behavior: "instant" }),
    ),
    async () =>
      (await page.locator(".svc-digit").textContent()) === "3" &&
      /is-in/.test((await page.locator(".svc-block").nth(2).getAttribute("class")) ?? ""),
  );
});

test("process steps advance with scroll", async ({ page }) => {
  await page.goto("/");
  await scrollUntil(
    page,
    () => scrollToFraction(page, ".proc-track", 0.8),
    async () => (await page.locator(".proc-card.is-active h3").textContent()) === "نطلق",
  );
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
  await scrollUntil(
    page,
    () => strip.scrollIntoViewIfNeeded(),
    async () => (await strip.getAttribute("data-proof")) === "in",
  );
  await expect(strip.locator("strong span[aria-hidden]").last()).toHaveText("40+");
  // The real value is always in the DOM for readers.
  await expect(strip.locator("strong .sr-only").first()).toHaveText("12+");
});

test("hero leads with the two-line title and lists the four services", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("أصمّم ما يُرى.وأبني ما يعمل.");
  await expect(page.locator(".folio-disciplines a")).toHaveCount(4);
  await page.goto("/en");
  await expect(page.locator("h1")).toContainText("I build what works.");
});

test("client logos drift and have readable names once", async ({ page }) => {
  await page.goto("/en");
  const named = page.locator(".marquee-row:not([aria-hidden]) img");
  await expect(named).toHaveCount(26);
  await expect(named.first()).toHaveAttribute("alt", /\S/);
  await expect(page.locator(".marquee-track")).toHaveCSS("animation-name", "marquee");
});

test("reduced motion skips the hero reveal and stops the logos", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".marquee-track")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".folio-title span").first()).toHaveCSS("opacity", "1");
  await page.close();
});
