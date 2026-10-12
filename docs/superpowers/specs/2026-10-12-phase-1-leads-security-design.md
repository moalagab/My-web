# Phase 1 — Lead pipeline, security, cleanup

Date: 2026-10-12 · Status: approved by Mo (chat, 2026-10-12)

## Problem

1. `/start` writes to `leads`, but `/admin` reads the retired `service_requests` table, so new leads never show in the dashboard.
2. The email alert (`notify-lead`) is fire-and-forget from the browser, sends from `onboarding@resend.dev` (Resend sandbox, delivers only to the Resend account owner), and anyone holding the public key can call it directly to flood the inbox.
3. `notify-service-request` has `verify_jwt = false`, takes the recipient from the request body, and injects unescaped input into HTML.
4. `/auth` offers public sign-up.
5. Dead assets, components, QA artefacts and Lovable leftovers; 8 lint errors.

## Goals

- Every valid brief is stored and Mo is told about it, or the visitor sees an honest error.
- The browser can no longer write to `leads` or trigger email directly.
- Admin shows `leads` with a pipeline status.
- `npm run lint`, `tsc` and `build` pass with zero errors.

Non-goals (later phases): prerender/SEO, analytics swap, performance, copy and UX changes, removing unused shadcn components.

## Design

### `submit-lead` edge function (single write path)

`POST /functions/v1/submit-lead`, `verify_jwt = false` (Turnstile is the gate; publishable keys are not JWTs).

1. CORS: echo `Origin` only if it is in `ALLOWED_ORIGINS` (comma-separated env). Otherwise 403.
2. Parse body with Zod (`lead.ts`, pure and unit-tested): field lengths mirror the form (name 2–120, email, whatsapp optional pattern, service_line/budget/timeline required ≤120, description 30–1500, links ≤1000, consent must be `true`, locale `ar|en`, utm/referrer ≤300, honeypot `website`, `turnstileToken`). Invalid → 400 `invalid_payload`.
3. Honeypot filled → 200 `{ok:true}` without storing (bots see success).
4. Verify Turnstile token with `TURNSTILE_SECRET_KEY` and the caller IP. Fail → 400 `captcha_failed`. Missing secret → 500 (fail closed).
5. Insert with the service-role client. The existing `leads_rate_limit` trigger raising `rate_limit_exceeded` → 429 `rate_limited`. Other DB error → 500.
6. Email via Resend: from `RESEND_FROM`, to `LEAD_NOTIFY_EMAIL`, `reply_to` = lead email, all values HTML-escaped (`& < > " '`). Email failure is logged and returns 200 `{ok:true, notified:false}` because the lead is already saved and visible in admin.

### Database migration

- `leads.status text not null default 'new'` with check `in ('new','contacted','proposal','closed')`, plus index on `(status, created_at desc)`.
- Drop policy "Anyone can submit a lead"; revoke `INSERT` on `leads` from `anon`. Only the service role writes new leads.
- `service_requests` is left in place (may hold old data); nothing reads it.

### Frontend

- `Turnstile` component: loads Cloudflare's script once, renders explicitly on step 3 in the page language, reports token/expiry. Site key from `VITE_TURNSTILE_SITE_KEY`.
- `StartPage` submits through `supabase.functions.invoke('submit-lead')` and maps `rate_limited` → existing rate-limit copy, `captcha_failed` → new copy, else generic copy. Keeps the client-side honeypot/time check.
- `AdminDashboard` reads `leads`, shows counts per status, a status filter, a status select per row (updates `leads.status` under existing admin RLS), and a detail dialog with email/WhatsApp actions.
- `/auth` redirects to `/admin` (which already has its own login); `AuthPage` is deleted, removing sign-up.
- Supabase client uses default `localStorage` (Lovable preview auth broker removed).

### Cleanup

Delete: `notify-lead`, `notify-service-request` (and its `config.toml` entry), unused components (`CustomCursor`, `SpaceParticles`, `LoadingScreen`, `MagneticButton`, `TextReveal`, `ScrollReveal`, `NavLink`), `previewAuthStorage.ts`, `lovable-tagger`, and the stale `bun.lockb` (Vercel would pick bun over npm). Rename package to `mo-alagab-site`. Fix all lint errors.

Kept on purpose: `previews/`, the root QA JSON files and the unused portrait iterations. `DESIGN-NOTES.md` cites them as the design record, and none of them ship in the bundle.

## Manual steps for Mo (cannot be done from code)

1. Resend: verify `moalagab.art` (SPF/DKIM/DMARC DNS records).
2. Cloudflare Turnstile: create a widget for `moalagab.art` (+ `localhost`), get site + secret keys.
3. Supabase: `supabase secrets set RESEND_API_KEY TURNSTILE_SECRET_KEY RESEND_FROM LEAD_NOTIFY_EMAIL ALLOWED_ORIGINS`, `supabase db push`, `supabase functions deploy submit-lead`, `supabase functions delete notify-lead notify-service-request`.
4. Supabase Auth settings: disable "Allow new users to sign up".
5. `.env`: add `VITE_TURNSTILE_SITE_KEY`.

Deploy order matters: function + secrets first, then migration (which removes anon insert), then the frontend.

## Testing

- `deno test` for `lead.ts`: valid payload, each invalid field, honeypot, HTML escaping.
- `tsc`, `eslint`, `vite build` clean.
- Browser: `/start` renders Turnstile (Cloudflare test site key `1x00000000000000000000AA`), step flow works in AR/EN, error copy shows on failure; `/admin` login screen renders; `/auth` redirects.
- End-to-end submit against the real project once Mo's `.env` and secrets are in place.
