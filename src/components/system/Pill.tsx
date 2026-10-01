import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Pill = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('eyebrow inline-flex min-h-7 items-center rounded-full border border-border bg-secondary px-3 text-xs text-secondary-foreground', className)} {...props} />
);