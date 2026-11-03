import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project } from "@/content/projects";
import Picture from "@/components/Picture";
import { useNearViewport } from "@/hooks/useNearViewport";

/**
 * Selected work as full-height cards that stack while scrolling: each card
 * pins, the next one slides over it, and the covered card eases back.
 */
export default function StackedWork({ items }: { items: Project[] }) {
  const { lang, isRtl, dictionary } = useLanguage();
  const ar = lang === "ar";
  const prefix = ar ? "" : "/en";
  const list = useRef<HTMLOListElement>(null);
  const near = useNearViewport(list);

  useEffect(() => {
    const el = list.current;
    if (!el || !near || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".stack-card"));
    let raf = 0;
    const update = () => {
      raf = 0;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        // How far the next card has slid over this one: 0 = not yet, 1 = fully covered.
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const cover = Math.min(1, Math.max(0, (a.bottom - b.top) / a.height));
        card.style.setProperty("--cover", cover.toFixed(3));
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [near]);

  return (
    <ol className="stack" ref={list}>
      {items.map((p, i) => {
        const title = ar ? p.title_ar : p.title_en;
        return (
          <li
            key={p.slug}
            className={`stack-card ${i % 2 ? "stack-card--light" : "stack-card--dark"}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            <div className="stack-card-inner">
              <div className="stack-copy">
                <span className="stack-label" dir="ltr">
                  (WORK) {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
                <h3>{title}</h3>
                <p className="stack-discipline">
                  {p.discipline?.[lang] ?? dictionary.workPage.filters[p.serviceLine]}
                  {p.year && <span dir="ltr"> · {p.year}</span>}
                </p>
                <Link to={`${prefix}/work/${p.slug}`} className="stack-link">
                  {dictionary.servicesPage.caseCta}
                  <ArrowUpRight size={18} className={isRtl ? "-scale-x-100" : ""} />
                </Link>
              </div>
              <Link to={`${prefix}/work/${p.slug}`} className="stack-media" tabIndex={-1} aria-hidden="true">
                <Picture
                  src={p.cover}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  alt=""
                  loading="lazy"
                  width={1400}
                  height={900}
                  decoding="async"
                />
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
