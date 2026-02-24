import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de autenticação:
 * Rotas /app/* exigem sessão via cookie.
 * Redireciona para /login se não autenticado.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege apenas rotas autenticadas
  if (pathname.startsWith('/app')) {
    const sessionCookie = request.cookies.get('connect.sid');
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
