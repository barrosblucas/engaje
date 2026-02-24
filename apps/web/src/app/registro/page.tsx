'use client';

import { useRegister } from '@/shared/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

export default function RegistroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useRegister();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    if (name === 'cpf') {
      setForm((f) => ({ ...f, cpf: formatCpf(value) }));
    } else if (name === 'phone') {
      setForm((f) => ({ ...f, phone: formatPhone(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    mutate(
      {
        name: form.name,
        email: form.email,
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone.replace(/\D/g, '') || undefined,
        password: form.password,
      },
      {
        onSuccess: () => {
          router.push('/app/inscricoes');
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : '';
          if (message.includes('409') || message.toLowerCase().includes('duplicate')) {
            setError('E-mail ou CPF já cadastrado.');
          } else if (message.toLowerCase().includes('cpf')) {
            setError('CPF inválido.');
          } else {
            setError('Erro ao criar conta. Verifique os dados e tente novamente.');
          }
        },
      },
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Criar conta</h1>
        <p>Cadastre-se para acompanhar suas inscrições.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Seu nome"
              required
              minLength={3}
            />
          </div>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              value={form.cpf}
              onChange={handleChange}
              placeholder="999.999.999-99"
              required
              inputMode="numeric"
            />
          </div>

          <div className="field">
            <label htmlFor="phone">Telefone (opcional)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              inputMode="numeric"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repita a senha"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary btn-full" disabled={isPending}>
            {isPending ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-alt">
          Já tem conta? <a href="/login">Entrar</a>
        </p>
      </div>
    </div>
  );
}
