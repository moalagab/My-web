import { expect, test } from "@playwright/test";

const SITE = "https://moalagab.art";

const head = (html: string) => ({
  htmlTag: html.match(/<html[^>]*>/)?.[0] ?? "",
  titles: [...html.matchAll(/<title>(.*?)<\/title>/g)].map((m) => m[1]),
  canonical: [...html.matchAll(/rel="canonical" href="([^"]+)"/g)].map((m) => m[1]),
  hreflang: Object.fromEntries(
    [...html.matchAll(/hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]),
  ),
  h1: (html.match(/<h1[\s>]/g) ?? []).length,
  jsonLd: [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(
    (m) => JSON.parse(m[1]),
  ),
});

// Raw HTML, no JavaScript: what crawlers and AI assistants receive.
const cases = [
  { path: "/", lang: "ar", dir: "rtl", canonical: `${SITE}/`, page: "" },
  { path: "/en", lang: "en", dir: "ltr", canonical: `${SITE}/en`, page: "" },
  {
    path: "/en/work/waselny",
    lang: "en",
    dir: "ltr",
    canonical: `${SITE}/en/work/waselny`,
    page: "/work/waselny",
  },
];

for (const c of cases) {
  test(`prerendered head for ${c.path}`, async ({ request }) => {
    const html = await (await request.get(c.path)).text();
    const h = head(html);
    expect(h.htmlTag).toContain(`lang="${c.lang}"`);
    expect(h.htmlTag).toContain(`dir="${c.dir}"`);
    expect(h.titles).toHaveLength(1);
    expect(h.titles[0].length).toBeGreaterThan(5);
    expect(h.canonical).toEqual([c.canonical]);
    expect(h.hreflang).toEqual({
      ar: `${SITE}${c.page || "/"}`,
      en: `${SITE}/en${c.page}`,
      "x-default": `${SITE}${c.page || "/"}`,
    });
    expect(h.jsonLd.length).toBeGreaterThan(0);
  });
}

test("every sitemap page is prerendered with one h1 and a canonical", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(urls.length).toBeGreaterThanOrEqual(30);
  for (const url of urls) {
    const path = url.replace(SITE, "") || "/";
    const html = await (await request.get(path)).text();
    const h = head(html);
    expect.soft(h.h1, `${path} h1 count`).toBe(1);
    expect.soft(h.canonical, `${path} canonical`).toEqual([url]);
  }
});

test("case studies carry CreativeWork structured data", async ({ request }) => {
  const html = await (await request.get("/work/waselny")).text();
  const types = head(html).jsonLd.flatMap((d) => (Array.isArray(d) ? d : [d])).map((d) => d["@type"]);
  expect(types).toEqual(expect.arrayContaining(["Person", "CreativeWork", "BreadcrumbList"]));
});

test("unknown paths fall back with noindex and no canonical", async ({ request }) => {
  const html = await (await request.get("/no-such-page")).text();
  const h = head(html);
  expect(h.canonical).toEqual([]);
  expect(html).toContain('name="robots" content="noindex"');
});

test("llms.txt and robots.txt are served", async ({ request }) => {
  expect(await (await request.get("/llms.txt")).text()).toContain("Mohammed Alagab");
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://moalagab.art/sitemap.xml");
});

test("service pages answer buyer questions with Service and FAQPage data", async ({ request }) => {
  for (const path of ["/services/brand", "/en/services/ai"]) {
    const html = await (await request.get(path)).text();
    const h = head(html);
    const types = h.jsonLd.flatMap((d) => (Array.isArray(d) ? d : [d])).map((d) => d["@type"]);
    expect(types, path).toEqual(expect.arrayContaining(["Service", "FAQPage", "BreadcrumbList"]));
    const faq = h.jsonLd.flat().find((d) => d["@type"] === "FAQPage");
    expect(faq.mainEntity.length, path).toBeGreaterThanOrEqual(7);
    // Answers must be visible text in the HTML, not only in JSON-LD.
    expect(html).toContain(faq.mainEntity[0].acceptedAnswer.text.slice(0, 40));
  }
});

test("FAQ page ships FAQPage data in both languages", async ({ request }) => {
  for (const path of ["/faq", "/en/faq"]) {
    const h = head(await (await request.get(path)).text());
    const faq = h.jsonLd.flat().find((d) => d["@type"] === "FAQPage");
    expect(faq?.mainEntity.length, path).toBeGreaterThanOrEqual(10);
  }
});
