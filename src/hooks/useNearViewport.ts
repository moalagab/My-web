import { useEffect, useState, type RefObject } from "react";

/** True once the element comes within a screen of the viewport, so below-the-fold effects cost nothing on load. */
export const useNearViewport = (ref: RefObject<Element | null>) => {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, near]);
  return near;
};
