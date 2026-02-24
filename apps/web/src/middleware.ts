import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware do web:
 * - Protege rotas /app/* por cookie de sessão.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ['/app/:path*'],
};
