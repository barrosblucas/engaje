'use client';

import { cn } from '@/lib/cn';
import { CalendarDays } from 'lucide-react';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { className, label, id, error, required, ...props },
  ref,
) {
  const fieldId = id ?? `date-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label htmlFor={fieldId} className="relative block">
      <span className="pointer-events-none absolute left-4 top-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        ref={ref}
        id={fieldId}
        type="date"
        aria-invalid={Boolean(error)}
        required={required}
        className={cn(
          'h-14 w-full rounded-2xl border bg-[var(--color-surface)] px-4 pb-1 pt-5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(26,60,110,0.15)]',
          error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]',
          className,
        )}
        {...props}
      />
      <CalendarDays
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
      />
      {error ? <span className="mt-1 block text-xs text-[var(--color-error)]">{error}</span> : null}
    </label>
  );
});
