import { describe, expect, it } from 'vitest';
import {
  createBuilderField,
  deserializeDynamicFormSchema,
  parseOptionsText,
  reorderBuilderFields,
  sanitizeFieldIdentifier,
  serializeBuilderFields,
  validateBuilderFieldsByMode,
} from './builder-utils';

describe('builder-utils', () => {
  it('serializes and deserializes dynamic form schema preserving key fields', () => {
    const fields = [
      createBuilderField('short_text', 0),
      {
        ...createBuilderField('single_select', 1),
        id: 'interesse',
        label: 'Área de interesse',
        optionsText: 'Saúde\nEducação',
      },
    ];

    const serialized = serializeBuilderFields(fields);

    expect(serialized?.fields).toHaveLength(2);
    expect(serialized?.fields[1]?.options).toEqual([
      { label: 'Saúde', value: 'saude' },
      { label: 'Educação', value: 'educacao' },
    ]);

    const restored = deserializeDynamicFormSchema(serialized);

    expect(restored[0]?.type).toBe('short_text');
    expect(restored[1]?.label).toBe('Área de interesse');
    expect(restored[1]?.optionsText).toBe('Saúde\nEducação');
  });

  it('normalizes field identifiers and option values', () => {
    expect(sanitizeFieldIdentifier('  CPF do Cidadão  ')).toBe('cpf_do_cidadao');

    const options = parseOptionsText('Saúde\nSaúde\n Cultura ');

    expect(options).toEqual([
      { label: 'Saúde', value: 'saude' },
      { label: 'Saúde', value: 'saude_2' },
      { label: 'Cultura', value: 'cultura' },
    ]);
  });

  it('reorders fields using index controls', () => {
    const first = createBuilderField('short_text', 0);
    const second = createBuilderField('number', 1);
    const third = createBuilderField('date', 2);

    const reordered = reorderBuilderFields([first, second, third], 2, 0);

    expect(reordered[0]?.type).toBe('date');
    expect(reordered[1]?.type).toBe('short_text');
    expect(reordered[2]?.type).toBe('number');
  });

  it('validates registration mode requiring dynamic fields', () => {
    const result = validateBuilderFieldsByMode('registration', []);

    expect(result.isValid).toBe(false);
    expect(result.issues[0]).toContain('exige pelo menos um campo');
  });

  it('validates option fields to ensure at least one option', () => {
    const result = validateBuilderFieldsByMode('registration', [
      {
        ...createBuilderField('single_select', 0),
        optionsText: '   ',
      },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.issues.some((issue) => issue.includes('adicione ao menos uma opção'))).toBe(true);
  });
});
