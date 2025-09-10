import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE = process.env.JWT_COOKIE_NAME ?? 'gb_token'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE)?.value
  const isLogin = pathname === '/login'

  // não logado e tentando qualquer rota que não seja /login
  if (!token && !isLogin) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // logado tentando /login → manda pra /home
  if (token && isLogin) {
    const url = req.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // aplica em tudo que não é asset/arquivo estático
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
