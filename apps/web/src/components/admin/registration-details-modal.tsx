'use client';

import { Modal } from '@/components/ui/modal';
import {
  formatAdminRegistrationDateTime,
  mapRegistrationAnswers,
} from '@/lib/registration-answers';
import type { AdminRegistration, DynamicForm } from '@engaje/contracts';

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  attended: 'Compareceu',
  no_show: 'Não compareceu',
};

interface RegistrationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  registration: AdminRegistration | null;
  dynamicFormSchema?: DynamicForm | null;
  candidateNumber?: number | null;
}

export function RegistrationDetailsModal({
  open,
  onClose,
  registration,
  dynamicFormSchema,
  candidateNumber,
}: RegistrationDetailsModalProps) {
  const answers = mapRegistrationAnswers(registration?.formData, dynamicFormSchema);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={candidateNumber ? `Candidato ${candidateNumber}` : 'Detalhes da inscrição'}
    >
      {registration ? (
        <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
          <div className="grid gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">Nome:</span>{' '}
              {registration.user.name}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">E-mail:</span>{' '}
              {registration.user.email}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">CPF:</span>{' '}
              {registration.user.cpf ?? 'Não informado'}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">Telefone:</span>{' '}
              {registration.user.phone ?? 'Não informado'}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">Protocolo:</span>{' '}
              {registration.protocolNumber}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">Status:</span>{' '}
              {STATUS_LABELS[registration.status] ?? registration.status}
            </p>
            <p>
              <span className="font-semibold text-[var(--color-text-primary)]">
                Data da inscrição:
              </span>{' '}
              {formatAdminRegistrationDateTime(registration.createdAt)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-[var(--color-text-primary)]">
              Informações preenchidas
            </p>
            {answers.length > 0 ? (
              <div className="space-y-2">
                {answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
                  >
                    <p className="font-semibold text-[var(--color-text-primary)]">{answer.label}</p>
                    <p>{answer.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Esta inscrição não possui dados de formulário preenchidos.</p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
