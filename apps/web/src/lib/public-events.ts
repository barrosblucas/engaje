import type { EventCategory, EventSummary } from '@engaje/contracts';

const CATEGORY_LABELS: Record<EventCategory, string> = {
  cultura: 'Cultura',
  esporte: 'Esporte',
  saude: 'Saúde',
  educacao: 'Educação',
  civico: 'Cívico',
  festa: 'Festa',
};

const CATEGORY_COLORS: Record<EventCategory, 'brand' | 'community' | 'accent'> = {
  cultura: 'brand',
  esporte: 'community',
  saude: 'community',
  educacao: 'brand',
  civico: 'accent',
  festa: 'accent',
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function getCategoryLabel(category: EventCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function getCategoryColor(category: EventCategory): 'brand' | 'community' | 'accent' {
  return CATEGORY_COLORS[category] ?? 'brand';
}

export function formatEventDate(startDate: string, endDate?: string): string {
  const start = new Date(startDate);

  if (!endDate) {
    return `${dateFormatter.format(start)} • ${timeFormatter.format(start)}`;
  }

  const end = new Date(endDate);
  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${dateFormatter.format(start)} • ${timeFormatter.format(start)} às ${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} até ${dateFormatter.format(end)}`;
}

export function getRelativeDayLabel(startDate: string): 'Hoje' | 'Amanhã' | null {
  const start = new Date(startDate);
  const today = new Date();

  const startNoTime = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const dayDiff = Math.round(
    (startNoTime.getTime() - todayNoTime.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDiff === 0) return 'Hoje';
  if (dayDiff === 1) return 'Amanhã';

  return null;
}

export function formatSlots(availableSlots: EventSummary['availableSlots']): string {
  if (availableSlots === null) {
    return 'Vagas ilimitadas';
  }

  if (availableSlots <= 0) {
    return 'Vagas esgotadas';
  }

  if (availableSlots <= 10) {
    return `Últimas ${availableSlots} vagas`;
  }

  return `${availableSlots} vagas disponíveis`;
}
