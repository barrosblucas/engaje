import type { AdminRegistration, DynamicForm } from '@engaje/contracts';
import {
  formatAdminRegistrationDateTime,
  mapRegistrationAnswers,
  sortRegistrationsByCreatedAtAscending,
} from './registration-answers';

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  attended: 'Compareceu',
  no_show: 'Não compareceu',
};

const PAGE_MARGIN = 40;
const BASE_LINE_HEIGHT = 16;

interface GenerateRegistrationsPdfInput {
  registrations: AdminRegistration[];
  eventTitle: string;
  eventSlug?: string;
  dynamicFormSchema?: DynamicForm | null;
  variant?: RegistrationsPdfVariant;
}

export type RegistrationsPdfVariant = 'with_answers' | 'without_answers';

function sanitizeFileSegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildRegistrationsPdfBase(base: string, variant: RegistrationsPdfVariant): string {
  const safeBase = sanitizeFileSegment(base) || 'evento';
  return variant === 'without_answers' ? `${safeBase}-sem-respostas` : safeBase;
}

export function buildRegistrationsPdfFileName(
  base: string,
  now = new Date(),
  variant: RegistrationsPdfVariant = 'with_answers',
): string {
  const safeBase = buildRegistrationsPdfBase(base, variant);
  const date = now.toISOString().slice(0, 10);
  return `inscricoes-${safeBase}-${date}.pdf`;
}

export async function generateRegistrationsPdf({
  registrations,
  eventTitle,
  eventSlug,
  dynamicFormSchema,
  variant = 'with_answers',
}: GenerateRegistrationsPdfInput): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const textWidth = pageWidth - PAGE_MARGIN * 2;

  let y = PAGE_MARGIN;

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight <= pageHeight - PAGE_MARGIN) return;
    doc.addPage();
    y = PAGE_MARGIN;
  };

  const writeText = (text: string, fontSize = 11, style: 'normal' | 'bold' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, textWidth) as string[];
    const requiredHeight = lines.length * BASE_LINE_HEIGHT;
    ensureSpace(requiredHeight);
    doc.text(lines, PAGE_MARGIN, y);
    y += requiredHeight;
  };

  const sortedRegistrations = sortRegistrationsByCreatedAtAscending(registrations);

  writeText(`Inscrições do evento: ${eventTitle}`, 16, 'bold');
  writeText(`Total de candidatos: ${sortedRegistrations.length}`, 11, 'normal');
  writeText(
    `Gerado em: ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    11,
    'normal',
  );
  y += 8;

  for (const [index, registration] of sortedRegistrations.entries()) {
    ensureSpace(140);
    writeText(`Candidato ${index + 1}`, 14, 'bold');
    writeText(`Nome: ${registration.user.name}`);
    writeText(`E-mail: ${registration.user.email}`);
    writeText(`CPF: ${registration.user.cpf ?? 'Não informado'}`);
    writeText(`Telefone: ${registration.user.phone ?? 'Não informado'}`);
    writeText(`Protocolo: ${registration.protocolNumber}`);
    writeText(`Status: ${STATUS_LABELS[registration.status] ?? registration.status}`);
    writeText(`Data da inscrição: ${formatAdminRegistrationDateTime(registration.createdAt)}`);

    if (variant === 'with_answers') {
      const mappedAnswers = mapRegistrationAnswers(registration.formData, dynamicFormSchema);

      if (mappedAnswers.length > 0) {
        writeText('Informações preenchidas:', 11, 'bold');
        for (const answer of mappedAnswers) {
          writeText(`${answer.label}: ${answer.value}`);
        }
      } else {
        writeText('Informações preenchidas: Não informado');
      }
    } else {
      writeText('Informações preenchidas: não incluídas nesta versão');
    }

    y += 10;
    ensureSpace(10);
    doc.setDrawColor(226, 232, 240);
    doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
    y += 14;
  }

  const filename = buildRegistrationsPdfFileName(eventSlug ?? eventTitle, new Date(), variant);
  doc.save(filename);
}
