import { describe, expect, it } from 'vitest';
import {
  AdminEventDetailResponseSchema,
  CpfSchema,
  CreateAdminUserInputSchema,
  PublicEventsRequestSchema,
} from './index';

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

  describe('AdminEventDetailResponseSchema', () => {
    it('accepts a valid admin event detail payload', () => {
      const parsed = AdminEventDetailResponseSchema.safeParse({
        id: 'evt_1',
        title: 'Evento',
        slug: 'evento',
        category: 'cultura',
        description: 'Descricao completa do evento',
        startDate: '2026-02-24T10:00:00.000Z',
        endDate: '2026-02-24T12:00:00.000Z',
        locationName: 'Praca',
        locationAddress: 'Rua A, 100',
        locationLat: null,
        locationLng: null,
        bannerUrl: null,
        bannerAltText: null,
        totalSlots: 100,
        status: 'draft',
        availableSlots: 100,
        images: [],
        createdAt: '2026-02-24T09:00:00.000Z',
      });

      expect(parsed.success).toBe(true);
    });
  });
});
