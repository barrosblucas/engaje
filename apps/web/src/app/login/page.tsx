'use client';

import { useLogin } from '@/shared/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/app/inscricoes';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    mutate(
      { identifier, password },
      {
        onSuccess: () => {
          router.push(redirect);
        },
        onError: () => {
          setError('E-mail/CPF ou senha incorretos.');
        },
      },
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Entrar</h1>
        <p>Use seu e-mail ou CPF e senha para acessar.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="identifier">E-mail ou CPF</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="seu@email.com ou 999.999.999-99"
              required
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary btn-full" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-alt">
          Não tem conta? <a href="/registro">Cadastre-se gratuitamente</a>
        </p>
      </div>
    </div>
  );
}
