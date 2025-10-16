"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAuthHeader } from "@/app/api/lib/authHeader";
import { toast } from "sonner";
import type { Agendamento, Solicitacao } from "@/types";
import { ChevronDownIcon, History, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export default function Historico() {
  const [selectedTab, setSelectedTab] = useState<"agendamento" | "beneficio">("agendamento");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchA, setSearchA] = useState("");
  const [statusA, setStatusA] = useState<string>("__all__");
  const [openA, setOpenA] = useState(false);
  const [dateA, setDateA] = useState<Date | undefined>(undefined);

  const [searchB, setSearchB] = useState("");
  const [statusB, setStatusB] = useState<string>("__all__");
  const [openB, setOpenB] = useState(false);
  const [dateB, setDateB] = useState<Date | undefined>(undefined);

  useEffect(() => {
    buscarAgendamentos();
    buscarSolicitacoes();
  }, []);

  async function buscarAgendamentos() {
    setLoading(true);
    try {
      const res = await fetch(`${api}/agendamento`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Erro ao carregar agendamentos");
      const data = await res.json();
      setAgendamentos(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os agendamentos");
    } finally {
      setLoading(false);
    }
  }

  async function buscarSolicitacoes() {
    setLoading(true);
    try {
      const res = await fetch(`${api}/solicitacao`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Erro ao carregar solicitações");
      const data = await res.json();
      setSolicitacoes(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar as solicitações");
    } finally {
      setLoading(false);
    }
  }

  const linhasA = useMemo(() => {
    return agendamentos.map((a) => {
      const paciente = a.dependente?.nome ?? a.colaborador?.nome ?? "—";
      const medicoNome = a.medico?.nome ?? "—";
      const especialidadeNome =
        a.medico?.especialidade && "nome" in (a.medico.especialidade || {})
          ? ((a.medico!.especialidade as any)?.nome ?? "—")
          : "—";
      const dt = new Date(a.horario);
      const dataFmt = isNaN(+dt) ? "—" : format(dt, "dd/MM/yyyy", { locale: ptBR });
      const horaFmt = isNaN(+dt) ? "—" : format(dt, "HH:mm");
      return { ...a, paciente, medicoNome, especialidadeNome, dataFmt, horaFmt, _dt: dt };
    });
  }, [agendamentos]);

  const statusOptionsA = useMemo(() => {
    const set = new Set<string>();
    for (const a of agendamentos) if (a.status) set.add(a.status);
    return Array.from(set);
  }, [agendamentos]);

  const linhasAFiltered = useMemo(() => {
    return linhasA.filter((a) => {
      const matchNome = !searchA.trim() || a.paciente.toLowerCase().includes(searchA.trim().toLowerCase());
      const matchStatus = statusA === "__all__" || a.status === statusA;
      const matchDate =
        !dateA ||
        (a._dt instanceof Date &&
          !isNaN(+a._dt) &&
          a._dt.getDate() === dateA.getDate() &&
          a._dt.getMonth() === dateA.getMonth() &&
          a._dt.getFullYear() === dateA.getFullYear());
      return matchNome && matchStatus && matchDate;
    });
  }, [linhasA, searchA, statusA, dateA]);

  const linhasB = useMemo(() => {
    const toBRL = (n?: number) =>
      typeof n === "number"
        ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "-";

    return solicitacoes.map((s) => {
      const paciente = s.dependente?.nome ?? s.colaborador?.nome ?? "—";
      const tipoPagamento = s.tipoPagamento ?? "—";

      const dt = new Date(s.dataSolicitacao);
      const dataFmt = isNaN(+dt) ? "—" : format(dt, "dd/MM/yyyy", { locale: ptBR });

      const totalNum = typeof s.valorTotal === "number" ? s.valorTotal : undefined;
      const descField = typeof s.desconto === "number" ? s.desconto : undefined;
      const pctApi = typeof (s as any)?.beneficio?.percentualDesconto === "number"
        ? (s as any).beneficio.percentualDesconto
        : undefined;

      let descontoValor: number | undefined = undefined;
      if (typeof totalNum === "number" && typeof pctApi === "number" && pctApi >= 0 && pctApi <= 100) {
        descontoValor = totalNum * (pctApi / 100);
      }
      
      else if (typeof totalNum === "number" && typeof descField === "number" && descField > 0 && descField < 1) {
        descontoValor = totalNum * descField;
      }
      
      else if (typeof totalNum === "number" && typeof descField === "number" && descField >= 1 && descField <= totalNum) {
        descontoValor = descField;
      }

      const valorTotal = toBRL(totalNum);
      const descontoFmt = typeof descontoValor === "number" ? toBRL(descontoValor) : "-";

      const status = s.status ?? "-";

      return {
        ...s,
        paciente,
        tipoPagamento,
        dataFmt,
        valorTotal,    
        desconto: descontoFmt,
        status,
        _dt: dt,
      };
    });
  }, [solicitacoes]);

  const statusOptionsB = useMemo(() => {
    const set = new Set<string>();
    for (const s of solicitacoes) if (s.status) set.add(s.status);
    return Array.from(set);
  }, [solicitacoes]);

  const linhasBFiltered = useMemo(() => {
    return linhasB.filter((s) => {
      const matchNome = !searchB.trim() || s.paciente.toLowerCase().includes(searchB.trim().toLowerCase());
      const matchStatus = statusB === "__all__" || s.status === statusB;
      const matchDate =
        !dateB ||
        (s._dt instanceof Date &&
          !isNaN(+s._dt) &&
          s._dt.getDate() === dateB.getDate() &&
          s._dt.getMonth() === dateB.getMonth() &&
          s._dt.getFullYear() === dateB.getFullYear());
      return matchNome && matchStatus && matchDate;
    });
  }, [linhasB, searchB, statusB, dateB]);

  return (
    <main className="min-h-screen w-screen max-w-none">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <History className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Histórico</h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-8 shadow-sm">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab("agendamento")}
              className={`rounded-md border px-4 py-2 font-medium transition mb-4 ${
                selectedTab === "agendamento"
                  ? "bg-[var(--verde-800)] text-[var(--branco)] border-[var(--verde-800)]"
                  : "bg-[var(--branco)] text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
              }`}
            >
              Agendamento
            </button>
            <button
              onClick={() => setSelectedTab("beneficio")}
              className={`rounded-md border px-4 py-2 font-medium transition mb-4 ${
                selectedTab === "beneficio"
                  ? "bg-[var(--verde-800)] text-[var(--branco)] border-[var(--verde-800)]"
                  : "bg-[var(--branco)] text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
              }`}
            >
              Benefício
            </button>
          </div>

          {selectedTab === "agendamento" && (
            <div className="mt-4 w-full">
              <div className="flex items-end gap-4 w-full max-w-6xl mb-4 flex-wrap">
                <div className="flex flex-col gap-2 w-[320px]">
                  <Label htmlFor="nome-a" className="px-1">Nome do colaborador</Label>
                  <form className="flex" onSubmit={(e) => e.preventDefault()}>
                    <Input
                      id="nome-a"
                      type="text"
                      placeholder="Pesquise o nome"
                      value={searchA}
                      onChange={(e) => setSearchA(e.target.value)}
                      className="flex-1 min-w-0 rounded-r-none"
                    />
                    <Button type="submit" className="flex-none rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]">
                      <Search className="h-4 w-4 text-[var(--branco)]" />
                    </Button>
                  </form>
                </div>

                <div className="flex flex-col gap-2 w-[240px]">
                  <Label htmlFor="status-a" className="px-1">Status</Label>
                  <Select value={statusA} onValueChange={setStatusA}>
                    <SelectTrigger id="status-a" className="w-[240px]">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="w-[240px] bg-[var(--cinza-200)]">
                      <SelectGroup>
                        <SelectLabel>Todos</SelectLabel>
                        <SelectItem value="__all__">Todos</SelectItem>
                      </SelectGroup>
                      {statusOptionsA.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Disponíveis</SelectLabel>
                          {statusOptionsA.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 w-[260px]">
                  <Label htmlFor="date-a" className="px-1">Data</Label>
                  <Popover open={openA} onOpenChange={setOpenA}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" id="date-a" className="w-[260px] justify-between font-normal">
                        {dateA ? format(dateA, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0 bg-[var(--cinza-200)]" align="start">
                      <Calendar
                        mode="single"
                        selected={dateA}
                        captionLayout="dropdown"
                        onSelect={(d) => { setDateA(d); setOpenA(false); }}
                        locale={ptBR}
                      />
                      <div className="flex justify-end gap-2 p-2 border-t">
                        <Button variant="ghost" onClick={() => { setDateA(undefined); setOpenA(false); }}>
                          Limpar data
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="overflow-auto max-h-[60vh] pr-2 pb-10">
                <Table className="w-full mb-10">
                  <TableHeader>
                    <TableRow className="bg-[var(--verde-800)] text-[var(--branco)]">
                      <TableHead>Nome</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center"> 
                         <div className="flex flex-col items-center justify-center">
                                  <Spinner />
                                  <p className="mt-2">Carregando...</p>
                                </div>
                        </TableCell>
                      </TableRow>
                    ) : linhasAFiltered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Nenhum agendamento encontrado</TableCell>
                      </TableRow>
                    ) : (
                      linhasAFiltered.map((a) => (
                        <TableRow key={a.idAgendamento}>
                          <TableCell className="p-4">{a.paciente}</TableCell>
                          <TableCell>{a.medicoNome}</TableCell>
                          <TableCell>{a.especialidadeNome}</TableCell>
                          <TableCell>{a.dataFmt}</TableCell>
                          <TableCell>{a.horaFmt}</TableCell>
                          <TableCell>{a.status}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter />
                </Table>
                <div className="h-8" />
              </div>
            </div>
          )}

          {selectedTab === "beneficio" && (
            <div className="mt-4 w-full">
              <div className="flex items-end gap-4 w-full max-w-6xl mb-4 flex-wrap">
                <div className="flex flex-col gap-2 w-[320px]">
                  <Label htmlFor="nome-b" className="px-1">Beneficiado</Label>
                  <form className="flex" onSubmit={(e) => e.preventDefault()}>
                    <Input
                      id="nome-b"
                      type="text"
                      placeholder="Pesquise o beneficiado"
                      value={searchB}
                      onChange={(e) => setSearchB(e.target.value)}
                      className="flex-1 min-w-0 rounded-r-none"
                    />
                    <Button type="submit" className="flex-none rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]">
                      <Search className="h-4 w-4 text-[var(--branco)]" />
                    </Button>
                  </form>
                </div>

                <div className="flex flex-col gap-2 w-[240px]">
                  <Label htmlFor="status-b" className="px-1">Status</Label>
                  <Select value={statusB} onValueChange={setStatusB}>
                    <SelectTrigger id="status-b" className="w-[240px]">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="w-[240px] bg-[var(--cinza-200)]">
                      <SelectGroup>
                        <SelectLabel>Todos</SelectLabel>
                        <SelectItem value="__all__">Todos</SelectItem>
                      </SelectGroup>
                      {statusOptionsB.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Disponíveis</SelectLabel>
                          {statusOptionsB.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 w-[260px]">
                  <Label htmlFor="date-b" className="px-1">Data</Label>
                  <Popover open={openB} onOpenChange={setOpenB}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" id="date-b" className="w-[260px] justify-between font-normal">
                        {dateB ? format(dateB, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0 bg-[var(--cinza-200)]" align="start">
                      <Calendar
                        mode="single"
                        selected={dateB}
                        captionLayout="dropdown"
                        onSelect={(d) => { setDateB(d); setOpenB(false); }}
                        locale={ptBR}
                      />
                      <div className="flex justify-end gap-2 p-2 border-t">
                        <Button variant="ghost" onClick={() => { setDateB(undefined); setOpenB(false); }}>
                          Limpar data
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="overflow-auto max-h-[60vh] pr-2 pb-10">
              <Table className="w-full mb-10">
              <TableHeader>
                <TableRow className="bg-[var(--verde-800)] text-[var(--branco)]">
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo de Pagamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Carregando solicitações...</TableCell>
                  </TableRow>
                ) : linhasBFiltered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Nenhuma solicitação encontrada</TableCell>
                  </TableRow>
                ) : (
                  linhasBFiltered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="p-4">{s.paciente}</TableCell>
                      <TableCell>{s.tipoPagamento}</TableCell>
                      <TableCell>{s.dataFmt}</TableCell>
                      <TableCell>{s.valorTotal}</TableCell>
                      <TableCell>{s.desconto}</TableCell>
                      <TableCell>{s.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
                <div className="h-8" />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
