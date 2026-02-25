const DEFAULT_PUBLIC_API_BASE = 'http://localhost:3001';
type PublicApiEnv = Record<string, string | undefined>;

/**
 * Resolve a origem da API para páginas públicas renderizadas no servidor.
 * Prioriza INTERNAL_API_URL e depois NEXT_PUBLIC_API_URL para ambientes LAN/container.
 */
export function resolvePublicApiBase(env: PublicApiEnv = process.env): string {
  const internalApiUrl = env.INTERNAL_API_URL?.trim();
  if (internalApiUrl) return internalApiUrl;

  const publicApiUrl = env.NEXT_PUBLIC_API_URL?.trim();
  if (publicApiUrl) return publicApiUrl;

  return DEFAULT_PUBLIC_API_BASE;
}
