export function stripHtmlForTextPreview(rawHtml: string): string {
  return rawHtml
    .replace(/<[^>]*>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const INLINE_EVENT_HANDLER_REGEX = /\son\w+=(?:"[^"]*"|'[^']*')/gi;
const JAVASCRIPT_PROTOCOL_REGEX = /javascript:/gi;
const UPLOADS_SRC_REGEX = /(src=["'])\/uploads\/([^"']+)(["'])/gi;
const DEFAULT_API_ORIGIN = 'http://localhost:3001';

function resolveApiOrigin(rawUrl?: string): string | null {
  if (!rawUrl) return null;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

function resolveConfiguredApiOrigin(): string | null {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ?? process.env.INTERNAL_API_URL ?? DEFAULT_API_ORIGIN;
  return resolveApiOrigin(configured);
}

export function resolveUploadedAssetUrl(source: string, apiOrigin?: string | null): string {
  if (!source.startsWith('/uploads/')) return source;
  if (!apiOrigin) return source;
  return `${apiOrigin}${source}`;
}

export function normalizeUploadedSourcesInHtml(rawHtml: string, apiOrigin?: string | null): string {
  return rawHtml.replace(
    UPLOADS_SRC_REGEX,
    (_match, prefix: string, path: string, suffix: string) =>
      `${prefix}${resolveUploadedAssetUrl(`/uploads/${path}`, apiOrigin)}${suffix}`,
  );
}

/**
 * Sanitização defensiva no frontend para renderização.
 * A sanitização oficial ocorre no backend com allowlist.
 */
export function sanitizeRichTextForRender(rawHtml: string): string {
  const sanitized = rawHtml
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(INLINE_EVENT_HANDLER_REGEX, '')
    .replace(JAVASCRIPT_PROTOCOL_REGEX, '');

  return normalizeUploadedSourcesInHtml(sanitized, resolveConfiguredApiOrigin());
}
