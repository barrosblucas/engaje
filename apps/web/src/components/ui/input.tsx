'use client';

import { cn } from '@/lib/cn';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, id, error, required, ...props },
  ref,
) {
  const fieldId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label htmlFor={fieldId} className="group relative block">
      <input
        ref={ref}
        id={fieldId}
        placeholder=" "
        aria-invalid={Boolean(error)}
        required={required}
        className={cn(
          'peer h-14 w-full rounded-2xl border bg-[var(--color-surface)] px-4 pb-2 pt-6 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(26,60,110,0.15)]',
          error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]',
          className,
        )}
        {...props}
      />
      <span className="pointer-events-none absolute left-4 top-4 origin-left text-sm text-[var(--color-text-muted)] transition duration-200 peer-placeholder-shown:translate-y-[0.4rem] peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-[var(--color-primary)] peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-90">
        {label}
        {required ? ' *' : ''}
      </span>
      {error ? <span className="mt-1 block text-xs text-[var(--color-error)]">{error}</span> : null}
    </label>
  );
});
