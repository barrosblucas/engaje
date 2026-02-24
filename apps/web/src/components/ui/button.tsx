'use client';

import { cn } from '@/lib/cn';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-[var(--color-accent)] text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)] hover:bg-[var(--color-accent-hover)] hover:scale-[1.03] active:scale-[0.99]',
  secondary:
    'border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] hover:scale-[1.02] active:scale-[0.99]',
  ghost:
    'border-[var(--color-border)] bg-transparent text-[var(--color-primary)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-surface)]',
  danger:
    'border-[var(--color-error)] bg-[var(--color-error)] text-white hover:brightness-95 active:scale-[0.99]',
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    fullWidth = false,
    asChild = false,
    children,
    ...props
  },
  ref,
) {
  const baseClassName = cn(
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(26,60,110,0.25)] disabled:cursor-not-allowed disabled:opacity-70',
    variantClassName[variant],
    sizeClassName[size],
    fullWidth && 'w-full',
    className,
  );

  if (asChild) {
    return (
      <Slot className={baseClassName} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button ref={ref} disabled={disabled || loading} className={baseClassName} {...props}>
      <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-active:opacity-100 group-active:[background:radial-gradient(circle,_rgba(255,255,255,0.4)_0%,_transparent_62%)]" />
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
});
