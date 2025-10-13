'use client'

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAuthHeader } from '@/app/api/lib/authHeader';
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl 
} from "@/components/ui/form";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

const beneficioSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório"),
  descricao: z.string().min(5, "A descrição é obrigatória"),
  percentualDesconto: z.coerce.number().min(1, "Desconto deve ser maior que 0").max(100, "Desconto não pode ser maior que 100%")
});

type FormInput = z.input<typeof beneficioSchema>;
type FormOutput = z.output<typeof beneficioSchema>;

export default function CadastroBeneficio() {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(beneficioSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      percentualDesconto: 1
    }
  });

  async function onSubmit(values: FormOutput) {
    setLoading(true);
    try {
      const payload = {
        nome: values.nome,
        descricao: values.descricao,
        percentualDesconto: values.percentualDesconto
      };

      const res = await fetch(`${api}/beneficio`, {
        method: "POST",
        headers: getAuthHeader({ withJsonBody: true }),
        body: JSON.stringify(payload),
      });

      console.log(res)
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.message || "Falha ao conectar");
      }

      toast.success("Benefício cadastrado");
      form.reset({ nome: "", descricao: "", percentualDesconto: 1 });
    } catch (e: any) {
      toast.error(e?.message ?? "Tente novamente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-screen max-w-none">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6"> 
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <ClipboardCheck className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Cadastro de Benefício</h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-12 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="flex gap-4">
                <FormField
                  name="nome"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input className="w-200 h-11" placeholder="Digite o nome do benefício" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
               <FormField
              name="percentualDesconto"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Porcentagem</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      className="w-90 h-11"
                      placeholder="Digite a porcentagem do desconto"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={(field.value as number | string) ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
              </div>

              <div>
                <FormField
                  name="descricao"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea className="w-full h-32" placeholder="Digite a descrição do benefício" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2 flex justify-center">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-12 bg-[var(--verde-800)] hover:bg-[var(--verde-900)] text-[var(--branco)]"
                >
                  {loading ? "Salvando..." : "Confirmar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
