'use client';

import { cn } from '@/lib/cn';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Chip({ label, selected = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition duration-300',
        selected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_8px_24px_rgba(26,60,110,0.24)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-surface)]',
      )}
    >
      {label}
    </button>
  );
}
