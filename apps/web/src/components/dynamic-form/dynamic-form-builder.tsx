'use client';

import {
  type BuilderFieldDraft,
  DYNAMIC_FIELD_TYPE_OPTIONS,
  createBuilderField,
  isOptionFieldType,
  reorderBuilderFields,
  sanitizeFieldIdentifier,
} from '@/shared/dynamic-form/builder-utils';
import type { DynamicFormFieldType } from '@engaje/contracts';
import { useState } from 'react';

interface DynamicFormBuilderProps {
  fields: BuilderFieldDraft[];
  onChange: (fields: BuilderFieldDraft[]) => void;
  disabled?: boolean;
}

export function DynamicFormBuilder({
  fields,
  onChange,
  disabled = false,
}: DynamicFormBuilderProps) {
  const [nextFieldType, setNextFieldType] = useState<DynamicFormFieldType>('short_text');

  function updateField(index: number, patch: Partial<BuilderFieldDraft>) {
    onChange(
      fields.map((field, fieldIndex) =>
        fieldIndex === index
          ? {
              ...field,
              ...patch,
            }
          : field,
      ),
    );
  }

  function addField() {
    const newField = createBuilderField(nextFieldType, fields.length);
    onChange([...fields, newField]);
  }

  function removeField(index: number) {
    onChange(fields.filter((_, fieldIndex) => fieldIndex !== index));
  }

  function moveField(index: number, direction: -1 | 1) {
    onChange(reorderBuilderFields(fields, index, index + direction));
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-lg font-semibold text-slate-900">Builder de campos</h3>
        <p className="mt-1 text-sm text-slate-600">
          Adicione e configure os campos que aparecerão no formulário final de inscrição.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="field">
            <label htmlFor="new-field-type">Tipo de campo</label>
            <select
              id="new-field-type"
              value={nextFieldType}
              onChange={(event) => setNextFieldType(event.target.value as DynamicFormFieldType)}
              disabled={disabled}
            >
              {DYNAMIC_FIELD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-primary self-end"
            onClick={addField}
            disabled={disabled}
          >
            + Adicionar campo
          </button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          Nenhum campo criado ainda.
        </div>
      ) : null}

      {fields.map((field, index) => (
        <article
          key={field.draftKey}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-base font-semibold text-slate-900">Campo {index + 1}</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-sm"
                disabled={disabled || index === 0}
                onClick={() => moveField(index, -1)}
              >
                ↑ Subir
              </button>
              <button
                type="button"
                className="btn-sm"
                disabled={disabled || index === fields.length - 1}
                onClick={() => moveField(index, 1)}
              >
                ↓ Descer
              </button>
              <button
                type="button"
                className="btn-danger-ghost"
                disabled={disabled}
                onClick={() => removeField(index)}
              >
                Remover
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="field md:col-span-2">
              <label htmlFor={`field-label-${field.draftKey}`}>Rótulo *</label>
              <input
                id={`field-label-${field.draftKey}`}
                value={field.label}
                onChange={(event) => {
                  const nextLabel = event.target.value;
                  updateField(index, {
                    label: nextLabel,
                    id: field.id ? field.id : sanitizeFieldIdentifier(nextLabel),
                  });
                }}
                disabled={disabled}
                required
              />
            </div>

            <div className="field">
              <label htmlFor={`field-id-${field.draftKey}`}>Identificador</label>
              <input
                id={`field-id-${field.draftKey}`}
                value={field.id}
                onChange={(event) =>
                  updateField(index, {
                    id: sanitizeFieldIdentifier(event.target.value),
                  })
                }
                placeholder="ex: cpf"
                disabled={disabled}
              />
            </div>

            <div className="field">
              <label htmlFor={`field-type-${field.draftKey}`}>Tipo</label>
              <select
                id={`field-type-${field.draftKey}`}
                value={field.type}
                onChange={(event) => {
                  const nextType = event.target.value as DynamicFormFieldType;
                  updateField(index, {
                    type: nextType,
                    optionsText: isOptionFieldType(nextType) ? field.optionsText : '',
                  });
                }}
                disabled={disabled}
              >
                {DYNAMIC_FIELD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field md:col-span-2">
              <label htmlFor={`field-placeholder-${field.draftKey}`}>Placeholder</label>
              <input
                id={`field-placeholder-${field.draftKey}`}
                value={field.placeholder}
                onChange={(event) =>
                  updateField(index, {
                    placeholder: event.target.value,
                  })
                }
                disabled={disabled}
              />
            </div>

            <div className="field md:col-span-2">
              <label htmlFor={`field-help-${field.draftKey}`}>Texto de ajuda</label>
              <input
                id={`field-help-${field.draftKey}`}
                value={field.helpText}
                onChange={(event) =>
                  updateField(index, {
                    helpText: event.target.value,
                  })
                }
                disabled={disabled}
              />
            </div>

            {isOptionFieldType(field.type) ? (
              <div className="field md:col-span-2">
                <label htmlFor={`field-options-${field.draftKey}`}>Opções (uma por linha) *</label>
                <textarea
                  id={`field-options-${field.draftKey}`}
                  rows={4}
                  value={field.optionsText}
                  onChange={(event) =>
                    updateField(index, {
                      optionsText: event.target.value,
                    })
                  }
                  disabled={disabled}
                />
              </div>
            ) : null}

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(event) =>
                  updateField(index, {
                    required: event.target.checked,
                  })
                }
                disabled={disabled}
              />
              Campo obrigatório
            </label>
          </div>
        </article>
      ))}
    </section>
  );
}
