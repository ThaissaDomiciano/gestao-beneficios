"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAuthHeader } from "@/app/api/lib/authHeader";
import { toast } from "sonner";
import { ChevronDownIcon, History, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

type Colaborador = { id: string; nome: string };
type Dependente = { id: string; nome: string };
type Especialidade = { id: string; nome: string } | null | undefined;
type Medico = { id: string; nome: string; especialidade?: Especialidade };
type Agendamento = {
  idAgendamento: string;
  colaborador: Colaborador;
  dependente: Dependente | null;
  medico?: Medico | null;
  horario: string;
  status: "AGENDADO" | "CANCELADO" | "REALIZADO";
};
type Beneficio = { id: string; nome: string; descricao: string; percentualDesconto: number };
type Solicitacao = {
  id: string;
  colaborador: Colaborador;
  dependente: Dependente | null;
  beneficio: Beneficio;
  valorTotal: number;
  desconto: number;
  descricao: string;
  qtdeParcelas: number;
  dataSolicitacao: string;
  tipoPagamento: "DESCONTADO_FOLHA" | "PAGAMENTO_UNICO" | "PAGAMENTO_PROPRIO";
  status: "APROVADA" | "REJEITADA" | "CANCELADA" | "PENDENTE_APROVACAO" | "PENDENTE_ASSINATURA";
};

export default function Historico() {
  const [selectedTab, setSelectedTab] = useState<"agendamento" | "beneficio">("agendamento");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);

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

  const linhas = useMemo(() => {
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
      return { ...a, paciente, medicoNome, especialidadeNome, dataFmt, horaFmt };
    });
  }, [agendamentos]);

  const linhasSolicitacoes = useMemo(() => {
    return solicitacoes.map((a) => {
      const paciente = a.dependente?.nome ?? a.colaborador?.nome ?? "—";
      const tipoPagamento = a.tipoPagamento ?? "—";
      const dt = new Date(a.dataSolicitacao);
      const dataFmt = isNaN(+dt) ? "—" : format(dt, "dd/MM/yyyy", { locale: ptBR });
      const valorTotal = a.valorTotal ?? "-";
      const desconto = a.desconto ?? "-";
      const status = a.status ?? "-";
      return { ...a, paciente, tipoPagamento, dataFmt, valorTotal, desconto, status };
    });
  }, [solicitacoes]);

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
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setSelectedTab("agendamento")}
              className={`rounded-md border px-4 py-2 font-medium transition mb-4 ${
                selectedTab === "agendamento"
                  ? "bg-[var(--verde-800)] text-white border-[var(--verde-800)]"
                  : "bg-white text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
              }`}
            >
              Agendamento
            </button>
            <button
              onClick={() => setSelectedTab("beneficio")}
              className={`rounded-md border px-4 py-2 font-medium transition mb-4 ${
                selectedTab === "beneficio"
                  ? "bg-[var(--verde-800)] text-white border-[var(--verde-800)]"
                  : "bg-white text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
              }`}
            >
              Benefício
            </button>
          </div>

          {selectedTab === "agendamento" && (
            <div className="mt-4 w-full overflow-y-hidden sm:overflow-x-auto">
              <div className="flex items-center gap-2 w-full max-w-4xl mb-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="nome" className="px-1">Nome do colaborador</Label>
                  <form className="flex flex-1 min-w-0">
                    <Input type="text" placeholder="Pesquise o nome" className="flex-1 min-w-0 rounded-r-none" />
                    <Button type="submit" className="flex-none rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]">
                      <Search className="h-4 w-4 text-[var(--branco)]" />
                    </Button>
                  </form>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="status" className="px-1">Status</Label>
                  <Select>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="w-[220px] bg-[var(--cinza-200)]">
                      <SelectGroup>
                        <SelectLabel>Benefícios</SelectLabel>
                        <SelectItem value="beneficio1">Dentista</SelectItem>
                        <SelectItem value="beneficio2">Óculos</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="date" className="px-1">Data</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" id="date" className="w-[250px] justify-between font-normal">
                        {date ? date.toLocaleDateString() : "Selecione a data"}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(d) => {
                          setDate(d);
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Table className="w-full">
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
                      <TableCell colSpan={6} className="text-center">Carregando agendamentos...</TableCell>
                    </TableRow>
                  ) : linhas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Nenhum agendamento encontrado</TableCell>
                    </TableRow>
                  ) : (
                    linhas.map((a) => (
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
            </div>
          )}

          {selectedTab === "beneficio" && (
            <div className="mt-4 w-full overflow-y-hidden sm:overflow-x-auto">
              <div className="flex items-center gap-2 w-full max-w-4xl mb-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="beneficiado-b" className="px-1">Beneficiado</Label>
                  <form className="flex flex-1 min-w-0">
                    <Input id="beneficiado-b" type="text" placeholder="Pesquise o beneficiado" className="flex-1 min-w-0 rounded-r-none" />
                    <Button type="submit" className="flex-none rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]">
                      <Search className="h-4 w-4 text-[var(--branco)]" />
                    </Button>
                  </form>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="beneficio-b" className="px-1">Benefício</Label>
                  <Select>
                    <SelectTrigger className="w-[220px]" id="beneficio-b">
                      <SelectValue placeholder="Selecione o benefício" />
                    </SelectTrigger>
                    <SelectContent className="w-[220px] bg-[var(--cinza-200)]">
                      <SelectGroup>
                        <SelectLabel>Benefícios</SelectLabel>
                        <SelectItem value="beneficio1">Dentista</SelectItem>
                        <SelectItem value="beneficio2">Óculos</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="date-b" className="px-1">Data</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" id="date-b" className="w-[250px] justify-between font-normal">
                        {date ? date.toLocaleDateString() : "Selecione a data"}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(d) => {
                          setDate(d);
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-6 rounded-lg">
                <Table className="w-full">
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
                    ) : linhasSolicitacoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Nenhuma solicitação encontrada</TableCell>
                      </TableRow>
                    ) : (
                      linhasSolicitacoes.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="p-4">{a.paciente}</TableCell>
                          <TableCell>{a.tipoPagamento}</TableCell>
                          <TableCell>{a.dataFmt}</TableCell>
                          <TableCell>{a.valorTotal}</TableCell>
                          <TableCell>{a.desconto}</TableCell>
                          <TableCell>{a.status}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter />
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
