import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import { useScrollReveal } from "@/hooks/useScrollReveal";
export default function PageTransition({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.body.removeAttribute("data-surface");
    trackPageView();
    const frame = requestAnimationFrame(() => {
      const main = document.querySelector("main");
      if (main) {
        main.id = "main-content";
        main.setAttribute("tabindex", "-1");
      }
      const target = hash
        ? document.getElementById(decodeURIComponent(hash.slice(1)))
        : null;
      if (target) target.scrollIntoView({ behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  useScrollReveal();
  return <div className="page-enter">{children}</div>;
}
