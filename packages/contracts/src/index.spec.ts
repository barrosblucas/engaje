import { describe, expect, it } from 'vitest';
import { CpfSchema, CreateAdminUserInputSchema, PublicEventsRequestSchema } from './index';

describe('contracts', () => {
  describe('CpfSchema', () => {
    it('accepts cpf with exactly 11 digits', () => {
      expect(CpfSchema.safeParse('12345678901').success).toBe(true);
    });

    it('rejects cpf with non-digit chars', () => {
      expect(CpfSchema.safeParse('123.456.789-01').success).toBe(false);
    });
  });

  describe('PublicEventsRequestSchema', () => {
    it('applies default pagination and sort values', () => {
      const result = PublicEventsRequestSchema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
      expect(result.sort).toBe('date_asc');
    });
  });

  describe('CreateAdminUserInputSchema', () => {
    it('rejects role outside admin scope', () => {
      const result = CreateAdminUserInputSchema.safeParse({
        name: 'Admin',
        email: 'admin@engaje.dev',
        password: 'strong-password',
        role: 'citizen',
      });

      expect(result.success).toBe(false);
    });
  });
});
