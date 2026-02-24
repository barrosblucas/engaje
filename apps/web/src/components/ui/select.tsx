'use client';

import { cn } from '@/lib/cn';
import { ChevronDown } from 'lucide-react';
import { type SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, id, options, error, required, ...props },
  ref,
) {
  const fieldId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label htmlFor={fieldId} className="relative block">
      <span className="pointer-events-none absolute left-4 top-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {label}
        {required ? ' *' : ''}
      </span>
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        required={required}
        className={cn(
          'h-14 w-full appearance-none rounded-2xl border bg-[var(--color-surface)] px-4 pb-1 pt-5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(26,60,110,0.15)]',
          error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
      />
      {error ? <span className="mt-1 block text-xs text-[var(--color-error)]">{error}</span> : null}
    </label>
  );
});
