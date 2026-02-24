import type {
  DynamicForm,
  DynamicFormField,
  DynamicFormFieldType,
  RegistrationMode,
} from '@engaje/contracts';

export interface BuilderFieldDraft {
  draftKey: string;
  id: string;
  type: DynamicFormFieldType;
  label: string;
  required: boolean;
  placeholder: string;
  helpText: string;
  optionsText: string;
}

export interface BuilderModeValidationResult {
  isValid: boolean;
  issues: string[];
}

const FIELD_TYPE_DEFAULT_LABEL: Record<DynamicFormFieldType, string> = {
  short_text: 'Resposta curta',
  paragraph: 'Descrição detalhada',
  number: 'Número',
  single_select: 'Selecione uma opção',
  multi_select: 'Selecione uma ou mais opções',
  checkbox: 'Caixa de seleção',
  date: 'Data',
  terms: 'Aceite de termos',
};

const FIELD_TYPES_WITH_OPTIONS = new Set<DynamicFormFieldType>(['single_select', 'multi_select']);

export const DYNAMIC_FIELD_TYPE_OPTIONS: Array<{ value: DynamicFormFieldType; label: string }> = [
  { value: 'short_text', label: 'Texto curto' },
  { value: 'paragraph', label: 'Parágrafo' },
  { value: 'number', label: 'Número' },
  { value: 'single_select', label: 'Seleção única' },
  { value: 'multi_select', label: 'Seleção múltipla' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Data' },
  { value: 'terms', label: 'Termos' },
];

export function sanitizeFieldIdentifier(rawValue: string): string {
  const normalized = rawValue
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!normalized) return 'campo';
  if (/^\d/.test(normalized)) return `campo_${normalized}`;

  return normalized;
}

function buildDraftKey(base: string, index: number): string {
  return `${sanitizeFieldIdentifier(base)}_${index + 1}`;
}

export function createBuilderField(type: DynamicFormFieldType, index: number): BuilderFieldDraft {
  const defaultLabel = FIELD_TYPE_DEFAULT_LABEL[type];

  return {
    draftKey: buildDraftKey(defaultLabel, index),
    id: sanitizeFieldIdentifier(defaultLabel),
    type,
    label: defaultLabel,
    required: false,
    placeholder: '',
    helpText: '',
    optionsText: type === 'single_select' || type === 'multi_select' ? 'Opção 1\nOpção 2' : '',
  };
}

export function isOptionFieldType(type: DynamicFormFieldType): boolean {
  return FIELD_TYPES_WITH_OPTIONS.has(type);
}

export function parseOptionsText(optionsText: string): Array<{ label: string; value: string }> {
  const entries = optionsText
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const usedValues = new Set<string>();

  return entries.map((label, index) => {
    const baseValue = sanitizeFieldIdentifier(label) || `opcao_${index + 1}`;
    let value = baseValue;
    let attempt = 2;

    while (usedValues.has(value)) {
      value = `${baseValue}_${attempt}`;
      attempt += 1;
    }

    usedValues.add(value);

    return {
      label,
      value,
    };
  });
}

export function deserializeDynamicFormSchema(
  schema: DynamicForm | null | undefined,
): BuilderFieldDraft[] {
  if (!schema) return [];

  return schema.fields.map((field, index) => ({
    draftKey: buildDraftKey(field.id || field.label, index),
    id: field.id,
    type: field.type,
    label: field.label,
    required: field.required,
    placeholder: field.placeholder ?? '',
    helpText: field.helpText ?? '',
    optionsText: field.options?.map((option) => option.label).join('\n') ?? '',
  }));
}

export function serializeBuilderFields(fields: BuilderFieldDraft[]): DynamicForm | undefined {
  if (fields.length === 0) return undefined;

  const normalizedFields: DynamicFormField[] = fields.map((field, index) => {
    const identifier = sanitizeFieldIdentifier(field.id || field.label || `campo_${index + 1}`);
    const options = isOptionFieldType(field.type) ? parseOptionsText(field.optionsText) : undefined;

    return {
      id: identifier,
      type: field.type,
      label: field.label.trim(),
      required: field.required,
      placeholder: field.placeholder.trim() || undefined,
      helpText: field.helpText.trim() || undefined,
      options,
    };
  });

  return {
    fields: normalizedFields,
  };
}

export function reorderBuilderFields(
  fields: BuilderFieldDraft[],
  fromIndex: number,
  toIndex: number,
): BuilderFieldDraft[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= fields.length ||
    toIndex >= fields.length ||
    fromIndex === toIndex
  ) {
    return fields;
  }

  const next = [...fields];
  const [moved] = next.splice(fromIndex, 1);

  if (!moved) return fields;

  next.splice(toIndex, 0, moved);
  return next;
}

export function validateBuilderFieldsByMode(
  mode: RegistrationMode,
  fields: BuilderFieldDraft[],
): BuilderModeValidationResult {
  const issues: string[] = [];

  if (mode === 'registration' && fields.length === 0) {
    issues.push('Modo de inscrição exige pelo menos um campo no formulário dinâmico.');
  }

  const usedIds = new Set<string>();

  for (const [index, field] of fields.entries()) {
    const fieldNumber = index + 1;

    if (!field.label.trim()) {
      issues.push(`Campo ${fieldNumber}: informe o rótulo.`);
    }

    const id = sanitizeFieldIdentifier(field.id || field.label || `campo_${fieldNumber}`);

    if (usedIds.has(id)) {
      issues.push(`Campo ${fieldNumber}: identificador duplicado (${id}).`);
    }

    usedIds.add(id);

    if (isOptionFieldType(field.type) && parseOptionsText(field.optionsText).length === 0) {
      issues.push(`Campo ${fieldNumber}: adicione ao menos uma opção.`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
