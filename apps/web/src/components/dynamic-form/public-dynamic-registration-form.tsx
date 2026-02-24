'use client';

import { getRegistrationSubmitRules } from '@/shared/dynamic-form/mode-rules';
import { useCreateRegistration } from '@/shared/hooks/use-events';
import type { DynamicForm, RegistrationMode } from '@engaje/contracts';
import Link from 'next/link';
import { useState } from 'react';
import { DynamicFormFields } from './dynamic-form-fields';

interface PublicDynamicRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  redirectPath: string;
  mode: RegistrationMode;
  schema: DynamicForm | null | undefined;
}

interface RegistrationResult {
  protocolNumber: string;
  id: string;
}

type Step = 'form' | 'confirmation';

export function PublicDynamicRegistrationForm({
  eventId,
  eventTitle,
  redirectPath,
  mode,
  schema,
}: PublicDynamicRegistrationFormProps) {
  const [step, setStep] = useState<Step>('form');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCreateRegistration();
  const fields = schema?.fields ?? [];
  const submitRules = getRegistrationSubmitRules(mode, fields.length);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!submitRules.showSubmitButton || submitRules.submitDisabled) {
      setError(submitRules.reason ?? 'Inscrição indisponível neste momento.');
      return;
    }

    mutate(
      {
        eventId,
        formData: values,
      },
      {
        onSuccess: (response) => {
          setResult({
            protocolNumber: response.registration.protocolNumber,
            id: response.registration.id,
          });
          setStep('confirmation');
        },
        onError: (mutationError) => {
          const message =
            mutationError instanceof Error ? mutationError.message : 'Erro inesperado.';

          if (message.includes('409') || message.toLowerCase().includes('already')) {
            setError('Você já está inscrito neste evento.');
            return;
          }

          if (message.includes('401')) {
            setError('Faça login para concluir a inscrição.');
            return;
          }

          setError('Não foi possível concluir a inscrição. Tente novamente.');
        },
      },
    );
  }

  if (step === 'confirmation' && result) {
    return (
      <div className="space-y-4 rounded-3xl border border-success-200 bg-success-50/80 p-5 animate-enter">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-success-600 text-xl font-bold text-white animate-success-pop">
          ✓
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-2xl font-semibold text-success-900">
            Inscrição confirmada
          </h3>
          <p className="text-sm text-success-800">
            Você está inscrito em <strong>{eventTitle}</strong>.
          </p>
        </div>

        <div className="rounded-2xl border border-success-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Protocolo
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-slate-900">
            {result.protocolNumber}
          </p>
        </div>

        <Link href="/app/inscricoes" className="action-secondary w-full justify-center text-sm">
          Ver minhas inscrições
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
      <p className="text-sm leading-relaxed text-slate-600">
        Preencha os campos obrigatórios para concluir sua inscrição.
      </p>

      {fields.length > 0 ? (
        <DynamicFormFields
          fields={fields}
          values={values}
          onChange={(fieldId, value) => {
            setValues((previous) => ({
              ...previous,
              [fieldId]: value,
            }));
          }}
          disabled={isPending}
        />
      ) : (
        <div className="rounded-2xl border border-warning-100 bg-warning-100/65 p-4 text-sm font-medium text-warning-700">
          Este evento ainda não possui campos configurados para inscrição.
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-800">
          {error}
        </div>
      ) : null}

      {submitRules.showSubmitButton ? (
        <button
          type="submit"
          className="action-primary cta-pulse w-full justify-center"
          disabled={isPending || submitRules.submitDisabled}
        >
          {isPending ? 'Inscrevendo...' : 'Confirmar inscrição'}
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
          Inscrições desabilitadas para este conteúdo.
        </div>
      )}

      <p className="text-xs text-slate-500">
        Não tem conta?{' '}
        <Link
          href={`/registro?redirect=${encodeURIComponent(redirectPath)}`}
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Cadastre-se gratuitamente
        </Link>
      </p>
    </form>
  );
}
