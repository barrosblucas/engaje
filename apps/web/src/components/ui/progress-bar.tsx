import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'accent' | 'secondary' | 'primary';
  className?: string;
}

const progressTone: Record<NonNullable<ProgressBarProps['color']>, string> = {
  accent: 'bg-[var(--color-accent)]',
  secondary: 'bg-[var(--color-secondary)]',
  primary: 'bg-[var(--color-primary)]',
};

export function ProgressBar({ value, max = 100, color = 'accent', className }: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-[rgba(148,163,184,0.25)]',
        className,
      )}
      role="progressbar"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span
        className={cn('block h-full rounded-full transition-all duration-500', progressTone[color])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
