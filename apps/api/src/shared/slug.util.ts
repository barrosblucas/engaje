import slugifyFn from 'slugify';

/**
 * Gera um slug único a partir do título.
 * Se slug já existir, adiciona sufixo aleatório.
 */
export function generateSlug(title: string): string {
  return slugifyFn(title, { lower: true, strict: true, locale: 'pt' });
}

export function generateUniqueSlug(title: string, suffix: string): string {
  const base = generateSlug(title);
  return `${base}-${suffix}`;
}
