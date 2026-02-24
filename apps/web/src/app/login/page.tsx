'use client';

import { DotMapCanvas } from '@/app/login/dot-map-canvas';
import {
  DEFAULT_LOGIN_REDIRECT,
  resolveLoginRedirect,
  resolveRoleHomeRedirect,
} from '@/app/login/login-redirect';
import { useLogin } from '@/shared/hooks/use-auth';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
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
  const redirect = resolveLoginRedirect(searchParams);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    mutate(
      { identifier, password },
      {
        onSuccess: (data) => {
          if (redirect !== DEFAULT_LOGIN_REDIRECT) {
            router.push(redirect);
            return;
          }

          router.push(resolveRoleHomeRedirect(data.user.role));
        },
        onError: () => {
          setError('E-mail/CPF ou senha incorretos.');
        },
      },
    );
  }

  return (
    <div className="login-page">
      <div className="login-shell page-transition">
        <section className="login-showcase" aria-hidden>
          <div className="login-showcase-overlay" />
          <DotMapCanvas />
          <div className="login-showcase-content">
            <div className="login-brand-icon">
              <ArrowRight size={20} aria-hidden />
            </div>
            <h2>Engaje</h2>
            <p>
              Acesse seu painel para acompanhar inscrições, eventos e iniciativas da Prefeitura de
              Bandeirantes/MS.
            </p>
          </div>
        </section>

        <section className="login-form-panel">
          <header className="login-form-header">
            <p className="login-eyebrow">Portal Municipal</p>
            <h1>Olá novamente</h1>
            <p>Entre com seu e-mail ou CPF para continuar.</p>
          </header>

          <form onSubmit={handleSubmit} className="auth-form login-form">
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
              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="login-submit" disabled={isPending}>
              <span>{isPending ? 'Entrando...' : 'Entrar'}</span>
              <ArrowRight size={16} aria-hidden />
            </button>
          </form>

          <div className="login-divider" role="presentation">
            <span>ou</span>
          </div>

          <div className="login-help-links">
            <a href="/public/contato">Esqueci minha senha</a>
            <p>
              Não tem conta? <a href="/registro">Cadastre-se gratuitamente</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
