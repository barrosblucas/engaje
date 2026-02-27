import type { AdminRegistration, DynamicForm } from '@engaje/contracts';
import { describe, expect, it } from 'vitest';
import {
  formatRegistrationAnswerValue,
  getCandidateNumber,
  mapRegistrationAnswers,
  sortRegistrationsByCreatedAtAscending,
} from './registration-answers';

describe('registration-answers', () => {
  it('maps answers using dynamic form labels and keeps orphan fields', () => {
    const dynamicFormSchema: DynamicForm = {
      fields: [
        {
          id: 'bairro',
          type: 'short_text',
          label: 'Bairro',
          required: true,
        },
        {
          id: 'aceite_termos',
          type: 'terms',
          label: 'Aceite dos termos',
          required: true,
        },
      ],
    };

    const answers = mapRegistrationAnswers(
      {
        bairro: 'Centro',
        aceite_termos: true,
        campo_antigo: 'valor antigo',
      },
      dynamicFormSchema,
    );

    expect(answers).toEqual([
      { id: 'bairro', label: 'Bairro', value: 'Centro' },
      { id: 'aceite_termos', label: 'Aceite dos termos', value: 'Sim' },
      { id: 'campo_antigo', label: 'campo_antigo', value: 'valor antigo' },
    ]);
  });

  it('formats date answer values in pt-BR', () => {
    const formatted = formatRegistrationAnswerValue('2026-02-20T00:00:00.000Z', 'date');
    expect(formatted).toBe('20/02/2026');
  });

  it('calculates candidate number using page and limit', () => {
    expect(getCandidateNumber(1, 50, 0)).toBe(1);
    expect(getCandidateNumber(2, 50, 0)).toBe(51);
    expect(getCandidateNumber(2, 50, 3)).toBe(54);
  });

  it('sorts registrations by createdAt ascending', () => {
    const registrations: AdminRegistration[] = [
      {
        id: 'reg-2',
        protocolNumber: 'EVT-2',
        status: 'confirmed',
        formData: null,
        createdAt: '2026-02-20T11:00:00.000Z',
        cancelledAt: null,
        user: {
          id: 'usr-2',
          name: 'User 2',
          cpf: null,
          email: 'u2@example.com',
          phone: null,
        },
      },
      {
        id: 'reg-1',
        protocolNumber: 'EVT-1',
        status: 'confirmed',
        formData: null,
        createdAt: '2026-02-20T10:00:00.000Z',
        cancelledAt: null,
        user: {
          id: 'usr-1',
          name: 'User 1',
          cpf: null,
          email: 'u1@example.com',
          phone: null,
        },
      },
    ];

    const sorted = sortRegistrationsByCreatedAtAscending(registrations);
    expect(sorted.map((item) => item.id)).toEqual(['reg-1', 'reg-2']);
  });
});
