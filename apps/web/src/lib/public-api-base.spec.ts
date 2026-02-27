import { describe, expect, it } from 'vitest';
import { resolvePublicApiBase } from './public-api-base';

describe('resolvePublicApiBase', () => {
  it('prioritizes INTERNAL_API_URL when provided', () => {
    const result = resolvePublicApiBase({
      INTERNAL_API_URL: 'http://10.0.0.2:3200',
      NEXT_PUBLIC_API_URL: 'http://192.168.1.21:3200',
    });

    expect(result).toBe('http://10.0.0.2:3200');
  });

  it('falls back to NEXT_PUBLIC_API_URL when INTERNAL_API_URL is missing', () => {
    const result = resolvePublicApiBase({
      NEXT_PUBLIC_API_URL: 'http://192.168.1.21:3200',
    });

    expect(result).toBe('http://192.168.1.21:3200');
  });

  it('uses localhost default when no API env is configured', () => {
    const result = resolvePublicApiBase({});

    expect(result).toBe('http://localhost:3200');
  });

  it('ignores blank values', () => {
    const result = resolvePublicApiBase({
      INTERNAL_API_URL: '  ',
      NEXT_PUBLIC_API_URL: '\t',
    });

    expect(result).toBe('http://localhost:3200');
  });
});
