import { Badge } from '@/components/ui/badge';
import type { ReactNode } from 'react';

type BadgeTone = 'brand' | 'community' | 'accent' | 'neutral' | 'danger' | 'success';

const toneMap: Record<
  BadgeTone,
  'primary' | 'secondary' | 'accent' | 'neutral' | 'error' | 'success'
> = {
  brand: 'primary',
  community: 'secondary',
  accent: 'accent',
  neutral: 'neutral',
  danger: 'error',
  success: 'success',
};

interface PublicBadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

export function PublicBadge({ children, tone = 'neutral' }: PublicBadgeProps) {
  return <Badge tone={toneMap[tone]}>{children}</Badge>;
}
