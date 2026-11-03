import { useEffect, useRef, type ReactNode } from "react";

// Frames rendered by scripts/hero/scene.py and encoded by scripts/hero/encode.mjs.
const SETS = {
  desktop: { dir: "/hero/desktop", count: 96 },
  mobile: { dir: "/hero/mobile", count: 48 },
} as const;
const MOBILE = "(max-width: 640px)";
const frameUrl = (dir: string, n: number, ext: string) =>
  `${dir}/${String(n).padStart(3, "0")}.${ext}`;

/** Coarse frames first so scrubbing works early: every 16th, then 8th, 4th, 2nd, then the rest. */
const loadOrder = (count: number) => {
  const order: number[] = [];
  const seen = new Set<number>();
  for (const step of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
};

/** Reduced motion, Save-Data or a 2G connection get the still image only. */
const stillOnly = () => {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !!connection?.saveData ||
    /(^|-)2g$/.test(connection?.effectiveType ?? "")
  );
};

/** Which service label is lit: none, one module facing the camera (0-3), or all once they dock. */
const pathAt = (progress: number) => {
  if (progress < 0.45) return "none";
  if (progress >= 0.8) return "all";
  return String(Math.min(3, Math.floor((progress - 0.45) / 0.0875)));
};

type ScrollHeroProps = { className: string; children: ReactNode };

/**
 * The hero pins while the visitor scrolls through a pre-rendered 3D sequence
 * (idea -> four service modules -> one system). Native scroll, no library:
 * scroll progress picks a frame and draws it on a canvas.
 */
export default function ScrollHero({ className, children }: ScrollHeroProps) {
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const poster = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const trackEl = track.current;
    const sectionEl = section.current;
    const canvasEl = canvas.current;
    if (!trackEl || !sectionEl || !canvasEl) return;
    if (stillOnly()) {
      trackEl.dataset.still = "";
      return;
    }

    const set = window.matchMedia(MOBILE).matches ? SETS.mobile : SETS.desktop;
    const frames: (HTMLImageElement | undefined)[] = new Array(set.count);
    let wanted = 0;
    let drawn = -1;
    let stick = 0;
    let raf = 0;
    let cancelled = false;

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < set.count; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    };

    const draw = () => {
      raf = 0;
      const i = nearestLoaded(wanted);
      const ctx = canvasEl.getContext("2d");
      if (i < 0 || i === drawn || !ctx) return;
      const img = frames[i]!;
      // object-fit: cover
      const scale = Math.max(canvasEl.width / img.naturalWidth, canvasEl.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (canvasEl.width - w) / 2, (canvasEl.height - h) / 2, w, h);
      drawn = i;
      canvasEl.dataset.frame = String(i + 1);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      const distance = trackEl.offsetHeight - sectionEl.offsetHeight;
      const progress =
        distance > 0
          ? Math.min(1, Math.max(0, (stick - trackEl.getBoundingClientRect().top) / distance))
          : 0;
      wanted = Math.round(progress * (set.count - 1));
      sectionEl.dataset.path = pathAt(progress);
      schedule();
    };

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasEl.width = Math.round(canvasEl.clientWidth * dpr);
      canvasEl.height = Math.round(canvasEl.clientHeight * dpr);
      // On desktop a hero taller than the viewport pins with its bottom edge in view;
      // on phones the visual sits at the top, so it pins from the top.
      stick = window.matchMedia(MOBILE).matches
        ? 0
        : Math.min(0, window.innerHeight - sectionEl.offsetHeight);
      sectionEl.style.setProperty("--hero-stick", `${stick}px`);
      drawn = -1;
      onScroll();
    };

    // The poster's chosen source tells which format this browser decodes.
    const ext = poster.current?.currentSrc.endsWith(".avif") ? "avif" : "webp";
    const order = loadOrder(set.count);
    let next = 0;
    const pump = () => {
      if (cancelled || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.src = frameUrl(set.dir, i + 1, ext);
      img
        .decode()
        .then(() => {
          if (cancelled) return;
          frames[i] = img;
          // Redraw only when the new frame is closer to the one scroll asks for.
          if (drawn < 0 || Math.abs(i - wanted) < Math.abs(drawn - wanted)) {
            drawn = -1;
            schedule();
          }
        })
        .catch(() => undefined)
        .finally(pump);
    };
    const start = () => {
      if (cancelled) return;
      trackEl.dataset.live = "";
      for (let k = 0; k < 4; k++) pump();
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    // Frames wait until the page has loaded, so they never compete with first paint.
    let idle = 0;
    const whenIdle = () => {
      idle =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(start, { timeout: 1500 })
          : window.setTimeout(start, 200);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.cancelIdleCallback?.(idle);
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", whenIdle);
    };
  }, []);

  const still = (target: keyof typeof SETS, n: number, ext: string) =>
    frameUrl(SETS[target].dir, n, ext);

  return (
    <div className="hero-track" ref={track}>
      <section className={className} ref={section} data-no-reveal data-path="none">
        <div className="cinematic-portrait hero-visual" aria-hidden="true">
          <picture>
            {/* Reduced motion sees the finished system; everyone else starts on the idea. */}
            <source media={`${MOBILE} and (prefers-reduced-motion: reduce)`} type="image/avif" srcSet={still("mobile", SETS.mobile.count, "avif")} />
            <source media={`${MOBILE} and (prefers-reduced-motion: reduce)`} type="image/webp" srcSet={still("mobile", SETS.mobile.count, "webp")} />
            <source media={MOBILE} type="image/avif" srcSet={still("mobile", 1, "avif")} />
            <source media={MOBILE} type="image/webp" srcSet={still("mobile", 1, "webp")} />
            <source media="(prefers-reduced-motion: reduce)" type="image/avif" srcSet={still("desktop", SETS.desktop.count, "avif")} />
            <source media="(prefers-reduced-motion: reduce)" type="image/webp" srcSet={still("desktop", SETS.desktop.count, "webp")} />
            <source type="image/avif" srcSet={still("desktop", 1, "avif")} />
            <img
              ref={poster}
              src={still("desktop", 1, "webp")}
              alt=""
              width={1600}
              height={900}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <canvas ref={canvas} />
        </div>
        {children}
      </section>
      <div className="hero-spacer" aria-hidden="true" />
    </div>
  );
}
