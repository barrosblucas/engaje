import type { RegistrationMode } from '@engaje/contracts';

export interface RegistrationSubmitRules {
  requiresDynamicForm: boolean;
  showSubmitButton: boolean;
  submitDisabled: boolean;
  reason?: string;
}

export function getRegistrationSubmitRules(
  mode: RegistrationMode,
  dynamicFieldCount: number,
): RegistrationSubmitRules {
  if (mode === 'informative') {
    return {
      requiresDynamicForm: false,
      showSubmitButton: false,
      submitDisabled: true,
      reason: 'Conteúdo apenas informativo: inscrição está desabilitada.',
    };
  }

  const hasDynamicFields = dynamicFieldCount > 0;

  return {
    requiresDynamicForm: true,
    showSubmitButton: true,
    submitDisabled: !hasDynamicFields,
    reason: hasDynamicFields
      ? undefined
      : 'Adicione ao menos um campo no formulário dinâmico para habilitar inscrições.',
  };
}
