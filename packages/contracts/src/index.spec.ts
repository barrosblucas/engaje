import { describe, expect, it } from 'vitest';
import {
  AdminEventDetailResponseSchema,
  AdminProgramSummarySchema,
  AdminUploadImageResponseSchema,
  CpfSchema,
  CreateAdminUserInputSchema,
  CreateEventInputSchema,
  CreateProgramInputSchema,
  DynamicFormSchema,
  PublicActiveProgramResponseSchema,
  PublicEventsRequestSchema,
  RegistrationModeSchema,
  UpdateProgramInputSchema,
  UserRegistrationDetailResponseSchema,
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
        registrationMode: 'registration',
        externalCtaLabel: null,
        externalCtaUrl: null,
        dynamicFormSchema: {
          fields: [
            {
              id: 'nome',
              type: 'short_text',
              label: 'Nome completo',
              required: true,
            },
          ],
        },
        attendanceIntentCount: 0,
        images: [],
        createdAt: '2026-02-24T09:00:00.000Z',
      });

      expect(parsed.success).toBe(true);
    });
  });

  describe('RegistrationModeSchema', () => {
    it('accepts registration and informative', () => {
      expect(RegistrationModeSchema.safeParse('registration').success).toBe(true);
      expect(RegistrationModeSchema.safeParse('informative').success).toBe(true);
    });

    it('rejects unsupported mode', () => {
      expect(RegistrationModeSchema.safeParse('external').success).toBe(false);
    });
  });

  describe('DynamicFormSchema', () => {
    it('accepts valid select field with options', () => {
      const result = DynamicFormSchema.safeParse({
        fields: [
          {
            id: 'faixa_etaria',
            type: 'single_select',
            label: 'Faixa etária',
            required: true,
            options: [
              { label: '18-24', value: '18_24' },
              { label: '25-34', value: '25_34' },
            ],
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('rejects select field without options', () => {
      const result = DynamicFormSchema.safeParse({
        fields: [
          {
            id: 'genero',
            type: 'single_select',
            label: 'Gênero',
            required: false,
          },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('rejects required field without label', () => {
      const result = DynamicFormSchema.safeParse({
        fields: [
          {
            id: 'termos',
            type: 'terms',
            label: '',
            required: true,
          },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('CreateEventInputSchema', () => {
    it('rejects invalid external url', () => {
      const result = CreateEventInputSchema.safeParse({
        title: 'Evento Municipal',
        category: 'cultura',
        description: 'Evento oficial da prefeitura para toda a população',
        startDate: '2026-03-01T10:00:00.000Z',
        endDate: '2026-03-01T12:00:00.000Z',
        locationName: 'Praça Central',
        locationAddress: 'Rua Principal, 100',
        registrationMode: 'informative',
        externalCtaLabel: 'Inscrição externa',
        externalCtaUrl: 'url-invalida',
      });

      expect(result.success).toBe(false);
    });

    it('requires dynamic form on registration mode', () => {
      const result = CreateEventInputSchema.safeParse({
        title: 'Evento Municipal',
        category: 'cultura',
        description: 'Evento oficial da prefeitura para toda a população',
        startDate: '2026-03-01T10:00:00.000Z',
        endDate: '2026-03-01T12:00:00.000Z',
        locationName: 'Praça Central',
        locationAddress: 'Rua Principal, 100',
        registrationMode: 'registration',
      });

      expect(result.success).toBe(false);
    });

    it('accepts informative mode without dynamic form', () => {
      const result = CreateEventInputSchema.safeParse({
        title: 'Evento Municipal',
        category: 'cultura',
        description: 'Evento oficial da prefeitura para toda a população',
        startDate: '2026-03-01T10:00:00.000Z',
        endDate: '2026-03-01T12:00:00.000Z',
        locationName: 'Praça Central',
        locationAddress: 'Rua Principal, 100',
        registrationMode: 'informative',
        externalCtaLabel: 'Site da campanha',
        externalCtaUrl: 'https://prefeitura.example/campanha',
      });

      expect(result.success).toBe(true);
    });

    it('accepts bannerUrl generated by upload endpoint', () => {
      const result = CreateEventInputSchema.safeParse({
        title: 'Evento Municipal',
        category: 'cultura',
        description: 'Evento oficial da prefeitura para toda a população',
        startDate: '2026-03-01T10:00:00.000Z',
        endDate: '2026-03-01T12:00:00.000Z',
        locationName: 'Praça Central',
        locationAddress: 'Rua Principal, 100',
        registrationMode: 'registration',
        dynamicFormSchema: {
          fields: [{ id: 'nome', type: 'short_text', label: 'Nome', required: true }],
        },
        bannerUrl: '/uploads/content/teste.webp',
      });

      expect(result.success).toBe(true);
    });

    it('rejects invalid bannerUrl', () => {
      const result = CreateEventInputSchema.safeParse({
        title: 'Evento Municipal',
        category: 'cultura',
        description: 'Evento oficial da prefeitura para toda a população',
        startDate: '2026-03-01T10:00:00.000Z',
        endDate: '2026-03-01T12:00:00.000Z',
        locationName: 'Praça Central',
        locationAddress: 'Rua Principal, 100',
        registrationMode: 'registration',
        dynamicFormSchema: {
          fields: [{ id: 'nome', type: 'short_text', label: 'Nome', required: true }],
        },
        bannerUrl: 'javascript:alert(1)',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Program highlight contracts', () => {
    it('accepts create program payload with highlight flag', () => {
      const result = CreateProgramInputSchema.safeParse({
        title: 'Programa Municipal',
        category: 'cultura',
        description: 'Programa oficial da prefeitura para toda a comunidade local.',
        startDate: '2026-03-01T10:00:00.000Z',
        endDate: '2026-05-01T12:00:00.000Z',
        registrationMode: 'registration',
        dynamicFormSchema: {
          fields: [{ id: 'nome', type: 'short_text', label: 'Nome', required: true }],
        },
        status: 'published',
        isHighlightedOnHome: true,
      });

      expect(result.success).toBe(true);
    });

    it('accepts update payload with highlight toggle', () => {
      const result = UpdateProgramInputSchema.safeParse({
        isHighlightedOnHome: false,
      });

      expect(result.success).toBe(true);
    });

    it('requires highlight flag in admin program summary response', () => {
      const result = AdminProgramSummarySchema.safeParse({
        id: 'prg_1',
        title: 'Programa',
        slug: 'programa',
        category: 'saude',
        status: 'published',
        startDate: '2026-03-01T10:00:00.000Z',
        totalSlots: 100,
        registeredCount: 12,
        createdAt: '2026-02-24T10:00:00.000Z',
        registrationMode: 'registration',
        isHighlightedOnHome: true,
      });

      expect(result.success).toBe(true);
    });

    it('accepts active program endpoint payload with nullable data', () => {
      const result = PublicActiveProgramResponseSchema.safeParse({
        data: null,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('AdminUploadImageResponseSchema', () => {
    it('accepts upload response with url and metadata', () => {
      const result = AdminUploadImageResponseSchema.safeParse({
        url: '/uploads/content/imagem.webp',
        mimeType: 'image/webp',
        width: 1280,
        height: 720,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('UserRegistrationDetailResponseSchema', () => {
    it('accepts detail payload with form answers and dynamic form schema', () => {
      const result = UserRegistrationDetailResponseSchema.safeParse({
        data: {
          id: 'reg_1',
          protocolNumber: 'EVT-20260224-00001',
          status: 'confirmed',
          formData: {
            nome_social: 'Maria da Silva',
            aceite_termos: true,
          },
          createdAt: '2026-02-24T10:00:00.000Z',
          cancelledAt: null,
          event: {
            id: 'evt_1',
            title: 'Evento Municipal',
            slug: 'evento-municipal',
            startDate: '2026-03-01T10:00:00.000Z',
            endDate: '2026-03-01T12:00:00.000Z',
            locationName: 'Praça Central',
            locationAddress: 'Rua Principal, 100',
            bannerUrl: null,
            dynamicFormSchema: {
              fields: [
                {
                  id: 'nome_social',
                  type: 'short_text',
                  label: 'Nome social',
                  required: true,
                },
              ],
            },
          },
        },
      });

      expect(result.success).toBe(true);
    });
  });
});
