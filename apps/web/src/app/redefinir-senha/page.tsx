'use client';

import { useResetPassword } from '@/shared/hooks/use-auth';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <RedefinirSenhaPageContent />
    </Suspense>
  );
}

function RedefinirSenhaPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useResetPassword();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError('Link inválido. Solicite uma nova recuperação de senha.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da senha não confere.');
      return;
    }

    mutate(
      {
        token,
        newPassword,
      },
      {
        onSuccess: () => {
          setMessage('Senha redefinida com sucesso. Faça login com a nova senha.');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (mutationError) => {
          setError(
            mutationError instanceof Error
              ? mutationError.message
              : 'Não foi possível redefinir a senha.',
          );
        },
      },
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Redefinir senha</h1>
        <p>Digite sua nova senha para concluir a recuperação de acesso.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="newPassword">Nova senha</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirmar nova senha</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="form-error">{error}</div>}
          {message && <p>{message}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        <p className="auth-alt">
          Voltar para <a href="/login">login</a>
        </p>
      </div>
    </div>
  );
}
