import { useEffect, useRef, useState } from "react";

type Fact = { number: string; label: string; detail?: string };

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/** Counts from 0 to the number in `value` ("12+" keeps its "+"); the real value stays in the DOM for readers. */
function CountUp({ value, play, delay }: { value: string; play: boolean; delay: number }) {
  const target = Number.parseInt(value, 10);
  const suffix = value.replace(/^\d+/, "");
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!play || Number.isNaN(target)) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, now - start - delay) / duration);
      setShown(`${Math.round(easeOutExpo(t) * target)}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, target, suffix, delay]);

  return (
    <strong dir="ltr" style={{ minWidth: `${value.length}ch` }}>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </strong>
  );
}

/**
 * Proof numbers that count up once when the strip comes into view. Below the
 * fold the columns also rise in; on screen at load they only count, so
 * nothing visible is hidden.
 */
export default function ProofStrip({ intro, facts, label }: { intro: string; facts: readonly Fact[]; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"static" | "waiting" | "in">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at load: count up in place, never hide what is visible.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      setState("in");
      return;
    }
    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("in");
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="studio-proof" aria-label={label} data-no-reveal data-proof={state}>
      <div className="studio-container proof-grid">
        <p>{intro}</p>
        {facts.map((f, i) => (
          <div key={f.number} style={{ "--d": `${i * 120 + 120}ms` } as React.CSSProperties}>
            <CountUp value={f.number} play={state === "in"} delay={i * 120 + 120} />
            <span>{f.label}</span>
            {f.detail ? <small>{f.detail}</small> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
