import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "@/contexts/LanguageContext";

type Service = { slug: string; title: string; value: string; deliverables: string[] };

/**
 * Services as a scroll story: a tilted square with the service number cut out
 * of it stays pinned, turns and flips to the next number, while each service
 * takes a full screen and springs into place beside it.
 */
export default function ServiceScroll({
  items,
  label,
  deliverablesLabel,
  detailsLabel,
}: {
  items: readonly Service[];
  label: string;
  deliverablesLabel: string;
  detailsLabel: string;
}) {
  const { lang, isRtl } = useLanguage();
  const prefix = lang === "ar" ? "" : "/en";
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const blocks = Array.from(list.current?.querySelectorAll<HTMLElement>(".svc-block") ?? []);
    // A service becomes active when its top crosses the upper half of the viewport.
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="svc-scroll" style={{ "--step": active } as React.CSSProperties}>
      <div className="svc-pin" aria-hidden="true">
        <span className="svc-shape" />
        <span className="svc-digit" key={active}>
          {active + 1}
        </span>
      </div>
      <ol className="svc-list" ref={list}>
        {items.map((s, i) => (
          <li key={s.slug} className={`svc-block ${i <= active ? "is-in" : ""}`} data-index={i}>
            <span className="svc-index">{i + 1}</span>
            <h3>
              <span dir="ltr">{s.title}</span>
            </h3>
            <p className="svc-value">{s.value}</p>
            <p className="svc-label">{deliverablesLabel}</p>
            <ul>
              {s.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <Link to={`${prefix}/services/${s.slug}`} className="svc-link">
              {detailsLabel}
              <ArrowUpRight size={18} className={isRtl ? "-scale-x-100" : ""} />
              <span className="sr-only">: {s.title}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="svc-tag" dir="ltr">({label})</p>
    </div>
  );
}
