type AppOriginEnv = {
  APP_URL?: string;
  APP_URLS?: string;
  NODE_ENV?: string;
} & Record<string, string | undefined>;

type CorsOriginValidator = (
  requestOrigin: string | undefined,
  callback: (error: Error | null, allow?: boolean) => void,
) => void;

const DEFAULT_APP_ORIGIN = 'http://localhost:3100';
const LOCAL_DEV_ORIGINS = ['http://localhost:3100', 'http://127.0.0.1:3100'];

const isDefined = <T>(value: T | null): value is T => value !== null;

const normalizeOrigin = (origin: string): string | null => {
  const trimmedOrigin = origin.trim();
  if (!trimmedOrigin) return null;

  try {
    const parsedUrl = new URL(trimmedOrigin);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  } catch {
    return null;
  }
};

const isPrivateIPv4Host = (host: string): boolean => {
  const octets = host.split('.');
  if (octets.length !== 4) return false;

  const numbers = octets.map((octet) => Number.parseInt(octet, 10));
  if (numbers.some((number) => Number.isNaN(number) || number < 0 || number > 255)) {
    return false;
  }

  const [first, second] = numbers;
  if (first === 10) return true;
  if (first === 192 && second === 168) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  return false;
};

const isLocalDevOrigin = (origin: string): boolean => {
  const parsedUrl = new URL(origin);
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') return false;

  const hostname = parsedUrl.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

  return isPrivateIPv4Host(hostname);
};

export const getAllowedAppOrigins = (env: AppOriginEnv): string[] => {
  const configuredOrigins = (env.APP_URLS ?? '').split(',').map(normalizeOrigin).filter(isDefined);

  const fallbackOrigin = normalizeOrigin(env.APP_URL ?? DEFAULT_APP_ORIGIN) ?? DEFAULT_APP_ORIGIN;
  const origins = configuredOrigins.length > 0 ? configuredOrigins : [fallbackOrigin];

  if (env.NODE_ENV !== 'production') {
    origins.push(...LOCAL_DEV_ORIGINS);
  }

  return [...new Set(origins)];
};

export const getPrimaryAppOrigin = (env: AppOriginEnv): string => {
  const [firstAllowedOrigin] = getAllowedAppOrigins(env);
  return firstAllowedOrigin;
};

export const isAppOriginAllowed = (
  requestOrigin: string | undefined,
  env: AppOriginEnv,
): boolean => {
  if (!requestOrigin) return true;

  const normalizedOrigin = normalizeOrigin(requestOrigin);
  if (!normalizedOrigin) return false;

  const allowedOrigins = getAllowedAppOrigins(env);
  if (allowedOrigins.includes(normalizedOrigin)) return true;

  return env.NODE_ENV !== 'production' && isLocalDevOrigin(normalizedOrigin);
};

export const createCorsOriginValidator = (env: AppOriginEnv): CorsOriginValidator => {
  return (requestOrigin, callback) => {
    if (isAppOriginAllowed(requestOrigin, env)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${requestOrigin ?? 'unknown'}`));
  };
};
