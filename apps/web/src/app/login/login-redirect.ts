export const DEFAULT_LOGIN_REDIRECT = '/app/dashboard';

type SearchParamsReader = {
  get: (name: string) => string | null;
};

/**
 * Keeps redirects inside the app to avoid open redirect.
 */
function sanitizeRedirectPath(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  if (!path.startsWith('/') || path.startsWith('//')) {
    return null;
  }

  return path;
}

export function resolveLoginRedirect(
  searchParams: SearchParamsReader,
  fallback = DEFAULT_LOGIN_REDIRECT,
): string {
  const preferredPath =
    sanitizeRedirectPath(searchParams.get('redirect')) ??
    sanitizeRedirectPath(searchParams.get('callbackUrl'));

  return preferredPath ?? fallback;
}
