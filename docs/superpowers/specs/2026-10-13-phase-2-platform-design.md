# Phase 2 — Prerendered platform, SEO, analytics, hosting, CI

Date: 2026-10-13 · Status: approved by Mo (chat, 2026-10-12: "نفذ المرحلة ٢")

## Problem

The site is a client-only SPA. Crawlers and AI assistants receive an empty `index.html` with one generic title; per-page titles, descriptions and canonicals only exist after JavaScript runs. Analytics (GA4) needs a consent banner. The site is not hosted anywhere (`moalagab.art` serves nothing). There is no CI.

## Goals

- Every public route in Arabic and English ships as static HTML with its own `<title>`, description, canonical, `hreflang` (ar, en, x-default) and Open Graph tags, readable without JavaScript.
- Structured data: Person, WebSite, ProfessionalService site-wide; CreativeWork per case study; BreadcrumbList where breadcrumbs render.
- Sitemap generated from the route list, never hand-edited. `llms.txt` describes the site for AI assistants.
- Cookieless analytics (Umami); GA4 and the consent banner are removed.
- Hosted on Vercel with security headers; preview URL per PR.
- CI on every PR: typecheck, lint, unit tests (Deno), build, Playwright smoke tests, Lighthouse report.

Non-goals: performance tuning (phase 3), copy/UX changes (phase 4), custom-domain DNS cutover without Mo's go-ahead.

## Design

### Framework mode with prerender

- Upgrade to React 19 so `<title>`, `<meta>` and `<link>` rendered by a page are hoisted into `<head>`, including during prerender. `react-helmet-async` is removed; pages use a small `PageMeta` component (title, description, og/twitter title+description, optional og:type).
- React Router 7.12 framework mode: `@react-router/dev` Vite plugin, `appDirectory: "src"`, `ssr: false`, explicit `prerender` list.
- `src/root.tsx`: document `Layout` (`<html lang dir>` from the URL, site-wide meta, favicons, font preloads, JSON-LD, canonical + hreflang computed from the pathname), providers (QueryClient, Tooltip, toasters), `ErrorBoundary`, `HydrateFallback`.
- `src/routes.ts`: one layout route per language (`/` Arabic, `/en` English) that provides `LanguageProvider` + `PageTransition`; each page module is registered twice with distinct ids. `/admin` and `/auth` sit outside the language layouts. Legacy redirects (`/services/request`, `/book`, `/contact`, `/ar/*`) stay client-side.
- Prerendered: home, about, services, start, privacy, work, products and every `/work/:slug`, in both languages (36 paths for 15 projects; exact count comes from the project list). Not prerendered (SPA fallback): admin, auth, styleguide, redirects, 404.
- Browser-only code must not run during prerender: Supabase client stops passing `localStorage` explicitly (the library picks storage itself); the PDF viewer stays lazy and client-only.

### SEO artefacts

- `buildEnd` hook writes `sitemap.xml` (with `xhtml:link` alternates) from the prerender list; `public/sitemap.xml` is deleted.
- `public/llms.txt`: who Mo is, service lines, key pages in both languages.
- The WebSite JSON-LD drops its `SearchAction` (the site has no search).

### Analytics

`src/lib/analytics.ts` keeps the same `track(event, params)` API but sends to Umami (`window.umami.track`). The Umami script loads only when `VITE_UMAMI_WEBSITE_ID` is set and the host is not localhost; Umami tracks route changes itself. `ConsentBanner`, the footer "cookie settings" button and all GA code are removed; privacy copy is updated to say analytics are cookieless and anonymous.

### Hosting (Vercel)

`vercel.json`: build `npm run build`, output `build/client`, unmatched paths rewrite to `/__spa-fallback.html`, long-cache immutable assets, and headers: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`, and a CSP that allows only self, Supabase, Cloudflare Turnstile and Umami (`script-src` keeps `'unsafe-inline'` because framework hydration emits inline scripts on static hosting). Environment variables (all public): Supabase URL + publishable key, Turnstile site key, Umami website id.

Domain cutover (Hostinger DNS → Vercel) happens only after Mo approves the preview.

### CI (GitHub Actions)

One workflow on PRs and pushes to `main`: `npm ci`, `react-router typegen`, `tsc`, `eslint`, `deno test`, build, Playwright against the built `build/client` (static server with SPA fallback), Lighthouse CI on `/` and `/en` with warn-level budgets (phase 3 turns them into hard gates).

Playwright smoke tests: raw HTML of `/` and `/en` contains the right `lang`/`dir`, title, canonical and hreflang; every prerendered page has exactly one `<h1>`; `/start` renders step 1; no horizontal scroll at 375 px on home and work; `/admin` renders the login form via SPA fallback.

## Manual steps for Mo

1. Umami Cloud account → add website `moalagab.art` → give me the Website ID (public).
2. Approve linking the repo to a Vercel project under the `moalagab` account.
3. After approving the preview: approve the DNS change in Hostinger (A `@` → Vercel, CNAME `www` → Vercel).

## Testing

- `react-router build` produces HTML for every listed path; spot-check raw HTML of `/`, `/en/work/<slug>`.
- Playwright suite and Lighthouse locally, then in CI on the PR.
- Browser check of hydration (no console errors), language switch, form flow, admin login screen.
