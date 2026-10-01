import { useEffect, useRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type Surface = 'navy' | 'alice' | 'harper' | 'door' | 'paper';

interface ColorSectionProps extends HTMLAttributes<HTMLElement> {
  surface: Surface;
  /** Fill at least the viewport height (Jeton-style full-bleed screen). */
  full?: boolean;
}

/**
 * Full-bleed flat-colour section. While it owns the middle of the viewport it
 * writes its surface onto <body data-surface>, so the page background itself
 * transitions between brand colours as the visitor scrolls.
 */
export const ColorSection = ({ surface, full = false, className, ...props }: ColorSectionProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) document.body.dataset.surface = surface;
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [surface]);

  return (
    <section
      ref={ref}
      data-surface={surface}
      className={cn('relative w-full', full && 'flex min-h-[100svh] flex-col justify-center', className)}
      {...props}
    />
  );
};

export const ColorSectionInner = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('container max-w-content px-6 py-24 md:py-32', className)} {...props} />
);
