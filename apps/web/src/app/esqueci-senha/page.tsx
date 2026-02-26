'use client';

import { useRequestPasswordReset } from '@/shared/hooks/use-auth';
import { useState } from 'react';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useRequestPasswordReset();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    mutate(
      { email: email.trim() },
      {
        onSuccess: (response) => {
          setMessage(response.message);
        },
        onError: (mutationError) => {
          setError(
            mutationError instanceof Error
              ? mutationError.message
              : 'Não foi possível processar a solicitação.',
          );
        },
      },
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Esqueci minha senha</h1>
        <p>
          Informe seu e-mail cadastrado para receber o link de redefinição. O link expira em{' '}
          <strong>2 horas</strong>.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          {error && <div className="form-error">{error}</div>}
          {message && <p>{message}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="auth-alt">
          Lembrou da senha? <a href="/login">Voltar para login</a>
        </p>
      </div>
    </div>
  );
}
