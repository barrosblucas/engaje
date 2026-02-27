const DEFAULT_PUBLIC_WEB_BASE_URL = 'http://localhost:3100';
type PublicWebEnv = Record<string, string | undefined>;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function resolvePublicWebBaseUrl(env: PublicWebEnv = process.env): string {
  const configuredAppUrl = env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredAppUrl) return DEFAULT_PUBLIC_WEB_BASE_URL;

  try {
    return normalizeBaseUrl(new URL(configuredAppUrl).toString());
  } catch {
    return DEFAULT_PUBLIC_WEB_BASE_URL;
  }
}

export function buildPublicShareUrl(path: string, env: PublicWebEnv = process.env): string {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = resolvePublicWebBaseUrl(env);
  return new URL(safePath, `${baseUrl}/`).toString();
}

interface WhatsappShareInput {
  title: string;
  url: string;
}

export function buildWhatsappShareUrl(input: WhatsappShareInput): string {
  const message = `${input.title} ${input.url}`.trim();
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
