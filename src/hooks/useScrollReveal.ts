import { useEffect } from "react";

/** Blocks that rise in without a data-reveal attribute in their markup. */
const AUTO_REVEAL = [
  ".step-row",
  ".about-gallery > li",
  ".testimonial-grid > figure",
  ".faq-rows > *",
  ".case-row",
  ".start-step",
  ".bento-card",
  ".service-line-facts > div",
].map((s) => `main ${s}`);

/** Animate explicitly marked content only; primary content always remains readable. */
export const useScrollReveal = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let observer: IntersectionObserver;
    const frame = requestAnimationFrame(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          ["main [data-reveal]", "main [data-reveal-stagger]", ...AUTO_REVEAL].join(", "),
        ),
      );
      observer = new IntersectionObserver(
        (entries) =>
          // Blocks that arrive together, like a row of cards, follow one another by 90ms.
          entries
            .filter((e) => e.isIntersecting)
            .forEach((e, i) => {
              const el = e.target as HTMLElement;
              el.style.setProperty("--reveal-delay", `${Math.min(i, 5) * 90}ms`);
              el.classList.add("is-revealed");
              observer.unobserve(el);
            }),
        { rootMargin: "0px 0px 30px 0px", threshold: 0 },
      );
      nodes.forEach((n) => {
        if (n.getBoundingClientRect().top < window.innerHeight) {
          n.classList.add("is-revealed");
        } else {
          n.setAttribute("data-reveal-target", "");
          observer.observe(n);
        }
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);
};
