import { isGoogleOAuthEnabled, resolveGoogleOAuthConfig } from './google-auth-config';

describe('google-auth-config', () => {
  it('habilita google oauth quando client id e secret existem', () => {
    const config = resolveGoogleOAuthConfig({
      NODE_ENV: 'development',
      GOOGLE_CLIENT_ID: 'google-client-id',
      GOOGLE_CLIENT_SECRET: 'google-client-secret',
      GOOGLE_CALLBACK_URL: 'http://localhost:3200/v1/auth/google/callback',
    });

    expect(config.clientID).toBe('google-client-id');
    expect(config.clientSecret).toBe('google-client-secret');
    expect(config.callbackURL).toBe('http://localhost:3200/v1/auth/google/callback');
    expect(config.scope).toEqual(['email', 'profile']);
    expect(
      isGoogleOAuthEnabled({
        GOOGLE_CLIENT_ID: 'google-client-id',
        GOOGLE_CLIENT_SECRET: 'google-client-secret',
      }),
    ).toBe(true);
  });

  it('usa fallback em desenvolvimento quando credenciais nao estao definidas', () => {
    const config = resolveGoogleOAuthConfig({
      NODE_ENV: 'development',
    });

    expect(config.clientID).toBe('__google_oauth_disabled_client_id__');
    expect(config.clientSecret).toBe('__google_oauth_disabled_client_secret__');
    expect(config.callbackURL).toBe('http://localhost:3200/v1/auth/google/callback');
    expect(config.scope).toEqual(['email', 'profile']);
    expect(isGoogleOAuthEnabled({})).toBe(false);
  });

  it('falha em producao sem credenciais do google oauth', () => {
    expect(() =>
      resolveGoogleOAuthConfig({
        NODE_ENV: 'production',
      }),
    ).toThrow('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET são obrigatórios em produção');
  });
});
