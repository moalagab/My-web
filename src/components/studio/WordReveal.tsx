import { useEffect, useRef, type ElementType } from "react";
import { useNearViewport } from "@/hooks/useNearViewport";

/**
 * Text that brightens word by word as it scrolls through the viewport.
 * The text stays one readable string for screen readers and search; only the
 * opacity of each word changes. Reduced motion shows it fully.
 */
export default function WordReveal({
  text,
  as: Tag = "p",
  className = "",
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  const near = useNearViewport(ref);

  useEffect(() => {
    const el = ref.current;
    if (!el || !near || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const { top, height } = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts when the top reaches 85% of the viewport, ends when the bottom reaches 45%.
      const start = vh * 0.85;
      const end = vh * 0.45 - height;
      const p = Math.min(1, Math.max(0, (start - top) / (start - end)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    el.dataset.reveal = "words";
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
    <Tag ref={ref} className={`word-reveal ${className}`} style={{ "--n": words.length } as React.CSSProperties}>
      {words.map((word, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties}>
          {word}{" "}
        </span>
      ))}
    </Tag>
  );
}
