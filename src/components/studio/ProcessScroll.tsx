import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNearViewport } from "@/hooks/useNearViewport";

type Step = { title: string; english: string; body: string };

/**
 * The working process as a pinned story: the section holds still while
 * scrolling steps through the stages. On phones and with reduced motion the
 * same steps render as a plain list.
 */
export default function ProcessScroll({ steps, children }: { steps: readonly Step[]; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const near = useNearViewport(track);

  useEffect(() => {
    const el = track.current;
    if (!el || !near) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const { top, height } = el.getBoundingClientRect();
      const travel = height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -top / travel)) : 0;
      el.style.setProperty("--p", p.toFixed(3));
      setActive(Math.min(steps.length - 1, Math.floor(p * steps.length)));
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
  }, [near, steps.length]);

  return (
    <div className="proc-track" ref={track} style={{ "--count": steps.length } as React.CSSProperties}>
      <div className="proc-sticky">
        {children}
        <div className="proc-body">
          <ol className="proc-steps" aria-hidden="true">
            {steps.map((s, i) => (
              <li key={s.title} className={i === active ? "is-active" : i < active ? "is-done" : ""}>
                <span>0{i + 1}</span>
                {s.title}
              </li>
            ))}
          </ol>
          <div className="proc-stage">
            {steps.map((s, i) => (
              <article key={s.title} className={`proc-card ${i === active ? "is-active" : ""}`}>
                <span className="proc-number">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p className="studio-eyebrow">
                  <span dir="ltr">{s.english}</span>
                </p>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="proc-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
