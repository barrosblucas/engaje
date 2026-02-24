'use client';

import { getRegistrationSubmitRules } from '@/shared/dynamic-form/mode-rules';
import type { DynamicForm, RegistrationMode } from '@engaje/contracts';
import { DynamicFormFields } from './dynamic-form-fields';

interface DynamicFormPreviewProps {
  mode: RegistrationMode;
  schema: DynamicForm | undefined;
  showSubmitButton?: boolean;
}

export function DynamicFormPreview({
  mode,
  schema,
  showSubmitButton = true,
}: DynamicFormPreviewProps) {
  const fields = schema?.fields ?? [];
  const rules = getRegistrationSubmitRules(mode, fields.length);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-lg font-semibold text-slate-900">Preview do formulário final</h3>
      <p className="mt-1 text-sm text-slate-600">
        Visualização aproximada de como os cidadãos verão este fluxo público.
      </p>

      <div className="mt-4 space-y-4">
        {fields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            Sem campos no formulário dinâmico.
          </div>
        ) : (
          <DynamicFormFields fields={fields} values={{}} disabled />
        )}

        {showSubmitButton ? (
          <>
            {rules.showSubmitButton ? (
              <button type="button" className="btn-primary w-full" disabled={rules.submitDisabled}>
                Confirmar inscrição
              </button>
            ) : (
              <div className="rounded-2xl border border-warning-100 bg-warning-100/60 px-4 py-3 text-sm font-medium text-warning-700">
                Inscrição oculta no modo informativo.
              </div>
            )}

            {rules.reason ? <p className="text-xs text-slate-500">{rules.reason}</p> : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
