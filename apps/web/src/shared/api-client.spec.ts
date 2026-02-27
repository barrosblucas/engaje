import { describe, expect, it } from 'vitest';
import { resolveApiUrl } from './api-client';

describe('resolveApiUrl', () => {
  it('prioritizes NEXT_PUBLIC_API_URL when provided', () => {
    const result = resolveApiUrl({
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: ' https://api.engaje.app.br ',
    });

    expect(result).toBe('https://api.engaje.app.br');
  });

  it('uses host:3200 fallback in development browser context for local/LAN hosts', () => {
    const result = resolveApiUrl(
      {
        NODE_ENV: 'development',
      },
      {
        hostname: '192.168.1.20',
        origin: 'http://192.168.1.20:3100',
        protocol: 'http:',
      },
    );

    expect(result).toBe('http://192.168.1.20:3200');
  });

  it('uses current origin fallback in development browser context for public hosts', () => {
    const result = resolveApiUrl(
      {
        NODE_ENV: 'development',
      },
      {
        hostname: 'engaje.bandeirantesms.app.br',
        origin: 'https://engaje.bandeirantesms.app.br',
        protocol: 'https:',
      },
    );

    expect(result).toBe('https://engaje.bandeirantesms.app.br');
  });

  it('uses current origin fallback in production browser context', () => {
    const result = resolveApiUrl(
      {
        NODE_ENV: 'production',
      },
      {
        hostname: 'engaje.bandeirantesms.app.br',
        origin: 'https://engaje.bandeirantesms.app.br',
        protocol: 'https:',
      },
    );

    expect(result).toBe('https://engaje.bandeirantesms.app.br');
  });

  it('uses localhost default when running without browser context', () => {
    const result = resolveApiUrl({
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: ' ',
    });

    expect(result).toBe('http://localhost:3200');
  });
});
