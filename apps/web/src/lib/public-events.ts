import type { EventCategory, EventSummary, RegistrationMode } from '@engaje/contracts';

const EVENTS_TIME_ZONE = 'America/Campo_Grande';

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
  timeZone: EVENTS_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: EVENTS_TIME_ZONE,
});

const datePartsFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: EVENTS_TIME_ZONE,
});

export function getCategoryLabel(category: EventCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function getCategoryColor(category: EventCategory): 'brand' | 'community' | 'accent' {
  return CATEGORY_COLORS[category] ?? 'brand';
}

function getDatePartsInEventsTimeZone(value: Date): { year: number; month: number; day: number } {
  const parts = datePartsFormatter.formatToParts(value);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  return { year, month, day };
}

function getDateKeyInEventsTimeZone(value: Date): string {
  const { year, month, day } = getDatePartsInEventsTimeZone(value);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatEventDate(startDate: string, endDate?: string): string {
  const start = new Date(startDate);

  if (!endDate) {
    return `${dateFormatter.format(start)} • ${timeFormatter.format(start)}`;
  }

  const end = new Date(endDate);
  const sameDay = getDateKeyInEventsTimeZone(start) === getDateKeyInEventsTimeZone(end);

  if (sameDay) {
    return `${dateFormatter.format(start)} • ${timeFormatter.format(start)} às ${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} até ${dateFormatter.format(end)}`;
}

export function getRelativeDayLabel(startDate: string): 'Hoje' | 'Amanhã' | null {
  const start = new Date(startDate);
  const today = new Date();
  const startParts = getDatePartsInEventsTimeZone(start);
  const todayParts = getDatePartsInEventsTimeZone(today);

  const startNoTimeUtc = Date.UTC(startParts.year, startParts.month - 1, startParts.day);
  const todayNoTimeUtc = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);

  const dayDiff = Math.round((startNoTimeUtc - todayNoTimeUtc) / (1000 * 60 * 60 * 24));

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

export function shouldShowSlotsForMode(registrationMode: RegistrationMode): boolean {
  return registrationMode === 'registration';
}
