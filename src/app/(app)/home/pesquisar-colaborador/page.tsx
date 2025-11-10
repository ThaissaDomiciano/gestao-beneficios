"use client"

import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { getAuthHeader } from '@/app/api/lib/authHeader';
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Agendamento, Solicitacao } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Colaborador } from "@/types/index";
import { Spinner } from "@/components/ui/spinner";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export default function PesquisarColaborador() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filteredColaboradores, setFilteredColaboradores] = useState<Colaborador[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(false);
  const [beneficios, setBeneficios] = useState<Solicitacao[]>([]);
  const [loadingBeneficios, setLoadingBeneficios] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"consultas" | "beneficios">(
    "consultas"
  );
  const [selected, setSelected] = useState<Colaborador | null>(null)

  useEffect(() => {
    buscarColaboradores()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredColaboradores(colaboradores)
      return
    }

    const filtered = colaboradores.filter(
      (colab) =>
        colab.nome.toLowerCase().includes(search.toLowerCase()) ||
        colab.matricula.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredColaboradores(filtered)
  }, [search, colaboradores])

  async function buscarAgendamentos(colaboradorId: string) {
    setLoadingAgendamentos(true);
    try {
      const res = await fetch(`${api}/agendamento/${colaboradorId}`, {
        headers: getAuthHeader()
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Erro ao carregar agendamentos")
      }
      const data = await res.json();
      setAgendamentos(data.data || []);
    } catch (error: any) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error(error?.message || "Não foi possível carregar os agendamentos")
    } finally {
      setLoadingAgendamentos(false);
    }
  }

  async function buscarBeneficios(colaboradorId: string) {
    setLoadingBeneficios(true);
    try {
      const res = await fetch(`${api}/solicitacao/colaborador/${colaboradorId}`, {
        headers: getAuthHeader()
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Erro ao carregar benefícios")
      }
      const data = await res.json();
      setBeneficios(data.data || []);
    } catch (error: any) {
      console.error("Erro ao carregar benefícios:", error);
      toast.error(error?.message || "Não foi possível carregar os benefícios")
    } finally {
      setLoadingBeneficios(false);
    }
  }

  async function buscarColaboradores() {
    setLoading(true)
    try {
      const res = await fetch(`${api}/colaborador`, {
        method: "GET",
        headers: getAuthHeader()
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error?.message || "Erro ao carregar colaboradores")
      }

      const data = await res.json()
      setColaboradores(data.data || [])
    } catch (error: any) {
      console.error("Erro ao carregar colaboradores:", error)
      toast.error(error?.message || "Não foi possível carregar os colaboradores")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="">
      <div className="">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <Search className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">
              Pesquisa de Colaborador
            </h1>
          </div>
        </div>
        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-12 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3">
            <Label htmlFor="colaborador" className="px-1">
              Colaborador
            </Label>
            <form className="flex w-full max-w-sm items-center">
              <Input
                id="colaborador"
                type="text"
                placeholder="Pesquise o colaborador"
                className="rounded-r-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                type="submit"
                className="rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]"
              >
                <Search className="h-4 w-4 text-[var(--branco)]" />
              </Button>
            </form>
          </div>

          <div className="mt-4 w-full overflow-auto max-h-[60vh] border-black border rounded-md [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
            <Table className="w-full relative">
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="bg-[var(--verde-800)] text-[var(--branco)] hover:bg-[var(--verde-800)]">
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data Nascimento</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Gênero</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="text-center">Ação</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Spinner />
                        <p className="mt-2">Carregando...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredColaboradores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum colaborador encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredColaboradores.map((item, index) => (
                    <TableRow key={item.matricula} className={index % 2 === 1 ? "bg-[#DDE9E6]" : ""}>
                      <TableCell className="p-4">{item.matricula}</TableCell>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>{new Date(item.dtNascimento).toLocaleDateString()}</TableCell>
                      <TableCell>{item.funcao}</TableCell>
                      <TableCell>{item.genero}</TableCell>
                      <TableCell>{item.cidade}</TableCell>
                      <TableCell className="text-center">
                        <Sheet onOpenChange={(open) => {
                          if (open && item) {
                            setSelected(item);
                            setSelectedTab("consultas");
                            buscarAgendamentos(item.id);
                            buscarBeneficios(item.id);
                          }
                        }}>
                          <SheetTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="bg-[var(--cinza-100)] p-4">
                            <SheetHeader>
                              <SheetTitle className="text-[var(--verde-900)] text-xl">Histórico do Colaborador</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 flex gap-4">
                              <button
                                onClick={() => {
                                  setSelectedTab("consultas");
                                  if (selected) {
                                    buscarAgendamentos(selected.id);
                                  }
                                }}
                                className={`rounded-md border px-4 py-2 font-medium transition mb-4 ${selectedTab === "consultas"
                                  ? "bg-[var(--verde-800)] text-[var(--branco)] border-[var(--verde-800)]"
                                  : "bg-[var(--branco)] text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
                                  }`}
                              >
                                Consultas
                              </button>


                              <button
                                onClick={() => {
                                  setSelectedTab("beneficios");
                                  if (selected?.id) {
                                    buscarBeneficios(selected.id);
                                  }
                                }}
                                className={`rounded-md border px-4 py-2 font-medium transition mb-4 ${selectedTab === "beneficios"
                                  ? "bg-[var(--verde-800)] text-[var(--branco)] border-[var(--verde-800)]"
                                  : "bg-[var(--branco)] text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
                                  }`}
                              >
                                Benefícios
                              </button>
                            </div>
                            {selectedTab === "consultas" && (
                              <div className="mt-4 overflow-y-auto pr-2">
                                {loadingAgendamentos ? (
                                  <div className="flex flex-col items-center justify-center">
                                    <Spinner />
                                    <p className="mt-2">Carregando...</p>
                                  </div>
                                ) : agendamentos.length === 0 ? (
                                  <div className="flex items-center justify-center">Nenhum agendamento encontrado</div>
                                ) : (
                                  <div className="space-y-4">
                                    {agendamentos.map((agendamento) => (
                                      <div
                                        key={agendamento.idAgendamento}
                                        className="bg-[var(--cinza-300)] border border-[var(--verde-900)] rounded-lg p-4 flex justify-between items-center"
                                      >

                                        <div className="flex flex-col gap-1">
                                          <div className="flex gap-2">
                                            <span className="font-semibold">Paciente:</span>
                                            <p>{agendamento.dependente ? agendamento.dependente.nome : agendamento.colaborador.nome}</p>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="font-semibold">Médico:</span>
                                            <p>{agendamento.medico.nome}</p>
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                          <p className="text-sm text-[var(--cinza-700)]">
                                            {format(new Date(agendamento.horario), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                          </p> </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedTab === "beneficios" && (
                              <div className="mt-4 overflow-y-auto pr-2">
                                {loadingBeneficios ? (
                                  <div className="flex flex-col items-center justify-center">
                                    <Spinner />
                                    <p className="mt-2">Carregando...</p>
                                  </div>
                                ) : beneficios.length === 0 ? (
                                  <div className="flex items-center justify-center">
                                    Nenhum benefício encontrado
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {beneficios.map((beneficio) => (
                                      <div
                                        key={beneficio.id}
                                        className="bg-[var(--cinza-300)] border border-[var(--verde-900)] rounded-lg p-4 flex justify-between items-center"
                                      >
                                        <div className="flex flex-col gap-1">
                                          <div className="flex gap-2">
                                            <span className="font-semibold">Benefício:</span>
                                            <p>{beneficio.beneficio.nome}</p>
                                          </div>
                                          <div className="flex gap-2">
                                            <span className="font-semibold">Beneficiado:</span>
                                            <p>{beneficio.dependente ? beneficio.dependente.nome : beneficio.colaborador.nome}</p>
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                          <p className="text-sm text-[var(--cinza-700)]">
                                            {format(new Date(beneficio.dataSolicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </main>
  )
}
