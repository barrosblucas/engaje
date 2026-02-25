'use client';

import { useAdminPrograms, useSetProgramHomeHighlight } from '@/shared/hooks/use-admin';
import { useLogout, useMe } from '@/shared/hooks/use-auth';
import Link from 'next/link';
import { useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  closed: 'Encerrado',
  cancelled: 'Cancelado',
};

const MODE_LABELS: Record<string, string> = {
  registration: 'Inscrição',
  informative: 'Informativo',
};

export default function AdminProgramasPage() {
  const { data: meData } = useMe();
  const { mutate: logout } = useLogout();
  const { data, isLoading, isError } = useAdminPrograms({});
  const { mutate: setProgramHomeHighlight, isPending: isSettingHomeHighlight } =
    useSetProgramHomeHighlight();
  const [pendingProgramId, setPendingProgramId] = useState<string | null>(null);

  function handleSetAsHomeProgram(programId: string) {
    setPendingProgramId(programId);
    setProgramHomeHighlight(
      { id: programId, isHighlightedOnHome: true },
      { onSettled: () => setPendingProgramId(null) },
    );
  }

  return (
    <div className="app-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Gestão de Programas</h1>
            {meData?.user ? <p className="welcome">Admin: {meData.user.name}</p> : null}
          </div>

          <div className="header-actions">
            <Link href="/app/admin/eventos" className="btn-secondary">
              Eventos
            </Link>
            <Link href="/app/admin/programas/novo" className="btn-primary">
              + Novo Programa
            </Link>
            <button type="button" onClick={() => logout(undefined)} className="btn-ghost">
              Sair
            </button>
          </div>
        </div>

        {isLoading ? <p>Carregando programas...</p> : null}
        {isError ? <p className="error-message">Erro ao carregar programas.</p> : null}

        {data && data.data.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum programa cadastrado.</p>
            <Link href="/app/admin/programas/novo" className="btn-primary">
              Criar primeiro programa
            </Link>
          </div>
        ) : null}

        {data && data.data.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Modo</th>
                  <th>Vagas</th>
                  <th>Início</th>
                  <th>Home</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {data.data.map((program) => (
                  <tr key={program.id}>
                    <td>{program.title}</td>
                    <td>{program.category}</td>
                    <td>
                      <span className={`status-badge status-${program.status}`}>
                        {STATUS_LABELS[program.status] ?? program.status}
                      </span>
                    </td>
                    <td>{MODE_LABELS[program.registrationMode] ?? program.registrationMode}</td>
                    <td>
                      {program.registeredCount}/{program.totalSlots ?? '∞'}
                    </td>
                    <td>
                      {new Date(program.startDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      {program.isHighlightedOnHome ? (
                        <span className="status-badge status-published">Ativo</span>
                      ) : program.status === 'published' ? (
                        <button
                          type="button"
                          className="btn-sm"
                          onClick={() => handleSetAsHomeProgram(program.id)}
                          disabled={isSettingHomeHighlight}
                        >
                          {pendingProgramId === program.id && isSettingHomeHighlight
                            ? 'Ativando...'
                            : 'Definir ativo'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Indisponível</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <Link href={`/app/admin/programas/${program.id}`} className="btn-sm">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.meta.totalPages > 1 ? (
              <p className="pagination-info">
                {data.meta.total} programas • Página {data.meta.page} de {data.meta.totalPages}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
