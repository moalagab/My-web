import type { Config } from "@react-router/dev/config";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { writeImageVariants } from "./scripts/image-variants.mjs";

const SITE = "https://moalagab.art";

// Read slugs as text so the config does not import image assets.
const projectSlugs = [
  ...readFileSync(path.resolve("src/content/projects.ts"), "utf8").matchAll(
    /^\s{4}slug: "([^"]+)"/gm,
  ),
].map((match) => match[1]);

// Service line slugs come from the dictionary, which both languages share.
const serviceSlugs = (
  JSON.parse(readFileSync(path.resolve("src/i18n/en.json"), "utf8")) as {
    servicesPage: { lines: { slug: string }[] };
  }
).servicesPage.lines.map((line) => line.slug);

const pages = ["", "/about", "/services", "/start", "/privacy", "/work", "/products", "/faq"];
const localized = [
  ...pages,
  ...serviceSlugs.map((slug) => `/services/${slug}`),
  ...projectSlugs.map((slug) => `/work/${slug}`),
];

/** Arabic lives at the root, English under /en. */
export const prerenderPaths = localized.flatMap((page) => [
  page || "/",
  `/en${page}`,
]);

const sitemap = () => {
  const entry = (page: string) => {
    const ar = `${SITE}${page || "/"}`;
    const en = `${SITE}/en${page}`;
    const alternates = [
      `<xhtml:link rel="alternate" hreflang="ar" href="${ar}"/>`,
      `<xhtml:link rel="alternate" hreflang="en" href="${en}"/>`,
      `<xhtml:link rel="alternate" hreflang="x-default" href="${ar}"/>`,
    ].join("");
    return [ar, en].map((loc) => `<url><loc>${loc}</loc>${alternates}</url>`).join("\n");
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${localized.map(entry).join("\n")}
</urlset>
`;
};

export default {
  appDirectory: "src",
  ssr: false,
  prerender: prerenderPaths,
  buildEnd: async ({ reactRouterConfig }) => {
    writeFileSync(
      path.join(reactRouterConfig.buildDirectory, "client", "sitemap.xml"),
      sitemap(),
    );
    await writeImageVariants(path.join(reactRouterConfig.buildDirectory, "client"));
  },
} satisfies Config;
