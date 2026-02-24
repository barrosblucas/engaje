import { cn } from '@/lib/cn';
import { type HTMLAttributes } from 'react';

type CardVariant = 'event' | 'program' | 'news' | 'stat';

const variantClassName: Record<CardVariant, string> = {
  event:
    'border-[var(--color-border)] bg-[var(--color-surface)] hover:-translate-y-1 hover:border-[var(--color-primary-light)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.14)]',
  program:
    'border-[rgba(45,125,79,0.28)] bg-[var(--color-secondary-surface)] hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(45,125,79,0.2)]',
  news: 'border-[rgba(26,60,110,0.22)] bg-[var(--color-primary-surface)] hover:-translate-y-1',
  stat: 'border-transparent bg-[rgba(255,255,255,0.14)] text-white backdrop-blur',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = 'event', children, ...props }: CardProps) {
  return (
    <article
      className={cn(
        'rounded-3xl border p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition duration-300',
        variantClassName[variant],
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}
