'use client';

import { useChangePassword, useLogout, useMe, useUpdateProfile } from '@/shared/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function resolveHomeHref(role?: string): string {
  if (role === 'admin' || role === 'super_admin') {
    return '/app/admin/eventos';
  }

  return '/app/inscricoes';
}

export default function PerfilPage() {
  const router = useRouter();
  const { data: meData, isLoading } = useMe();
  const me = meData?.user;

  const { mutate: logout } = useLogout();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;

    setProfileForm({
      name: me.name,
      email: me.email,
      phone: me.phone ? formatPhone(me.phone) : '',
      cpf: me.cpf ?? '',
    });
  }, [me]);

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.push('/public'),
    });
  }

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);

    updateProfile(
      {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.replace(/\D/g, '') || null,
      },
      {
        onSuccess: () => {
          setProfileMessage('Dados atualizados com sucesso.');
        },
        onError: (error) => {
          setProfileError(error instanceof Error ? error.message : 'Erro ao atualizar perfil.');
        },
      },
    );
  }

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    changePassword(
      {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordMessage('Senha alterada com sucesso.');
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (error) => {
          setPasswordError(error instanceof Error ? error.message : 'Erro ao alterar senha.');
        },
      },
    );
  }

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!me) {
    return <p className="error-message">Não foi possível carregar o perfil.</p>;
  }

  const homeHref = resolveHomeHref(me.role);

  return (
    <div className="app-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Meu Perfil</h1>
            <p className="welcome">Atualize seus dados de acesso.</p>
          </div>
          <div className="header-actions">
            <a href={homeHref} className="btn-secondary">
              Voltar
            </a>
            <button type="button" onClick={handleLogout} className="btn-ghost">
              Sair
            </button>
          </div>
        </div>

        <div className="field-row">
          <section className="auth-card">
            <h2>Dados cadastrais</h2>
            <form className="auth-form" onSubmit={handleProfileSubmit}>
              <div className="field">
                <label htmlFor="name">Nome</label>
                <input
                  id="name"
                  type="text"
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, name: event.target.value }))
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
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="phone">Celular</label>
                <input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      phone: formatPhone(event.target.value),
                    }))
                  }
                  placeholder="(67) 99999-9999"
                />
              </div>

              <div className="field">
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" type="text" value={profileForm.cpf} readOnly disabled />
              </div>

              {profileError && <div className="form-error">{profileError}</div>}
              {profileMessage && <p>{profileMessage}</p>}

              <button type="submit" className="btn-primary" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Salvando...' : 'Salvar dados'}
              </button>
            </form>
          </section>

          <section className="auth-card">
            <h2>Alterar senha</h2>
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <div className="field">
                <label htmlFor="currentPassword">Senha atual</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  required
                  minLength={1}
                />
              </div>

              <div className="field">
                <label htmlFor="newPassword">Nova senha</label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirmar nova senha</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>

              {passwordError && <div className="form-error">{passwordError}</div>}
              {passwordMessage && <p>{passwordMessage}</p>}

              <button type="submit" className="btn-primary" disabled={isChangingPassword}>
                {isChangingPassword ? 'Alterando...' : 'Alterar senha'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
