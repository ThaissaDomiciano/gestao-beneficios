'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod"
import { getAuthHeader } from "@/app/api/lib/authHeader";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

const beneficioSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório"),
  descricao: z.string().min(5, "A descrição é obrigatória"),
})
type BeneficioFormData = z.infer<typeof beneficioSchema>;

export default function CadastroBeneficio() {
    const [loading, setLoading] = useState(false)

    const form = useForm<BeneficioFormData>({
        resolver: zodResolver(beneficioSchema),
        defaultValues: {
          nome: "",
          descricao: ""
        }
    })

    async function onSubmit(values: BeneficioFormData) {
      setLoading(true);
      try {
        const payload = {
          nome: values.nome,
          descricao: values.descricao
        } 

        const res = await fetch(`${api}/beneficio`, {
          method: "POST",
          headers: getAuthHeader({ withJsonBody: true }),
          body: JSON.stringify(payload),
        });

        if(!res.ok) {
          const err = await res.json().catch(() => ({} as any));
          throw new Error(err?.message || "Falha ao conectar")
        }

        toast.success("Benefício cadastrado")
        form.reset();
      } catch(e: any) {
        toast.error(e?.message ?? "Tente novamente")
      } finally {
        setLoading(false)
      }
    }

    return (
      <main className="min-h-screen w-screen max-w-none">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6"> 
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <ClipboardCheck className="h-6 w-6 text-[var(--cinza-700)]"></ClipboardCheck>
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Cadastro de Benefício</h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-12 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

              <div>
                <FormField name="nome" control={form.control} render={({ field }) => (
                  <FormItem className="space-y-2">
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input className="w-full h-11" placeholder="Digite o nome do benefício" {...field} />
                      </FormControl>
                  </FormItem>
                )}/>
                </div>
                <div>
                <FormField name="descricao" control={form.control} render={({ field }) => (
                   <FormItem className="space-y-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea className="w-full h-32" placeholder="Digite o nome do benefício" {...field} />
                      </FormControl>
                   </FormItem> 
                )}/>
                </div>
              
                <div className="pt-2 flex justify-center">
                  <Button type="submit" disabled={loading} className="h-11 px-12 bg-[var(--verde-800)] hover:bg-[var(--verde-900)] text-[var(--branco)]">
                    {loading ? "Salvando..." : "Confirmar"}
                  </Button>
                </div>
            </form>
          </Form>
        </div>

        </div>
      </main>
    )
}