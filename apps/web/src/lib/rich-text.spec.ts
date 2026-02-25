import { afterEach, describe, expect, it } from 'vitest';
import {
  normalizeUploadedSourcesInHtml,
  resolveUploadedAssetUrl,
  sanitizeRichTextForRender,
  stripHtmlForTextPreview,
} from './rich-text';

describe('rich-text', () => {
  const originalPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const originalInternalApiUrl = process.env.INTERNAL_API_URL;

  afterEach(() => {
    if (originalPublicApiUrl === undefined) {
      process.env.NEXT_PUBLIC_API_URL = undefined;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalPublicApiUrl;
    }

    if (originalInternalApiUrl === undefined) {
      process.env.INTERNAL_API_URL = undefined;
    } else {
      process.env.INTERNAL_API_URL = originalInternalApiUrl;
    }
  });

  it('stripHtmlForTextPreview removes tags and collapses spaces', () => {
    const result = stripHtmlForTextPreview('<p>Olá&nbsp;<strong>mundo</strong></p>');
    expect(result).toBe('Olá mundo');
  });

  it('sanitizeRichTextForRender removes script tags and inline handlers', () => {
    const result = sanitizeRichTextForRender(
      '<p onclick="alert(1)">Texto<script>alert(1)</script></p><a href="javascript:alert(1)">x</a>',
    );

    expect(result).not.toContain('<script');
    expect(result).not.toContain('onclick=');
    expect(result).not.toContain('javascript:');
  });

  it('resolveUploadedAssetUrl returns absolute url when api origin is provided', () => {
    expect(resolveUploadedAssetUrl('/uploads/content/image.webp', 'http://localhost:3001')).toBe(
      'http://localhost:3001/uploads/content/image.webp',
    );
  });

  it('resolveUploadedAssetUrl keeps source unchanged when api origin is missing', () => {
    expect(resolveUploadedAssetUrl('/uploads/content/image.webp')).toBe(
      '/uploads/content/image.webp',
    );
  });

  it('normalizeUploadedSourcesInHtml rewrites only upload sources', () => {
    const result = normalizeUploadedSourcesInHtml(
      '<p><img src="/uploads/content/image.webp" alt="x" /><img src="https://example.com/x.png" /></p>',
      'http://192.168.1.21:3001',
    );

    expect(result).toContain('src="http://192.168.1.21:3001/uploads/content/image.webp"');
    expect(result).toContain('src="https://example.com/x.png"');
  });

  it('sanitizeRichTextForRender keeps relative upload source when api origin is not configured', () => {
    process.env.NEXT_PUBLIC_API_URL = undefined;
    process.env.INTERNAL_API_URL = undefined;

    const result = sanitizeRichTextForRender('<p><img src="/uploads/content/image.webp" /></p>');

    expect(result).toContain('src="/uploads/content/image.webp"');
    expect(result).not.toContain('http://localhost:3001/uploads/content/image.webp');
  });
});
