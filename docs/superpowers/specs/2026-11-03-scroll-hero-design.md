# Scroll-driven 3D hero — design

Approved by Mo on 2026-11-03.

## Goal

Replace the hero portrait with a 3D scene, rendered in Blender, that tells the headline "from idea to a working system" through the four service lines, and plays as the visitor scrolls.

## Concept: Idea → System

| Scroll | What happens |
|---|---|
| 0–15% | A glowing core (the idea) floats and breathes beside the headline. |
| 15–45% | The core splits and releases four modules that drift outward: a screen with a circuit grid (AI & Digital), an exhibition frame (Events), a mark with colour swatches (Brand), interlocking flow blocks (Operations). |
| 45–80% | The camera orbits; each module turns to face it in turn. |
| 80–100% | The modules lock together around the core into one structure, joined by lit lines. |

The scene is built by a script in `scripts/hero/` so it can be re-rendered without hand work.

## Technique: pre-rendered frame sequence

- Blender renders the frames headless (`blender -b -P scripts/hero/scene.py`).
- Background is the hero colour (`--primary`, #27384F) with the Standard view transform, so frames blend into the page.
- Desktop: 96 frames at 16:9, subject on the side opposite the copy (Arabic layout); English mirrors it with CSS, as the portrait does today.
- Phone (≤640px): 48 frames at 4:5, subject centred in the top area.
- Frames ship as AVIF (WebP fallback) under `public/hero/`.

## Page behaviour

- The hero becomes a scroll track (about 250vh desktop, 180vh phone) with a sticky inner viewport. Native scroll, no library, a small `ScrollHero` component maps scroll progress to a frame index on a canvas inside `requestAnimationFrame`.
- Headline, description and buttons are unchanged.
- The four service names appear as real HTML labels, in both languages, linking to their service pages, faded in at their scroll moments.
- Canvas is `aria-hidden`.

## Performance and accessibility

- Frame 1 is a `<picture>` with `fetchpriority="high"`: it is the LCP element, as the portrait is today.
- Other frames load after `load`, during idle time, only while the hero is near the viewport, decoded with `createImageBitmap`.
- `prefers-reduced-motion`, `Save-Data`, or a 2G/slow-2G connection: show one still of the final structure, no pinning, no frame download.
- Targets: desktop Lighthouse performance ≥ 95 (CI gate), accessibility ≥ 98, CLS ≈ 0; mobile Lighthouse measured before and after.

## Tests

- Playwright: scrolling advances the frame; reduced motion shows the still and no sticky track; no horizontal scroll at 375px; no CSP violations on `/`.
- LHCI in CI.
