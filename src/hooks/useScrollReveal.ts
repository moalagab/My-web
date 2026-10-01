import { useEffect } from "react";
/** Animate explicitly marked content only; primary content always remains readable. */
export const useScrollReveal = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let observer: IntersectionObserver;
    const frame = requestAnimationFrame(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          "main [data-reveal], main [data-reveal-stagger]",
        ),
      );
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-revealed");
              observer.unobserve(e.target);
            }
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
