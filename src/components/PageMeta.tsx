import { useLocation } from "react-router";

const SITE = "https://moalagab.art";

type PageMetaProps = {
  title: string;
  description?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

/**
 * Per-page head tags. React 19 hoists these into <head>, including in the
 * prerendered HTML. Indexable pages also get canonical and hreflang links,
 * so the SPA fallback and noindex pages never carry them.
 */
export default function PageMeta({ title, description, type = "website", noindex }: PageMetaProps) {
  const { pathname } = useLocation();
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const en = trimmed === "/en" || trimmed.startsWith("/en/");
  const page = en ? trimmed.slice(3) : trimmed === "/" ? "" : trimmed;
  const ar = `${SITE}${page || "/"}`;
  const canonical = en ? `${SITE}/en${page}` : ar;

  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <>
          <link rel="canonical" href={canonical} />
          <meta property="og:url" content={canonical} />
          <link rel="alternate" hrefLang="ar" href={ar} />
          <link rel="alternate" hrefLang="en" href={`${SITE}/en${page}`} />
          <link rel="alternate" hrefLang="x-default" href={ar} />
        </>
      )}
    </>
  );
}
