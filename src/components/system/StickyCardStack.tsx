import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickyCardStackProps {
  items: ReactNode[];
  className?: string;
}

/**
 * Cards that stack up under each other while scrolling (CSS sticky only, so it
 * degrades gracefully and respects reduced motion). Flat layout on small screens.
 */
export const StickyCardStack = ({ items, className }: StickyCardStackProps) => (
  <div className={cn('space-y-5 md:space-y-8', className)}>
    {items.map((item, index) => (
      <div
        key={index}
        className="md:sticky"
        style={{ top: `calc(5rem + ${index * 1.25}rem)`, zIndex: index + 1 }}
      >
        {item}
      </div>
    ))}
  </div>
);
