'use client';

import { RegistrationDetailsModal } from '@/components/admin/registration-details-modal';
import { formatAdminRegistrationDateTime, getCandidateNumber } from '@/lib/registration-answers';
import {
  useAdminEvent,
  useAdminRegistrations,
  useExportRegistrationsCsv,
  useExportRegistrationsPdf,
} from '@/shared/hooks/use-admin';
import type { AdminRegistration } from '@engaje/contracts';
import { use, useMemo, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  attended: 'Compareceu',
  no_show: 'Não compareceu',
};

const DEFAULT_PAGE_LIMIT = 50;

export default function AdminInscricoesPage({ params }: PageProps) {
  const { id } = use(params);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);

  const { data: eventData } = useAdminEvent(id);
  const { data, isLoading, isError } = useAdminRegistrations(id, {
    page,
    limit: DEFAULT_PAGE_LIMIT,
    search,
  });
  const { mutate: exportCsv, isPending: exporting } = useExportRegistrationsCsv(id);
  const { mutate: exportPdf, isPending: exportingPdf } = useExportRegistrationsPdf(id);

  const pageLimit = data?.meta.limit ?? DEFAULT_PAGE_LIMIT;

  const selectedRegistration = useMemo<AdminRegistration | null>(() => {
    if (!selectedRegistrationId || !data) return null;
    return data.data.find((registration) => registration.id === selectedRegistrationId) ?? null;
  }, [data, selectedRegistrationId]);

  const selectedRegistrationIndex = useMemo(() => {
    if (!selectedRegistrationId || !data) return -1;
    return data.data.findIndex((registration) => registration.id === selectedRegistrationId);
  }, [data, selectedRegistrationId]);

  const selectedCandidateNumber =
    selectedRegistrationIndex >= 0
      ? getCandidateNumber(page, pageLimit, selectedRegistrationIndex)
      : null;

  const handleExportPdf = () => {
    exportPdf({
      eventTitle: eventData?.title ?? 'Evento',
      eventSlug: eventData?.slug ?? id,
      dynamicFormSchema: eventData?.dynamicFormSchema,
    });
  };

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
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="btn-secondary"
            >
              {exportingPdf ? 'Gerando PDF...' : 'Gerar PDF'}
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
                    <th>#</th>
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
                  {data.data.map((reg, index) => {
                    const candidateNumber = getCandidateNumber(page, pageLimit, index);

                    return (
                      <tr
                        key={reg.id}
                        tabIndex={0}
                        className="cursor-pointer transition-colors hover:bg-[var(--color-bg)]"
                        onClick={() => setSelectedRegistrationId(reg.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedRegistrationId(reg.id);
                          }
                        }}
                      >
                        <td>{candidateNumber}</td>
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
                        <td>{formatAdminRegistrationDateTime(reg.createdAt)}</td>
                      </tr>
                    );
                  })}
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

        <RegistrationDetailsModal
          open={Boolean(selectedRegistration)}
          onClose={() => setSelectedRegistrationId(null)}
          registration={selectedRegistration}
          dynamicFormSchema={eventData?.dynamicFormSchema}
          candidateNumber={selectedCandidateNumber}
        />
      </div>
    </div>
  );
}
