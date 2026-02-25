import { describe, expect, it } from 'vitest';
import { shouldShowSlotsForMode } from './public-events';

describe('public-events', () => {
  it('shows slots for registration mode', () => {
    expect(shouldShowSlotsForMode('registration')).toBe(true);
  });

  it('hides slots for informative mode', () => {
    expect(shouldShowSlotsForMode('informative')).toBe(false);
  });
});
