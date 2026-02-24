// Pure utility helpers — sem IO, sem side effects

/** Formata data para exibição em pt-BR */
export function formatDateBR(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Trunca texto para exibição em cards */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
