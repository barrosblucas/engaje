import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  subtitle?: string;
  className?: string;
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '??';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
}

export function Avatar({ name, subtitle, className }: AvatarProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary-surface)] font-semibold text-[var(--color-primary)]">
        {initialsFromName(name)}
      </span>
      <span>
        <strong className="block text-sm text-[var(--color-text-primary)]">{name}</strong>
        {subtitle ? (
          <span className="text-xs text-[var(--color-text-secondary)]">{subtitle}</span>
        ) : null}
      </span>
    </div>
  );
}
