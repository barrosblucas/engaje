import type { EventSummary } from '@engaje/contracts';
import { describe, expect, it } from 'vitest';
import { buildHomeStats, countEventsThisWeek, getFeaturedEvents } from './home-utils';

const baseEvent: EventSummary = {
  id: '1',
  title: 'Evento base',
  slug: 'evento-base',
  category: 'civico',
  startDate: '2026-02-24T12:00:00.000Z',
  locationName: 'Praca',
  bannerUrl: null,
  bannerAltText: null,
  availableSlots: 30,
  registrationMode: 'registration',
  externalCtaLabel: null,
  externalCtaUrl: null,
};

describe('home-utils', () => {
  it('countEventsThisWeek counts only events inside next 7 days', () => {
    const events: EventSummary[] = [
      baseEvent,
      {
        ...baseEvent,
        id: '2',
        slug: 'evento-2',
        startDate: '2026-02-28T12:00:00.000Z',
      },
      {
        ...baseEvent,
        id: '3',
        slug: 'evento-3',
        startDate: '2026-03-09T12:00:00.000Z',
      },
    ];

    const count = countEventsThisWeek(events, new Date('2026-02-24T10:00:00.000Z'));

    expect(count).toBe(2);
  });

  it('getFeaturedEvents sorts by startDate and applies limit', () => {
    const events: EventSummary[] = [
      {
        ...baseEvent,
        id: '3',
        slug: 'evento-3',
        startDate: '2026-03-01T12:00:00.000Z',
      },
      {
        ...baseEvent,
        id: '1',
        slug: 'evento-1',
        startDate: '2026-02-24T12:00:00.000Z',
      },
      {
        ...baseEvent,
        id: '2',
        slug: 'evento-2',
        startDate: '2026-02-25T12:00:00.000Z',
      },
    ];

    const result = getFeaturedEvents(events, 2);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('1');
    expect(result[1]?.id).toBe('2');
  });

  it('buildHomeStats keeps minimum registrations baseline', () => {
    const stats = buildHomeStats(4);

    expect(stats.eventsCount).toBe(4);
    expect(stats.registrationsCount).toBe(120);
    expect(stats.activeProgramsCount).toBe(18);
    expect(stats.partnerCitiesCount).toBe(9);
  });
});
