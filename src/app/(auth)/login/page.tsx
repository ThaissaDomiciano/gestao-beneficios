'use client';
 
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
 
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
 
const schema = z.object({
  matricula: z.string().min(1, 'Informe a matrícula'),
  senha: z.string().min(1, 'Informe a senha'),
});
type FormData = z.infer<typeof schema>;
 
export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const nextUrl = search.get('from') || '/home';
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });
 
  const onSubmit = async (data: FormData) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
 
      const body = await res.json().catch(() => ({}));
 
      if (!res.ok) {
        setErrorMsg(body?.error || 'Credenciais inválidas');
        return;
      }
 
      if (body.token) {
        localStorage.setItem('gb_token', body.token);
      } else {
        setErrorMsg('Resposta do servidor inválida: token ausente.');
        return;
      }
 
      router.replace(nextUrl);
 
    } catch {
      setErrorMsg('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <main className="fixed inset-0 grid grid-cols-1 md:grid-cols-2">
      <section className="hidden md:flex items-center justify-center p-10">
        <Image src="/imgLogin.svg" alt="imagem do login" width={400} height={400} />
      </section>
 
      <section className="md:col-start-2 flex items-stretch">
        <Card className="w-full h-full border-none rounded-none md:rounded-tl-[40%] bg-[var(--background)] shadow overflow-hidden flex">
          <div className="m-auto w-full max-w-sm">
            <CardHeader className="space-y-2 p-0">
              <p className='flex items-center gap-2 text-[var(--verde-800)] font-bold text-xl'><Image src="/logoWeb.svg" alt="Logo" width={60} height={60} />Gestão de Benefícios</p>
              <CardTitle className="text-4xl font-semibold">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-3xl font-semibold">Realize seu login</CardDescription>
            </CardHeader>
 
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="matricula" className='mb-2'>Matrícula</Label>
                <Input id="matricula" {...register('matricula')} placeholder="Digite sua matrícula"
                  className='bg-[var(--cinza-200)]' />
                {errors.matricula && <p className="text-sm text-[var(--error)] mt-1">{errors.matricula.message}</p>}
              </div>
 
              <div>
                <Label htmlFor="senha" className='mb-2'>Senha</Label>
                <Input id="senha" type="password" {...register('senha')} placeholder="Digite sua senha"
                  className='bg-[var(--cinza-200)]' />
                {errors.senha && <p className="text-sm text-[var(--error)] mt-1">{errors.senha.message}</p>}
              </div>
 
              {errorMsg && <p className="text-sm text-[var(--error)]">{errorMsg}</p>}
 
              <Button type="submit" className="w-full bg-[var(--verde-800)] text-[var(--branco)]" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </Card>
      </section>
    </main>
  );
}
 