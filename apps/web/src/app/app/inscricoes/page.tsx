'use client';

import { useLogout, useMe } from '@/shared/hooks/use-auth';
import { useCancelRegistration, useUserRegistrations } from '@/shared/hooks/use-events';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

export default function InscricoesPage() {
  const router = useRouter();
  const { data: meData } = useMe();
  const me = meData?.user;
  const isAdmin = me?.role === 'admin' || me?.role === 'super_admin';
  const { data, isLoading, isError } = useUserRegistrations();
  const { mutate: cancel, isPending: cancelling } = useCancelRegistration();
  const { mutate: logout } = useLogout();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  function handleCancel(id: string) {
    if (!confirm('Deseja cancelar esta inscrição?')) return;
    setCancellingId(id);
    cancel(id, {
      onSettled: () => setCancellingId(null),
    });
  }

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => router.push('/public'),
    });
  }

  return (
    <div className="app-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Minhas Inscrições</h1>
            {me && <p className="welcome">Olá, {me.name}</p>}
          </div>
          <div className="header-actions">
            {isAdmin ? (
              <a href="/app/admin/eventos" className="btn-secondary">
                Gestão de eventos
              </a>
            ) : (
              <a href="/public/eventos" className="btn-secondary">
                Ver eventos
              </a>
            )}
            <button type="button" onClick={handleLogout} className="btn-ghost">
              Sair
            </button>
          </div>
        </div>

        {isLoading && <p>Carregando...</p>}
        {isError && <p className="error-message">Erro ao carregar inscrições.</p>}

        {data && data.data.length === 0 && (
          <div className="empty-state">
            <p>Você ainda não tem inscrições.</p>
            {isAdmin ? (
              <a href="/app/admin/eventos" className="btn-primary">
                Ir para gestão de eventos
              </a>
            ) : (
              <a href="/public/eventos" className="btn-primary">
                Explorar eventos
              </a>
            )}
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="registrations-list">
            {data.data.map((reg) => (
              <div key={reg.id} className="registration-item">
                <div className="reg-info">
                  <h3>{reg.event.title}</h3>
                  <p className="reg-date">
                    {new Date(reg.event.startDate).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  {reg.event.locationName && (
                    <p className="reg-location">{reg.event.locationName}</p>
                  )}
                  <p className="reg-protocol">
                    Protocolo: <strong>{reg.protocolNumber}</strong>
                  </p>
                </div>

                <div className="reg-actions">
                  <span className={`status-badge ${STATUS_CLASS[reg.status] ?? ''}`}>
                    {STATUS_LABELS[reg.status] ?? reg.status}
                  </span>

                  <Link href={`/app/inscricoes/${reg.id}`} className="btn-secondary">
                    Ver comprovante
                  </Link>

                  {reg.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => handleCancel(reg.id)}
                      disabled={cancelling && cancellingId === reg.id}
                      className="btn-danger-ghost"
                    >
                      {cancelling && cancellingId === reg.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
