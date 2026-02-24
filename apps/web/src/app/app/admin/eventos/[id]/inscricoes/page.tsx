'use client';

import { useAdminRegistrations, useExportRegistrationsCsv } from '@/shared/hooks/use-admin';
import { use, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  attended: 'Compareceu',
  no_show: 'Não compareceu',
};

export default function AdminInscricoesPage({ params }: PageProps) {
  const { id } = use(params);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminRegistrations(id, { page, search });
  const { mutate: exportCsv, isPending: exporting } = useExportRegistrationsCsv(id);

  return (
    <div className="app-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Inscrições do Evento</h1>
            {data && <p className="welcome">{data.meta.total} inscrições</p>}
          </div>
          <div className="header-actions">
            <button
              type="button"
              onClick={() => exportCsv()}
              disabled={exporting}
              className="btn-secondary"
            >
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
            <a href="/app/admin/eventos" className="btn-ghost">
              ← Voltar
            </a>
          </div>
        </div>

        <div className="filters-bar">
          <input
            type="search"
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="search-input"
          />
        </div>

        {isLoading && <p>Carregando...</p>}
        {isError && <p className="error-message">Erro ao carregar inscrições.</p>}

        {data && data.data.length === 0 && (
          <div className="empty-state">
            <p>Nenhuma inscrição encontrada.</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Protocolo</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((reg) => (
                    <tr key={reg.id}>
                      <td>{reg.user.name}</td>
                      <td>{reg.user.email}</td>
                      <td>{reg.user.cpf}</td>
                      <td>{reg.user.phone ?? '—'}</td>
                      <td>
                        <code>{reg.protocolNumber}</code>
                      </td>
                      <td>
                        <span className={`status-badge status-${reg.status}`}>
                          {STATUS_LABELS[reg.status] ?? reg.status}
                        </span>
                      </td>
                      <td>
                        {new Date(reg.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.meta.totalPages > 1 && (
              <nav className="pagination">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  {page} / {data.meta.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="pagination-btn"
                >
                  Próximo →
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
