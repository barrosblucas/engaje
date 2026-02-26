'use client';

import { DynamicFormFields } from '@/components/dynamic-form/dynamic-form-fields';
import { formatEventDate } from '@/lib/public-events';
import { ApiError } from '@/shared/api-client';
import { getRegistrationSubmitRules } from '@/shared/dynamic-form/mode-rules';
import { useCreateRegistration, usePublicEvent } from '@/shared/hooks/use-events';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface RegistrationResult {
  protocolNumber: string;
  id: string;
}

type Step = 'form' | 'confirmation';

function resolveSlug(slug: string | string[] | undefined): string {
  if (Array.isArray(slug)) {
    return slug[0] ?? '';
  }

  return slug ?? '';
}

export default function NovaInscricaoPage() {
  const params = useParams<{ slug: string | string[] }>();
  const router = useRouter();
  const slug = resolveSlug(params.slug);
  const redirectPath = `/app/inscricoes/nova/${slug}`;

  const { data, isLoading, isError } = usePublicEvent(slug);
  const { mutate, isPending } = useCreateRegistration();
  const [step, setStep] = useState<Step>('form');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="app-page">
        <div className="container">
          <p>Carregando formulário de inscrição...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="app-page">
        <div className="container">
          <div className="space-y-4 rounded-3xl border border-danger-200 bg-danger-50 p-5">
            <h1 className="font-display text-2xl font-semibold text-danger-800">
              Não foi possível carregar este evento
            </h1>
            <p className="text-sm text-danger-800">
              Verifique se o evento está publicado e tente novamente.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/public/eventos" className="btn-secondary">
                Voltar para eventos
              </Link>
              <Link href="/app/inscricoes" className="btn-primary">
                Minhas inscrições
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const event = data.data;
  const isOpen = event.status === 'published';
  const isInformativeMode = event.registrationMode === 'informative';
  const isFull = event.availableSlots !== null && event.availableSlots <= 0;
  const fields = event.dynamicFormSchema?.fields ?? [];
  const submitRules = getRegistrationSubmitRules(event.registrationMode, fields.length);
  const submitDisabled =
    isPending || !isOpen || isInformativeMode || isFull || submitRules.submitDisabled;
  const submitMessage = !isOpen
    ? event.status === 'closed'
      ? 'As inscrições deste evento foram encerradas.'
      : 'Este evento está indisponível no momento.'
    : isInformativeMode
      ? 'Este conteúdo está em modo informativo e não aceita inscrições.'
      : isFull
        ? 'Vagas esgotadas no momento.'
        : submitRules.reason;

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError(null);

    if (submitDisabled) {
      setError(submitMessage ?? 'Inscrição indisponível neste momento.');
      return;
    }

    mutate(
      {
        eventId: event.id,
        formData: values,
      },
      {
        onSuccess: (response) => {
          setResult({
            id: response.registration.id,
            protocolNumber: response.registration.protocolNumber,
          });
          setStep('confirmation');
        },
        onError: (mutationError) => {
          if (mutationError instanceof ApiError) {
            if (mutationError.status === 401) {
              router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
              return;
            }

            if (mutationError.status === 409) {
              setError('Você já está inscrito neste evento.');
              return;
            }

            if (mutationError.status === 422) {
              setError(mutationError.message);
              return;
            }
          }

          setError('Não foi possível concluir a inscrição. Tente novamente.');
        },
      },
    );
  }

  if (step === 'confirmation' && result) {
    return (
      <div className="app-page">
        <div className="container">
          <div className="mx-auto w-full max-w-2xl space-y-4 rounded-3xl border border-success-200 bg-success-50/80 p-6 animate-enter">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-success-600 text-xl font-bold text-white animate-success-pop">
              ✓
            </div>

            <div className="space-y-1">
              <h1 className="font-display text-3xl font-semibold text-success-900">
                Inscrição confirmada
              </h1>
              <p className="text-sm text-success-800">
                Você está inscrito em <strong>{event.title}</strong>.
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

            <div className="flex flex-wrap gap-3">
              <Link href="/app/inscricoes" className="btn-primary">
                Ver minhas inscrições
              </Link>
              <Link href={`/public/eventos/${slug}`} className="btn-secondary">
                Voltar ao evento
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="container space-y-6">
        <div className="space-y-2">
          <Link href={`/public/eventos/${slug}`} className="btn-secondary">
            Voltar para evento
          </Link>
          <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
            {event.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {formatEventDate(event.startDate, event.endDate)} • {event.locationName}
          </p>
        </div>

        <div className="rounded-3xl border border-brand-200/70 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Inscrição</h2>
          <p className="mt-2 text-sm text-slate-600">
            Faça sua inscrição preenchendo os campos obrigatórios para concluir sua participação.
          </p>

          {!isOpen || isInformativeMode || isFull ? (
            <div className="mt-4 rounded-2xl border border-warning-100 bg-warning-100/65 p-4 text-sm font-medium text-warning-700">
              {submitMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4" aria-live="polite">
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
                disabled={isPending || submitDisabled}
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
                disabled={submitDisabled}
              >
                {isPending ? 'Inscrevendo...' : 'Confirmar inscrição'}
              </button>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
                Inscrições desabilitadas para este conteúdo.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
