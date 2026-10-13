import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  useLocation,
} from "react-router";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { Route } from "./+types/root";
import "./index.css";

const SITE = "https://moalagab.art";
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;

const isEnglish = (pathname: string) => pathname === "/en" || pathname.startsWith("/en/");

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE}/#person`,
    name: "Mohammed Alagab",
    alternateName: ["محمد العجب", "Mo Alagab"],
    url: SITE,
    image: { "@type": "ImageObject", url: `${SITE}/og.png`, width: 1200, height: 630 },
    jobTitle: ["Brand Designer", "AI Product Builder"],
    description: "Brand Designer and AI Product Builder based in Riyadh.",
    knowsAbout: ["Brand and Visual Design", "Digital Products", "AI Automation", "Experiential Design"],
    worksFor: { "@type": "Organization", name: "Mohammed Alagab Design Studio", url: SITE },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Riyadh",
      addressRegion: "Riyadh Province",
      addressCountry: "SA",
    },
    email: "mo@moalagab.art",
    telephone: "+966561167169",
    sameAs: [
      "https://www.behance.net/ma_alagab",
      "https://www.linkedin.com/in/moalagab",
      "https://wa.me/966561167169",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: SITE,
    name: "Mohammed Alagab — Brand Designer & AI Product Builder",
    alternateName: "محمد العجب — مصمم علامات وباني منتجات AI",
    description: "Brand, digital product, AI automation, and experiential design portfolio.",
    publisher: { "@id": `${SITE}/#person` },
    inLanguage: ["ar", "en"],
  },
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE}/#service`,
    name: "Mohammed Alagab Design Studio",
    image: `${SITE}/og.png`,
    url: SITE,
    telephone: "+966561167169",
    email: "mo@moalagab.art",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Riyadh",
      addressRegion: "Riyadh Province",
      addressCountry: "SA",
    },
    geo: { "@type": "GeoCoordinates", latitude: "24.7136", longitude: "46.6753" },
    areaServed: ["Saudi Arabia", "GCC", "Oman", "Sudan"],
    serviceType: ["Brand & Visual", "Digital Products", "AI Automation", "Experiential Design"],
    founder: { "@id": `${SITE}/#person` },
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const en = isEnglish(pathname);

  return (
    <html lang={en ? "en" : "ar"} dir={en ? "ltr" : "rtl"}>
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
        <meta name="author" content="Mohammed Alagab" />
        <meta name="google-site-verification" content="HJy-urXUHXmTT2zl6tZVu49TV41KbCGxMhRKe-rnjus" />
        <meta name="theme-color" content="#26374D" />
        <meta property="og:site_name" content="Mohammed Alagab Portfolio" />
        <meta property="og:locale" content={en ? "en_US" : "ar_SA"} />
        <meta property="og:locale:alternate" content={en ? "ar_SA" : "en_US"} />
        <meta property="og:image" content={`${SITE}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE}/og.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preload" href="/fonts/LamaSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/LamaSans-Bold.woff2" as="font" type="font/woff2" crossOrigin="" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {UMAMI_WEBSITE_ID && (
          <script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id={UMAMI_WEBSITE_ID}
            data-domains="moalagab.art,www.moalagab.art"
          />
        )}
      </head>
      <body>
        {children}
        {__ON_VERCEL__ && <SpeedInsights />}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div className="route-loading" role="status">
      <title>Mo Alagab</title>
      <meta name="robots" content="noindex" />
      <span>MO /</span>
      <span className="sr-only">Loading / جارٍ التحميل</span>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong / حدث خطأ";
  if (import.meta.env.DEV && error instanceof Error) console.error(error);
  return (
    <main className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold">{message}</h1>
        <a className="mt-6 inline-block underline" href="/">
          moalagab.art
        </a>
      </div>
    </main>
  );
}
