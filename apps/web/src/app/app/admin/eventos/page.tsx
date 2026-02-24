'use client';

import { useAdminEvents } from '@/shared/hooks/use-admin';
import { useLogout, useMe } from '@/shared/hooks/use-auth';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  closed: 'Encerrado',
  cancelled: 'Cancelado',
};

export default function AdminEventosPage() {
  const { data: meData } = useMe();
  const me = meData?.user;
  const { data, isLoading, isError } = useAdminEvents({});
  const { mutate: logout } = useLogout();

  return (
    <div className="app-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Gestão de Eventos</h1>
            {me && <p className="welcome">Admin: {me.name}</p>}
          </div>
          <div className="header-actions">
            <Link href="/app/admin/eventos/novo" className="btn-primary">
              + Novo Evento
            </Link>
            <button type="button" onClick={() => logout(undefined)} className="btn-ghost">
              Sair
            </button>
          </div>
        </div>

        {isLoading && <p>Carregando eventos...</p>}
        {isError && <p className="error-message">Erro ao carregar eventos.</p>}

        {data && data.data.length === 0 && (
          <div className="empty-state">
            <p>Nenhum evento cadastrado.</p>
            <Link href="/app/admin/eventos/novo" className="btn-primary">
              Criar primeiro evento
            </Link>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Vagas</th>
                  <th>Início</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{event.category}</td>
                    <td>
                      <span className={`status-badge status-${event.status}`}>
                        {STATUS_LABELS[event.status] ?? event.status}
                      </span>
                    </td>
                    <td>
                      {event.registeredCount}/{event.totalSlots ?? '∞'}
                    </td>
                    <td>
                      {new Date(event.startDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="actions-cell">
                      <Link href={`/app/admin/eventos/${event.id}`} className="btn-sm">
                        Editar
                      </Link>
                      <Link href={`/app/admin/eventos/${event.id}/inscricoes`} className="btn-sm">
                        Inscrições
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.meta.totalPages > 1 && (
              <p className="pagination-info">
                {data.meta.total} eventos • Página {data.meta.page} de {data.meta.totalPages}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
