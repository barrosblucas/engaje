import type { AdminRegistration, DynamicForm, DynamicFormField } from '@engaje/contracts';

export interface RegistrationAnswerItem {
  id: string;
  label: string;
  value: string;
}

export function formatAdminRegistrationDateTime(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRegistrationAnswerValue(
  value: unknown,
  fieldType?: DynamicFormField['type'],
): string {
  if (value === null || value === undefined) return 'Não informado';
  if (fieldType === 'terms' || fieldType === 'checkbox') {
    return value === true ? 'Sim' : 'Não';
  }
  if (fieldType === 'date' && typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('pt-BR');
    }
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }
  return String(value);
}

export function mapRegistrationAnswers(
  formData: Record<string, unknown> | null | undefined,
  dynamicFormSchema?: DynamicForm | null,
): RegistrationAnswerItem[] {
  const safeFormData = formData ?? {};
  const fields = dynamicFormSchema?.fields ?? [];
  const fieldMap = new Map(fields.map((field) => [field.id, field]));

  const mappedFromSchema = fields.map((field) => ({
    id: field.id,
    label: field.label,
    value: formatRegistrationAnswerValue(safeFormData[field.id], field.type),
  }));

  const orphanAnswers = Object.entries(safeFormData)
    .filter(([fieldId]) => !fieldMap.has(fieldId))
    .map(([fieldId, value]) => ({
      id: fieldId,
      label: fieldId,
      value: formatRegistrationAnswerValue(value),
    }));

  return [...mappedFromSchema, ...orphanAnswers];
}

export function getCandidateNumber(page: number, limit: number, index: number): number {
  return (page - 1) * limit + index + 1;
}

export function sortRegistrationsByCreatedAtAscending(
  registrations: AdminRegistration[],
): AdminRegistration[] {
  return [...registrations].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}
