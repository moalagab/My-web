import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { orderedProjects } from "@/content/projects";
import Picture from "@/components/Picture";

const BEHANCE = "https://www.behance.net/ma_alagab";

/** Two pictures from each project with a gallery: the cover and one application. */
const images = orderedProjects
  .filter((p) => p.gallery.length > 2)
  .flatMap((p) => [p.preview ?? p.gallery[1].src, p.gallery[p.gallery.length - 2].src])
  .slice(0, 14);

/**
 * "Behind the designs", after Folioblox: Mo's work on a concave curve. Cards
 * drift sideways without end; the nearer a card is to either edge, the larger
 * it grows and the more it turns toward the centre. Transforms are written
 * straight to the DOM each frame (no React renders) and only while the strip
 * is on screen. Reduced motion shows a still, scrollable row.
 */
export default function CurvedGallery() {
  const { lang, isRtl, dictionary } = useLanguage();
  const ar = lang === "ar";
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    const row = track.current;
    if (!el || !row || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(row.children) as HTMLElement[];
    let offset = 0;
    let speed = 0.45;
    let target = 0.45;
    let frame = 0;
    let last = 0;
    let running = false;
    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 50) : 16;
      last = t;
      speed += (target - speed) * 0.06;
      const half = row.scrollWidth / 2;
      offset = (offset + speed * dt * 0.06) % half;
      row.style.transform = `translate3d(${-offset}px, 0, 0)`;
      const mid = el.clientWidth / 2;
      for (const card of cards) {
        const x = card.offsetLeft - offset + card.offsetWidth / 2;
        const d = Math.max(-1.15, Math.min(1.15, (x - mid) / mid));
        // Push edge cards outward as they grow, so neighbours never overlap.
        const push = d * Math.abs(d) * card.offsetWidth * 0.32;
        card.style.transform = `translateX(${push.toFixed(1)}px) rotateY(${(-d * 42).toFixed(2)}deg) scale(${(1 + d * d * 0.3).toFixed(3)})`;
      }
      if (running) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const seen = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    seen.observe(el);
    const slow = () => (target = 0.08);
    const resume = () => (target = 0.45);
    el.addEventListener("pointerenter", slow);
    el.addEventListener("pointerleave", resume);
    return () => {
      stop();
      seen.disconnect();
      el.removeEventListener("pointerenter", slow);
      el.removeEventListener("pointerleave", resume);
    };
  }, []);

  const strip = (copy: boolean) =>
    images.map((src, i) => (
      <figure key={`${copy ? "b" : "a"}${i}`} className="curve-card" aria-hidden={copy || undefined}>
        <Picture src={src} sizes="260px" alt="" loading="lazy" decoding="async" width={1400} height={990} />
      </figure>
    ));

  return (
    <section className="studio-section curve-gallery" aria-labelledby="curve-title">
      <div className="studio-container curve-head" data-reveal>
        <h2 id="curve-title">{ar ? "وخلف العلامات، أعمال أكثر." : "There’s more behind the brands."}</h2>
        <p>
          {ar
            ? "هويات وتغليف وأعمال رقمية أكثر في ملف أعمالي على Behance."
            : "More identities, packaging and digital work in my extended portfolio on Behance."}
        </p>
        <a href={BEHANCE} target="_blank" rel="noreferrer" className="nav-pill nav-pill--solid">
          <span>{ar ? "شوف أعمالًا أكثر" : "See more projects"}</span>
          <span className="nav-pill-dot" aria-hidden="true">
            <ArrowUpRight size={18} className={isRtl ? "-scale-x-100" : ""} />
          </span>
        </a>
      </div>
      <div className="curve-stage" ref={stage} dir="ltr" aria-hidden="true">
        <div className="curve-track" ref={track}>
          {strip(false)}
          {strip(true)}
        </div>
      </div>
      <ol className="studio-container curve-labels">
        {dictionary.home.services.items.map((s, i) => (
          <li key={s.slug}>
            <span dir="ltr">#0{i + 1}</span>
            <span dir="ltr">{dictionary.home.hero.pills[i]}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
