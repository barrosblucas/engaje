import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatEventDate, getRelativeDayLabel, shouldShowSlotsForMode } from './public-events';

describe('public-events', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows slots for registration mode', () => {
    expect(shouldShowSlotsForMode('registration')).toBe(true);
  });

  it('hides slots for informative mode', () => {
    expect(shouldShowSlotsForMode('informative')).toBe(false);
  });

  it('formats event hours in Campo Grande timezone', () => {
    const formatted = formatEventDate('2026-03-08T11:00:00.000Z', '2026-03-08T15:00:00.000Z');

    expect(formatted).toContain('07:00');
    expect(formatted).toContain('11:00');
  });

  it('computes relative day labels in Campo Grande timezone', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T02:00:00.000Z'));

    expect(getRelativeDayLabel('2026-03-08T11:00:00.000Z')).toBe('Amanhã');
  });
});
