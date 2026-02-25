import { describe, expect, it } from 'vitest';
import { LOGOUT_REDIRECT_PATH, resolvePublicHeaderAuthState } from './public-header-auth';

describe('public-header-auth', () => {
  it('retorna estado anonimo quando nao ha sessao', () => {
    expect(resolvePublicHeaderAuthState(undefined)).toEqual({
      isAuthenticated: false,
      dashboardHref: null,
    });
  });

  it('resolve dashboard de cidadao para inscricoes', () => {
    expect(resolvePublicHeaderAuthState({ role: 'citizen' })).toEqual({
      isAuthenticated: true,
      dashboardHref: '/app/inscricoes',
    });
  });

  it('resolve dashboard de admin para gestao de eventos', () => {
    expect(resolvePublicHeaderAuthState({ role: 'admin' })).toEqual({
      isAuthenticated: true,
      dashboardHref: '/app/admin/eventos',
    });
    expect(resolvePublicHeaderAuthState({ role: 'super_admin' })).toEqual({
      isAuthenticated: true,
      dashboardHref: '/app/admin/eventos',
    });
  });

  it('usa /public como destino padrao de logout', () => {
    expect(LOGOUT_REDIRECT_PATH).toBe('/public');
  });
});
