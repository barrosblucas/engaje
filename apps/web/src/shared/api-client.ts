/**
 * API client centralizado para o frontend.
 * Usa credentials: 'include' para enviar cookies httpOnly.
 * SSOT de fetching para dados autenticados e públicos.
 */

const DEFAULT_API_URL = 'http://localhost:3001';

const resolveApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }

  return DEFAULT_API_URL;
};

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

  const response = await fetch(`${apiUrl}/v1${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
