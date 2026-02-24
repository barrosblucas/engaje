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

/**
 * Sanitização defensiva no frontend para renderização.
 * A sanitização oficial ocorre no backend com allowlist.
 */
export function sanitizeRichTextForRender(rawHtml: string): string {
  return rawHtml
    .replace(SCRIPT_TAG_REGEX, '')
    .replace(INLINE_EVENT_HANDLER_REGEX, '')
    .replace(JAVASCRIPT_PROTOCOL_REGEX, '');
}
