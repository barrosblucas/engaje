'use client';

import { useCreateManagedUser } from '@/shared/hooks/use-admin';
import { useLogout, useMe } from '@/shared/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { data: meData, isLoading } = useMe();
  const me = meData?.user;

  const { mutate: logout } = useLogout();
  const { mutate: createManagedUser, isPending } = useCreateManagedUser();

  const canCreateAdmin = me?.role === 'super_admin';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    role: 'citizen' as 'admin' | 'citizen',
  });

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const roleOptions = useMemo(
    () =>
      canCreateAdmin
        ? [
            { value: 'admin', label: 'Administrador' },
            { value: 'citizen', label: 'Comum' },
          ]
        : [{ value: 'citizen', label: 'Comum' }],
    [canCreateAdmin],
  );

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.push('/public'),
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password !== form.confirmPassword) {
      setError('A confirmação da senha não confere.');
      return;
    }

    if (form.role === 'citizen' && !form.cpf.replace(/\D/g, '')) {
      setError('CPF é obrigatório para usuário comum.');
      return;
    }

    createManagedUser(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, '') || undefined,
        cpf: form.role === 'citizen' ? form.cpf.replace(/\D/g, '') : undefined,
        password: form.password,
        role: canCreateAdmin ? form.role : 'citizen',
      },
      {
        onSuccess: () => {
          setMessage('Usuário criado com sucesso.');
          setForm({
            name: '',
            email: '',
            phone: '',
            cpf: '',
            password: '',
            confirmPassword: '',
            role: 'citizen',
          });
        },
        onError: (mutationError) => {
          setError(
            mutationError instanceof Error ? mutationError.message : 'Erro ao criar usuário.',
          );
        },
      },
    );
  }

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!me || (me.role !== 'admin' && me.role !== 'super_admin')) {
    return <p className="error-message">Acesso restrito a administradores.</p>;
  }

  return (
    <div className="app-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Criação de Usuários</h1>
            <p className="welcome">Cadastre usuários Comum ou Administrador.</p>
          </div>

          <div className="header-actions">
            <a href="/app/admin/eventos" className="btn-secondary">
              Eventos
            </a>
            <a href="/app/admin/programas" className="btn-secondary">
              Programas
            </a>
            <a href="/app/perfil" className="btn-secondary">
              Perfil
            </a>
            <button type="button" onClick={handleLogout} className="btn-ghost">
              Sair
            </button>
          </div>
        </div>

        <section className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
                minLength={2}
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="role">Função</label>
                <select
                  id="role"
                  value={canCreateAdmin ? form.role : 'citizen'}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value as 'admin' | 'citizen',
                    }))
                  }
                  disabled={!canCreateAdmin}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="phone">Celular</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: formatPhone(event.target.value),
                    }))
                  }
                  placeholder="(67) 99999-9999"
                />
              </div>
            </div>

            {form.role === 'citizen' && (
              <div className="field">
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  type="text"
                  value={form.cpf}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cpf: formatCpf(event.target.value),
                    }))
                  }
                  placeholder="999.999.999-99"
                  required
                />
              </div>
            )}

            <div className="field-row">
              <div className="field">
                <label htmlFor="password">Senha inicial</label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                  minLength={8}
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirmar senha</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  required
                  minLength={8}
                />
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}
            {message && <p>{message}</p>}

            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar usuário'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
