import { describe, expect, it } from 'vitest';
import { formatDateBR, truncate } from './index';

describe('utils', () => {
  describe('truncate', () => {
    it('returns original text when it fits max length', () => {
      expect(truncate('engaje', 10)).toBe('engaje');
    });

    it('truncates and appends ellipsis when text exceeds max length', () => {
      expect(truncate('abcdefghij', 7)).toBe('abcd...');
    });
  });

  describe('formatDateBR', () => {
    it('formats date in pt-BR locale', () => {
      const result = formatDateBR(new Date('2024-01-10T12:00:00.000Z'));

      expect(result).toMatch(/2024/);
      expect(result.toLowerCase()).toContain('janeiro');
    });
  });
});
