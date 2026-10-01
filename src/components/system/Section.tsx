import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Section = ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
  <section className={cn('py-section-sm md:py-section', className)} {...props} />
);

export const SectionInner = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('container max-w-content px-6', className)} {...props} />
);