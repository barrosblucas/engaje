import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'blockquote',
  'h2',
  'h3',
  'a',
  'img',
] as const;

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...ALLOWED_TAGS],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
  },
  allowedSchemes: ['http', 'https'],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noreferrer',
      target: '_blank',
    }),
  },
};

const EMPTY_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

/** Sanitiza HTML de conteúdo rico preservando somente tags seguras. */
export function sanitizeRichTextHtml(rawHtml: string): string {
  return sanitizeHtml(rawHtml, SANITIZE_OPTIONS).trim();
}

/** Extrai texto visível para validações semânticas de conteúdo vazio. */
export function extractPlainTextFromHtml(rawHtml: string): string {
  return sanitizeHtml(rawHtml, EMPTY_SANITIZE_OPTIONS).replace(/\s+/g, ' ').trim();
}
