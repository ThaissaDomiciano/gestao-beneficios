import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { matricula, senha } = await req.json();
    if (!matricula || !senha) {
      return NextResponse.json({ error: 'Credenciais vazias' }, { status: 400 });
    }

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const res = await fetch(`${backend}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
     
      body: JSON.stringify({ matricula, senha }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || 'Login inválido' },
        { status: res.status }
      );
    }

    const token: string | undefined = data?.token;
    if (!token) {
      return NextResponse.json({ error: 'Token ausente' }, { status: 500 });
    }

    const resp = NextResponse.json({ user: data.user ?? null });

    const secure =
      process.env.DEV_INSECURE_COOKIE === 'true' ? false : true;

    resp.cookies.set(process.env.JWT_COOKIE_NAME ?? 'gb_token', token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    return resp;
  } catch {
    return NextResponse.json({ error: 'Falha no login' }, { status: 500 });
  }
}
