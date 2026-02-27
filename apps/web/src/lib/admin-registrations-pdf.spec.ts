import { describe, expect, it } from 'vitest';
import { buildRegistrationsPdfFileName } from './admin-registrations-pdf';

describe('admin-registrations-pdf', () => {
  it('builds a deterministic filename with sanitized slug', () => {
    const result = buildRegistrationsPdfFileName(
      'Ação de Cidadania 2026',
      new Date('2026-02-27T15:00:00.000Z'),
    );

    expect(result).toBe('inscricoes-acao-de-cidadania-2026-2026-02-27.pdf');
  });
});
