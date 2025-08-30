import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = process.env.JWT_COOKIE_NAME ?? 'gb_token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE)?.value;

  const isAuthGroup = pathname.startsWith('/login') || pathname.startsWith('/(auth)');
  const isAppGroup  = pathname.startsWith('/(app)') || pathname.startsWith('/home');

  // Bloqueia app sem token
  if (isAppGroup && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Usuário logado acessando /login → manda pro home
  if (isAuthGroup && token && pathname === '/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)'],
};
