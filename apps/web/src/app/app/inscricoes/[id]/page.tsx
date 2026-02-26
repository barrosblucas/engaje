'use client';

import { useUserRegistrationDetail } from '@/shared/hooks/use-events';
import type { DynamicFormField } from '@engaje/contracts';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  attended: 'Compareceu',
  no_show: 'Não compareceu',
};

const STATUS_CLASS: Record<string, string> = {
  confirmed: 'status-confirmed',
  cancelled: 'status-cancelled',
  attended: 'status-attended',
  no_show: 'status-noshow',
};

function resolveParamId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAnswerValue(value: unknown, fieldType?: DynamicFormField['type']): string {
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

export default function InscricaoDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const registrationId = resolveParamId(params.id);
  const { data, isLoading, isError } = useUserRegistrationDetail(registrationId);

  const registration = data?.data;

  const mappedAnswers = useMemo(() => {
    if (!registration) return [];

    const formData = registration.formData ?? {};
    const fields = registration.event.dynamicFormSchema?.fields ?? [];
    const fieldMap = new Map(fields.map((field) => [field.id, field]));
    const mappedFromSchema = fields.map((field) => ({
      id: field.id,
      label: field.label,
      value: formatAnswerValue(formData[field.id], field.type),
    }));

    const orphanAnswers = Object.entries(formData)
      .filter(([fieldId]) => !fieldMap.has(fieldId))
      .map(([fieldId, value]) => ({
        id: fieldId,
        label: fieldId,
        value: formatAnswerValue(value),
      }));

    return [...mappedFromSchema, ...orphanAnswers];
  }, [registration]);

  if (isLoading) {
    return (
      <div className="app-page">
        <div className="container">
          <p>Carregando comprovante...</p>
        </div>
      </div>
    );
  }

  if (isError || !registration) {
    return (
      <div className="app-page">
        <div className="container">
          <div className="space-y-4 rounded-3xl border border-danger-200 bg-danger-50 p-5">
            <h1 className="font-display text-2xl font-semibold text-danger-800">
              Não foi possível carregar esta inscrição
            </h1>
            <p className="text-sm text-danger-800">
              Verifique se a inscrição existe e tente novamente.
            </p>
            <Link href="/app/inscricoes" className="btn-secondary">
              Voltar para minhas inscrições
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="container space-y-5">
        <div className="page-header">
          <div>
            <h1>Comprovante de inscrição</h1>
            <p className="welcome">{registration.event.title}</p>
          </div>
          <Link href="/app/inscricoes" className="btn-secondary">
            Voltar
          </Link>
        </div>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Protocolo
              </p>
              <p className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
                {registration.protocolNumber}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Status
              </p>
              <span className={`status-badge ${STATUS_CLASS[registration.status] ?? ''}`}>
                {STATUS_LABELS[registration.status] ?? registration.status}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Data da inscrição
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {formatDateTime(registration.createdAt)}
              </p>
            </div>

            {registration.cancelledAt ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  Data de cancelamento
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {formatDateTime(registration.cancelledAt)}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
            Dados do evento
          </h2>
          <div className="mt-3 grid gap-3 text-sm text-[var(--color-text-secondary)] md:grid-cols-2">
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">Evento:</span>{' '}
              {registration.event.title}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">Data:</span>{' '}
              {new Date(registration.event.startDate).toLocaleDateString('pt-BR')}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">Local:</span>{' '}
              {registration.event.locationName}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">Endereço:</span>{' '}
              {registration.event.locationAddress}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
            Informações preenchidas
          </h2>

          {mappedAnswers.length > 0 ? (
            <div className="mt-4 space-y-3">
              {mappedAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {answer.label}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{answer.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              Esta inscrição não possui dados de formulário preenchidos.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
