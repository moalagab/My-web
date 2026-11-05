import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Stop = { year: string; title: string; role: string; body: string };

const paragraphs = (text: string) => text.split("\n").map((p, i) => <p key={i}>{p}</p>);

/** Where stop i sits on the map, in percent of its width and height: a gentle wave across the page. */
const place = (i: number, n: number) => ({
  x: 5 + (90 * i) / Math.max(1, n - 1),
  y: 50 + 28 * Math.sin(i * 1.15 + 0.4),
});

/** A smooth route through the stops (Catmull-Rom turned into cubic curves), in a 1000x200 box. */
const route = (n: number) => {
  const pts = Array.from({ length: n }, (_, i) => place(i, n)).map((p) => [p.x * 10, p.y * 2]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

/**
 * Mo's path as a journey map: a route drawn across the page with a stop for
 * each chapter. Choosing a stop (click, hover or arrow keys) lights the route
 * up to it and opens its story underneath; it starts on today. On phones the
 * same stops run down a vertical path with every story open.
 */
export default function JourneyMap({ stops, current }: { stops: readonly Stop[]; current?: ReactNode }) {
  const last = stops.length - 1;
  const [active, setActive] = useState(last);
  const [drawn, setDrawn] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // The route draws itself the first time the map comes into view.
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setDrawn(true);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const rtl = document.documentElement.dir === "rtl";
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, Home: -99, End: 99 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(last, Math.abs(step) === 99 ? (step < 0 ? 0 : last) : active + step));
    setActive(next);
    tabs.current[next]?.focus();
  };

  const stop = stops[active];
  return (
    <div className="journey">
      <div className={`journey-map ${drawn ? "is-drawn" : ""}`} ref={mapRef}>
        <svg className="journey-route" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
          <path d={route(stops.length)} pathLength={1} className="journey-route-base" />
          <path
            d={route(stops.length)}
            pathLength={1}
            className="journey-route-done"
            style={{ strokeDashoffset: 1 - active / Math.max(1, last) }}
          />
        </svg>
        <div role="tablist" aria-label="Timeline" className="journey-stops">
          {stops.map((s, i) => {
            const p = place(i, stops.length);
            return (
              <button
                key={`${s.year}-${s.title}`}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`journey-tab-${i}`}
                aria-selected={i === active}
                aria-controls="journey-panel"
                tabIndex={i === active ? 0 : -1}
                className={`journey-stop ${i <= active ? "is-passed" : ""} ${i === active ? "is-active" : ""} ${p.y < 50 ? "is-up" : ""}`}
                style={{ insetInlineStart: `${p.x}%`, top: `${p.y}%` } as React.CSSProperties}
                onClick={() => setActive(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onKeyDown={onKey}
              >
                <span className="journey-pin" aria-hidden="true" />
                <span className="journey-label">
                  <span dir="ltr">{s.year}</span>
                  <strong dir="auto">{s.title}</strong>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${active}`} className="journey-panel" key={active}>
        <div className="journey-panel-head">
          <span dir="ltr">{stop.year}</span>
          <h3 dir="auto">{stop.title}</h3>
          <p dir="ltr">{stop.role}</p>
        </div>
        <div className="journey-panel-body">
          {paragraphs(stop.body)}
          {active === last && current}
        </div>
      </div>

      {/* Phones: the same stops down a vertical path, every story open. */}
      <ol className="journey-list">
        {stops.map((s, i) => (
          <li key={`${s.year}-${s.title}`} className={i === last ? "is-now" : ""}>
            <span dir="ltr" className="journey-list-year">{s.year}</span>
            <h3 dir="auto">{s.title}</h3>
            <p dir="ltr" className="journey-list-role">{s.role}</p>
            <div className="journey-list-body">{paragraphs(s.body)}</div>
            {i === last && current}
          </li>
        ))}
      </ol>
    </div>
  );
}
