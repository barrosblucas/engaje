'use client';

import type { DynamicFormField } from '@engaje/contracts';

interface DynamicFormFieldsProps {
  fields: DynamicFormField[];
  values: Record<string, unknown>;
  onChange?: (fieldId: string, value: unknown) => void;
  disabled?: boolean;
}

function getStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getNumberValue(value: unknown): string {
  return typeof value === 'number' ? String(value) : '';
}

function getBooleanValue(value: unknown): boolean {
  return value === true;
}

function getArrayValue(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

export function DynamicFormFields({
  fields,
  values,
  onChange,
  disabled = false,
}: DynamicFormFieldsProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const fieldValue = values[field.id];
        const isDisabled = disabled || !onChange;

        return (
          <div key={field.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor={field.id}>
              {field.label}
              {field.required ? <span className="text-danger-700"> *</span> : null}
            </label>

            {field.helpText ? (
              <p className="mb-2 text-xs text-slate-500">{field.helpText}</p>
            ) : null}

            {field.type === 'short_text' ? (
              <input
                id={field.id}
                type="text"
                value={getStringValue(fieldValue)}
                onChange={(event) => onChange?.(field.id, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isDisabled}
              />
            ) : null}

            {field.type === 'paragraph' ? (
              <textarea
                id={field.id}
                value={getStringValue(fieldValue)}
                onChange={(event) => onChange?.(field.id, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isDisabled}
                rows={4}
              />
            ) : null}

            {field.type === 'number' ? (
              <input
                id={field.id}
                type="number"
                value={getNumberValue(fieldValue)}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  onChange?.(field.id, nextValue === '' ? '' : Number(nextValue));
                }}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isDisabled}
              />
            ) : null}

            {field.type === 'date' ? (
              <input
                id={field.id}
                type="date"
                value={getStringValue(fieldValue)}
                onChange={(event) => onChange?.(field.id, event.target.value)}
                required={field.required}
                disabled={isDisabled}
              />
            ) : null}

            {field.type === 'single_select' ? (
              <select
                id={field.id}
                value={getStringValue(fieldValue)}
                onChange={(event) => onChange?.(field.id, event.target.value)}
                required={field.required}
                disabled={isDisabled}
              >
                <option value="">Selecione</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            {field.type === 'multi_select' ? (
              <div className="space-y-2">
                {(field.options ?? []).map((option) => {
                  const selected = getArrayValue(fieldValue);
                  const isChecked = selected.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={(event) => {
                          const nextValue = event.target.checked
                            ? [...selected, option.value]
                            : selected.filter((item) => item !== option.value);
                          onChange?.(field.id, nextValue);
                        }}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            ) : null}

            {field.type === 'checkbox' || field.type === 'terms' ? (
              <label className="flex items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input
                  id={field.id}
                  type="checkbox"
                  checked={getBooleanValue(fieldValue)}
                  onChange={(event) => onChange?.(field.id, event.target.checked)}
                  required={field.required}
                  disabled={isDisabled}
                />
                <span>{field.placeholder || field.label}</span>
              </label>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
