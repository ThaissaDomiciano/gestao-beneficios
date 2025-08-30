'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      router.replace(nextUrl);
    } catch {
      setErrorMsg('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-4">Entrar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="matricula">Matrícula</Label>
          <Input id="matricula" {...register('matricula')} placeholder="Ex.: 123456" />
          {errors.matricula && (
            <p className="text-sm text-red-600 mt-1">{errors.matricula.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" {...register('senha')} />
          {errors.senha && (
            <p className="text-sm text-red-600 mt-1">{errors.senha.message}</p>
          )}
        </div>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}
