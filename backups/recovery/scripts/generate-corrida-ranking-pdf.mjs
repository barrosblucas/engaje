import fs from 'node:fs';
import path from 'node:path';
import { jsPDF } from 'jspdf';

const [inputPathArg, outputPathArg, eventTitleArg] = process.argv.slice(2);

if (!inputPathArg || !outputPathArg) {
  console.error('Uso: node generate-corrida-ranking-pdf.mjs <input.ndjson> <output.pdf> [eventTitle]');
  process.exit(1);
}

const inputPath = path.resolve(inputPathArg);
const outputPath = path.resolve(outputPathArg);
const eventTitle =
  eventTitleArg ?? '1a Corrida Dia Internacional da Mulher - Bandeirantes/MS';

const raw = fs.readFileSync(inputPath, 'utf8');
const rows = raw
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const doc = new jsPDF({ unit: 'pt', format: 'a4' });
const margin = 40;
const baseLineHeight = 14;
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const textWidth = pageWidth - margin * 2;
let y = margin;

const ensureSpace = (requiredHeight) => {
  if (y + requiredHeight <= pageHeight - margin) return;
  doc.addPage();
  y = margin;
};

const writeText = (text, fontSize = 10, style = 'normal') => {
  doc.setFont('helvetica', style);
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(String(text ?? ''), textWidth);
  const requiredHeight = lines.length * baseLineHeight;
  ensureSpace(requiredHeight);
  doc.text(lines, margin, y);
  y += requiredHeight;
};

const formatDateTime = (value) => {
  if (!value) return 'Nao informado';
  const dt = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const normalizeValue = (value) => {
  if (value === null || value === undefined) return 'Nao informado';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Nao';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

writeText(`Classificacao final de inscricoes - ${eventTitle}`, 15, 'bold');
writeText(`Total de candidatos: ${rows.length}`, 11, 'normal');
writeText(
  `Gerado em: ${new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`,
  10,
  'normal',
);
y += 8;

for (const row of rows) {
  ensureSpace(170);
  writeText(`${row.posicao}. ${row.name || 'Sem nome'}`, 13, 'bold');
  writeText(`E-mail: ${normalizeValue(row.email)}`);
  writeText(`CPF: ${normalizeValue(row.cpf)}`);
  writeText(`Telefone: ${normalizeValue(row.phone)}`);
  writeText(`Protocolo: ${normalizeValue(row.protocolNumber)}`);
  writeText(`Classificacao: ${normalizeValue(row.classificacaoFinal)}`);
  writeText(`Regra: ${normalizeValue(row.regraClassificacao)}`);
  writeText(`Criterio da posicao: ${normalizeValue(row.criterioPosicao)}`);
  writeText(`Data de inscricao (registro): ${formatDateTime(row.registrationCreatedAt)}`);

  const formData = row.formData;
  if (formData && typeof formData === 'object' && Object.keys(formData).length > 0) {
    writeText('Dados preenchidos na inscricao:', 10, 'bold');
    for (const [key, value] of Object.entries(formData)) {
      writeText(`- ${key}: ${normalizeValue(value)}`);
    }
  } else {
    writeText('Dados preenchidos na inscricao: nao disponivel');
  }

  y += 8;
  ensureSpace(8);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;
}

const bytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(bytes));
console.log(outputPath);
