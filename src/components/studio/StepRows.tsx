import { useEffect, useRef, useState } from "react";
import Picture from "@/components/Picture";

type Step = { title: string; english: string; body: string };

const IMAGES = ["step-discovery", "step-scope", "step-build", "step-launch"];

/**
 * Process steps after Folioblox's step-by-step list: one white card slides
 * behind whichever row the pointer is on, a soft light follows the pointer
 * inside it, and the active row shows its picture. Without a pointer (phones)
 * the row nearest the middle of the screen is the active one.
 */
export default function StepRows({ steps }: { steps: readonly Step[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  // Move the shared highlight to the active row.
  useEffect(() => {
    const list = listRef.current;
    const row = list?.children[active + 1] as HTMLElement | undefined;
    if (!list || !row) return;
    const place = () => {
      list.style.setProperty("--hl-y", `${row.offsetTop}px`);
      list.style.setProperty("--hl-h", `${row.offsetHeight}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  // Touch screens: follow the scroll instead of the pointer.
  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(hover: hover)").matches) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>(".step-row"));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(rows.indexOf(e.target as HTMLElement));
        }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rows.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  const onMove = (e: React.PointerEvent<HTMLLIElement>, i: number) => {
    if (e.pointerType !== "mouse") return;
    if (i !== active) setActive(i);
    const box = e.currentTarget.getBoundingClientRect();
    listRef.current?.style.setProperty("--mx", `${e.clientX - box.left}px`);
    listRef.current?.style.setProperty("--my", `${e.clientY - box.top}px`);
  };

  return (
    <ol className="step-rows" ref={listRef}>
      <li className="step-highlight" role="presentation" aria-hidden="true" />
      {steps.map((step, i) => (
        <li
          key={step.title}
          className={`step-row ${i === active ? "is-active" : ""}`}
          data-reveal
          onPointerMove={(e) => onMove(e, i)}
        >
          <span className="step-number" dir="ltr">
            0{i + 1}
          </span>
          <h3>
            {step.title}
            <span dir="ltr">{step.english}</span>
          </h3>
          <p>{step.body}</p>
          <span className="step-media" aria-hidden="true">
            <Picture src={`/work/media/${IMAGES[i]}.webp`} sizes="240px" alt="" loading="lazy" decoding="async" width={1600} height={1200} />
          </span>
        </li>
      ))}
    </ol>
  );
}
