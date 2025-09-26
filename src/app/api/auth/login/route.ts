import { NextResponse } from "next/server";
 
export async function POST(req: Request) {
  try {
    const { matricula, senha } = await req.json();
    if (!matricula || !senha) {
      return NextResponse.json(
        { error: "Credenciais vazias" },
        { status: 400 }
      );
    }
 
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const res = await fetch(`${backend}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula, senha }),
    });
 
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || "Login inválido" },
        { status: res.status }
      );
    }
 
    const token: string | undefined = data?.token;
    if (!token) {
      return NextResponse.json({ error: "Token ausente" }, { status: 500 });
    }
 
    return NextResponse.json({ user: data.user ?? null, token: token });
  } catch (error) {
    // Adicionei 'error' para um possível log
    console.error("Falha no login:", error);
    return NextResponse.json({ error: "Falha no login" }, { status: 500 });
  }
}