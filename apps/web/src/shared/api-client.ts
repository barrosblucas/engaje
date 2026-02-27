/**
 * API client centralizado para o frontend.
 * Usa credentials: 'include' para enviar cookies httpOnly.
 * SSOT de fetching para dados autenticados e públicos.
 */

const DEFAULT_API_URL = 'http://localhost:3200';
type ApiClientEnv = Record<string, string | undefined>;
type BrowserLocation = Pick<Location, 'hostname' | 'origin' | 'protocol'>;

function isLocalApiHost(hostname: string): boolean {
  const normalizedHostname = hostname.trim().toLowerCase();
  if (
    normalizedHostname === 'localhost' ||
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === '::1'
  ) {
    return true;
  }

  if (
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalizedHostname) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(normalizedHostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(normalizedHostname)
  ) {
    return true;
  }

  return normalizedHostname.endsWith('.local');
}

function getRuntimeEnv(): ApiClientEnv {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  };
}

function getBrowserLocation(): BrowserLocation | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.location;
}

export function resolveApiUrl(
  env: ApiClientEnv = getRuntimeEnv(),
  browserLocation: BrowserLocation | undefined = getBrowserLocation(),
): string {
  const configuredApiUrl = env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredApiUrl) return configuredApiUrl;

  if (!browserLocation) return DEFAULT_API_URL;

  if (env.NODE_ENV === 'development' && isLocalApiHost(browserLocation.hostname)) {
    return `${browserLocation.protocol}//${browserLocation.hostname}:3200`;
  }

  return browserLocation.origin;
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const apiUrl = resolveApiUrl();
  const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData;
  const requestHeaders = new Headers(headers as HeadersInit);

  if (!isFormDataBody && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiUrl}/v1${path}`, {
    ...rest,
    credentials: 'include',
    headers: requestHeaders,
    body: isFormDataBody
      ? (body as FormData)
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    throw new ApiError(
      response.status,
      errorData.error ?? 'Error',
      errorData.message ?? 'Erro desconhecido',
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

export { ApiError };
export const API_URL = resolveApiUrl();
