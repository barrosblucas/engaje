import { describe, expect, it } from 'vitest';
import { DEFAULT_LOGIN_REDIRECT, resolveLoginRedirect } from './login-redirect';

describe('login-redirect', () => {
  it('prioritizes redirect query param', () => {
    const params = new URLSearchParams({
      redirect: '/app/inscricoes',
      callbackUrl: '/app/dashboard',
    });

    expect(resolveLoginRedirect(params)).toBe('/app/inscricoes');
  });

  it('uses callbackUrl when redirect does not exist', () => {
    const params = new URLSearchParams({
      callbackUrl: '/app/admin/eventos',
    });

    expect(resolveLoginRedirect(params)).toBe('/app/admin/eventos');
  });

  it('returns fallback when redirect is invalid', () => {
    const params = new URLSearchParams({
      redirect: 'https://evil.example.com',
    });

    expect(resolveLoginRedirect(params)).toBe(DEFAULT_LOGIN_REDIRECT);
  });
});
