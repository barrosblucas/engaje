import type { EventSummary } from '@engaje/contracts';

function toDateOnly(input: Date) {
  return new Date(input.getFullYear(), input.getMonth(), input.getDate());
}

export function countEventsThisWeek(events: EventSummary[], nowDate = new Date()): number {
  const now = toDateOnly(nowDate);
  const weekLimit = new Date(now);
  weekLimit.setDate(weekLimit.getDate() + 7);

  return events.filter((event) => {
    const start = toDateOnly(new Date(event.startDate));
    return start >= now && start <= weekLimit;
  }).length;
}

export function getFeaturedEvents(events: EventSummary[], limit = 6): EventSummary[] {
  return [...events]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, limit);
}
