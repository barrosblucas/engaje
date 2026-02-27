import type { StrategyOptions } from 'passport-google-oauth20';

const DEFAULT_CALLBACK_URL = 'http://localhost:3200/v1/auth/google/callback';
const DEV_FALLBACK_CLIENT_ID = '__google_oauth_disabled_client_id__';
const DEV_FALLBACK_CLIENT_SECRET = '__google_oauth_disabled_client_secret__';

function readEnvValue(value?: string): string | null {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

export function isGoogleOAuthEnabled(env: NodeJS.ProcessEnv): boolean {
  return Boolean(readEnvValue(env.GOOGLE_CLIENT_ID) && readEnvValue(env.GOOGLE_CLIENT_SECRET));
}

export function resolveGoogleOAuthConfig(env: NodeJS.ProcessEnv): StrategyOptions {
  const clientID = readEnvValue(env.GOOGLE_CLIENT_ID);
  const clientSecret = readEnvValue(env.GOOGLE_CLIENT_SECRET);
  const callbackURL = readEnvValue(env.GOOGLE_CALLBACK_URL) ?? DEFAULT_CALLBACK_URL;

  if (clientID && clientSecret) {
    return {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    };
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET são obrigatórios em produção');
  }

  return {
    clientID: DEV_FALLBACK_CLIENT_ID,
    clientSecret: DEV_FALLBACK_CLIENT_SECRET,
    callbackURL,
    scope: ['email', 'profile'],
  };
}
