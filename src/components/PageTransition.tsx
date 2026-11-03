import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { useLocation } from "react-router";
import { useScrollReveal } from "@/hooks/useScrollReveal";
export default function PageTransition({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  // Scroll before the new page paints, so a view transition captures it from the top.
  useLayoutEffect(() => {
    const scroll = () => {
      const target = hash
        ? document.getElementById(decodeURIComponent(hash.slice(1)))
        : null;
      if (target) target.scrollIntoView({ behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    };
    scroll();
    // Again on the next frame, after the router restores its own scroll.
    const frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  useEffect(() => {
    document.body.removeAttribute("data-surface");
    const main = document.querySelector("main");
    if (main) {
      main.id = "main-content";
      main.setAttribute("tabindex", "-1");
    }
  }, [pathname]);
  useScrollReveal();
  return (
    <div className="page-enter">
      <div className="scroll-progress" aria-hidden="true" />
      {children}
    </div>
  );
}
