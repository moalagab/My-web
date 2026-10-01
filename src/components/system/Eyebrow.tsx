import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Eyebrow = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('eyebrow text-xs font-medium uppercase text-accent', className)} {...props} />
);