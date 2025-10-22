'use client'

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuthHeader } from '@/app/api/lib/authHeader';
import { ApiResponse } from '@/types/apiResponse';
import type { Especialidade } from '@/types/index';
import { toast } from "sonner";
import { Stethoscope, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

const dias = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const;

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const medicoSchema = z.object({
  nome: z.string().min(3, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  id_especialidade: z.string().min(1, "Selecione a especialidade"),
  disponibilidade: z.array(z.number().int().min(0)).min(1, "Selecione pelo menos um dia"),
  horaEntrada: z.string().regex(timeRegex, "Formato HH:MM"),
  horaPausa: z.string().regex(timeRegex, "Formato HH:MM"),
  horaVolta: z.string().regex(timeRegex, "Formato HH:MM"),
  horaSaida: z.string().regex(timeRegex, "Formato HH:MM"),
});
type MedicoFormData = z.infer<typeof medicoSchema>;

export default function CadastroMedico() {
  const [loading, setLoading] = useState(false);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [openEsp, setOpenEsp] = useState(false);
  const [nomeEsp, setNomeEsp] = useState("");
  const [savingEsp, setSavingEsp] = useState(false);

  useEffect(() => {
    fetch(`${api}/especialidade`, {
      method: 'GET', 
      headers: getAuthHeader(),
    })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          toast.error("Acesso negado. Sua sessão pode ter expirado.");
          throw new Error('Acesso negado');
        }
        if (!r.ok) throw new Error('Erro na resposta da API');
        const data: ApiResponse<Especialidade[]> | Especialidade[] = await r.json();
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        setEspecialidades(lista.filter(Boolean));
      })
      .catch((error) => {
        console.error("Erro ao carregar especialidades:", error);
        if (error?.message !== 'Acesso negado') {
          toast.error("Não foi possível carregar especialidades.");
        }
      });
  }, []);

  const form = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      nome: "",
      email: "",
      id_especialidade: "",
      disponibilidade: [],
      horaEntrada: "08:00",
      horaPausa: "12:00",
      horaVolta: "13:00",
      horaSaida: "17:00",
    },
  });

  function timeToMin(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }
  function validateTimes(v: MedicoFormData) {
    const e = timeToMin(v.horaEntrada),
      p = timeToMin(v.horaPausa),
      vlt = timeToMin(v.horaVolta),
      s = timeToMin(v.horaSaida);
    if (!(e < p && p <= vlt && vlt < s))
      throw new Error("Ordem inválida dos horários (Entrada < Pausa ≤ Volta < Saída).");
  }

  async function criarEspecialidade(nome: string) {
    try {
      const res = await fetch(`${api}/especialidade`, {
        method: "POST",
        headers: getAuthHeader({ withJsonBody: true }),
        body: JSON.stringify({ nome }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.message || "Falha ao criar especialidade");
      }
      const body = await res.json();
      const criada: Especialidade = body?.data ?? body;

      if (!criada || (criada as any).id == null && (criada as any).id_especialidade == null) {
        throw new Error("Resposta da API sem id da especialidade");
      }

      setEspecialidades((prev) => [...prev, criada]);
      toast.success("Especialidade criada.");
      return criada;
    } catch (e: any) {
      toast.error(e?.message ?? "Tente novamente");
    }
  }

  async function onSubmit(values: MedicoFormData) {
    setLoading(true);
    try {
      validateTimes(values);
      const payload = {
        nome: values.nome,
        email: values.email,
        id_especialidade: values.id_especialidade,
        disponibilidade: values.disponibilidade,
        horaEntrada: values.horaEntrada,
        horaPausa: values.horaPausa,
        horaVolta: values.horaVolta,
        horaSaida: values.horaSaida,
      };
      const res = await fetch(`${api}/medico`, {
        method: "POST",
        headers: getAuthHeader({ withJsonBody: true }),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.message || "Falha ao cadastrar");
      }
      toast.success("Médico cadastrado.");
      form.reset();
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
              <Stethoscope className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Cadastro de Médico</h1>
          </div>

          <Dialog open={openEsp} onOpenChange={setOpenEsp}>
            <DialogTrigger asChild>
              <Button
                className="bg-[var(--verde-800)] hover:bg-[var(--verde-900)] text-[var(--branco)]"
                onClick={() => setNomeEsp("")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova especialidade
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[325px] bg-[var(--branco)] border-none">
              <DialogHeader>
                <DialogTitle className="text-[var(--verde-800)]">Nova Especialidade</DialogTitle>
              </DialogHeader>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nomeEsp.trim()) {
                    toast.error("Digite o nome da especialidade");
                    return;
                  }
                  try {
                    setSavingEsp(true);
                    const nova = await criarEspecialidade(nomeEsp);
                    if (nova) {
                      setNomeEsp("");
                      setOpenEsp(false);
                    }
                  } finally {
                    setSavingEsp(false);
                  }
                }}
                className="grid gap-3"
              >
                <Label htmlFor="especialidade" className="text-[var(--cinza-800)]">Especialidade</Label>
                <Input
                  id="especialidade"
                  name="especialidade"
                  placeholder="Digite a especialidade"
                  value={nomeEsp}
                  onChange={(e) => setNomeEsp(e.target.value)}
                />
                <DialogFooter className="justify-center sm:justify-center mt-2">
                  <Button
                    type="submit"
                    disabled={savingEsp}
                    className="bg-[var(--verde-800)] text-[var(--cinza-200)]"
                  >
                    {savingEsp ? "Salvando..." : (<><Plus className="mr-2 h-4" /> Confirmar</>)}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-12 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 col-span-12">
                  <FormField name="nome" control={form.control} render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Nome do Médico</FormLabel>
                      <FormControl>
                        <Input className="w-full h-11" placeholder="Digite o nome do médico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="lg:col-span-4 col-span-12">
                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>E-mail do Médico</FormLabel>
                      <FormControl>
                        <Input type="email" className="w-full h-11" placeholder="Digite o e-mail do médico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="lg:col-span-4 col-span-12">
                  <FormField name="id_especialidade" control={form.control} render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Especialidade</FormLabel>

                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Selecione a especialidade" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent className='bg-[var(--cinza-200)]'>
                          {especialidades
                            .filter((e) => !!e)
                            .map((e) => {
                              const rawId = (e as any).id ?? (e as any).id_especialidade ?? e.nome;
                              const idStr = String(rawId);
                              return (
                                <SelectItem key={idStr} value={idStr}>
                                  {e.nome}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {(["horaEntrada", "horaPausa", "horaVolta", "horaSaida"] as const).map((n, i) => (
                  <div key={n} className="lg:col-span-3 col-span-12">
                    <FormField name={n} control={form.control} render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>{["Hora Entrada", "Hora Pausa", "Hora Volta", "Hora Saída"][i]}</FormLabel>
                        <FormControl>
                          <Input type="time" className="w-full h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                ))}
              </div>

              <FormField name="disponibilidade" control={form.control} render={() => (
                <FormItem className="space-y-3">
                  <FormLabel>Disponibilidade</FormLabel>
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    {dias.map((label, idx) => (
                      <FormField key={label} name="disponibilidade" control={form.control} render={({ field }) => {
                        const checked: boolean = field.value?.includes(idx);
                        return (
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  const on = v === true;
                                  if (on && !checked) field.onChange([...(field.value ?? []), idx]);
                                  if (!on && checked) field.onChange(field.value.filter((n: number) => n !== idx));
                                }}
                                className="data-[state=checked]:bg-[var(--verde-700)] data-[state=checked]:border-[var(--verde-800)]"
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{label}</FormLabel>
                          </div>
                        );
                      }} />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

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
