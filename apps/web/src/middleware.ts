import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware do web:
 * - Protege rotas /app/* por cookie de sessão.
 * - Em desenvolvimento, normaliza request de CSS do Next para evitar 404 em /_next/static/css/*.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    process.env.NODE_ENV !== 'production' &&
    pathname.startsWith('/_next/static/css/') &&
    !searchParams.has('__next_css_remove')
  ) {
    const cssUrl = request.nextUrl.clone();
    cssUrl.searchParams.set('__next_css_remove', '1');
    return NextResponse.rewrite(cssUrl);
  }

  // Protege apenas rotas autenticadas
  if (pathname.startsWith('/app')) {
    const sessionCookie = request.cookies.get('connect.sid');
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/_next/static/css/:path*'],
};
