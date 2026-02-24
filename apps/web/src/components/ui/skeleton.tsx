import { cn } from '@/lib/cn';
import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-2xl bg-[var(--color-border)]', className)}
      {...props}
    />
  );
}
