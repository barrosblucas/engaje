import { cn } from '@/lib/cn';
import { type HTMLAttributes } from 'react';

type BadgeTone = 'primary' | 'accent' | 'secondary' | 'neutral' | 'success' | 'warning' | 'error';

const toneClassName: Record<BadgeTone, string> = {
  primary: 'bg-[var(--color-primary-surface)] text-[var(--color-primary)]',
  accent: 'bg-[var(--color-accent-surface)] text-[var(--color-accent-hover)]',
  secondary: 'bg-[var(--color-secondary-surface)] text-[var(--color-secondary)]',
  neutral: 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]',
  success: 'bg-[rgba(22,163,74,0.14)] text-[var(--color-success)]',
  warning: 'bg-[rgba(217,119,6,0.16)] text-[var(--color-warning)]',
  error: 'bg-[rgba(220,38,38,0.12)] text-[var(--color-error)]',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = 'neutral', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em]',
        toneClassName[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
