'use client';

import { useCreateRegistration } from '@/shared/hooks/use-events';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
  eventId: string;
  eventTitle: string;
  redirectPath: string;
}

type Step = 'form' | 'confirmation';

interface RegistrationResult {
  protocolNumber: string;
  id: string;
}

export function QuickRegistrationForm({ eventId, eventTitle, redirectPath }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useCreateRegistration();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    mutate(eventId, {
      onSuccess: (data) => {
        setResult({ protocolNumber: data.registration.protocolNumber, id: data.registration.id });
        setStep('confirmation');
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : 'Erro ao realizar inscrição.';

        if (message.includes('409') || message.toLowerCase().includes('already')) {
          setError('Você já está inscrito neste evento.');
          return;
        }

        if (message.includes('401')) {
          setError('Faça login para se inscrever.');
          return;
        }

        setError('Erro ao realizar inscrição. Tente novamente.');
      },
    });
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

        <p className="text-sm text-slate-600">
          Guarde este número para apresentação no dia do evento.
        </p>

        <Link href="/app/inscricoes" className="action-secondary w-full justify-center text-sm">
          Ver minhas inscrições
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
      <p className="text-sm leading-relaxed text-slate-600">
        Confirme sua inscrição em 1 clique. É necessário estar com login ativo.
      </p>

      {error ? (
        <div className="rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-800">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="action-primary cta-pulse w-full justify-center"
        disabled={isPending}
      >
        {isPending ? 'Inscrevendo...' : 'Confirmar inscrição'}
      </button>

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
