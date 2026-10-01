# Roadmap

- [x] Audit current routes, content, portfolio data, and reusable components
- [x] Replace the visual system and shared navigation/footer patterns
- [x] Rebuild Arabic-first and English page structure around four service lines
- [x] Add /start project brief flow and route every page toward it
- [x] Reuse existing proof assets and remove unsupported claims
- [x] Update metadata, canonicals, sitemap, and language routing
- [x] Verify desktop/mobile, RTL/LTR, forms, and links

## New brand foundation
- [x] Replace design tokens, spacing, radius, fonts, gradients, and shadows
- [x] Centralize bilingual system copy and route language metadata
- [x] Rebuild Header, Footer, Button, Eyebrow, Section, Card, Pill, and FlowMotif
- [x] Add temporary Products and bilingual Style Guide pages
- [x] Convert active directional styling and add accessibility foundation
- [x] Verify AR/EN desktop/mobile style guide and navigation

## Homepage rebuild
- [x] Add all Arabic and English homepage copy to the i18n dictionary
- [x] Build the nine homepage sections in the requested order
- [x] Reuse six portfolio images and the existing portrait
- [x] Render approved client logos only when `/public/clients` contains files
- [x] Verify `/` and `/en` on desktop and at 375px

## Work page and case studies
- [x] Single typed data file at `src/content/projects.ts` with all case-study fields
- [x] `/work` and `/en/work` with service-line filter pills and card grid
- [x] `/work/[slug]` case study: hero, summary strip, seven sections, gallery lightbox
- [x] Similar-project block linking the matching package and `/start?service=<line>`
- [x] Migrate existing portfolio items (WebP images) with placeholders for unknown fields

## Services page
- [x] Four anchored service-line sections (brand, digital, ai, experiential) from the i18n dictionary
- [x] Package cards with scope, timeline, fit line, and `/start?service=&package=` button (no prices)
- [x] "What's not included" note per line
- [x] Related case-study card per line (shown only where a published project exists)
- [x] Brief form pre-selects the service line and package from the link
