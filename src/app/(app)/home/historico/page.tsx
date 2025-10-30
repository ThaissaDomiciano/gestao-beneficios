"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAuthHeader } from "@/app/api/lib/authHeader";
import { toast } from "sonner";
import type { Agendamento, Solicitacao, Colaborador } from "@/types";
import { History, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { formatarTexto } from "@/_helpers/textFormat";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export default function Historico() {
  const [selectedTab, setSelectedTab] = useState<"agendamento" | "beneficio">("agendamento");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // States para Agendamentos
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorId, setColaboradorId] = useState<string>("__all__");
  const [statusA, setStatusA] = useState<string>("__all__");
  const [pageA, setPageA] = useState(0);
  const [sizeA, setSizeA] = useState(10);
  const [totalPagesA, setTotalPagesA] = useState(0);
  const [totalElementsA, setTotalElementsA] = useState(0);

  // States para Benefícios
  const [colaboradorIdB, setColaboradorIdB] = useState<string>("__all__");
  const [statusB, setStatusB] = useState<string>("__all__");
  const [pageB, setPageB] = useState(0);
  const [sizeB, setSizeB] = useState(10);
  const [totalPagesB, setTotalPagesB] = useState(0);
  const [totalElementsB, setTotalElementsB] = useState(0);

  useEffect(() => {
    buscarColaboradores();
  }, []);

  useEffect(() => {
    buscarAgendamentos();
  }, [pageA, sizeA, statusA, colaboradorId]);

  useEffect(() => {
    buscarSolicitacoes();
  }, [pageB, sizeB, statusB, colaboradorIdB]);

  async function buscarColaboradores() {
    try {
      const res = await fetch(`${api}/colaborador`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Erro ao carregar colaboradores");
      const data = await res.json();
      setColaboradores(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os colaboradores");
    }
  }

  async function buscarAgendamentos() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageA));
      params.set('size', String(sizeA));

      if (statusA !== "__all__") {
        params.set('status', statusA);
      }

      if (colaboradorId !== "__all__") {
        params.set('colaboradorId', colaboradorId);
      }

      const queryString = params.toString();
      const res = await fetch(`${api}/agendamento?${queryString}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Erro ao carregar agendamentos");
      const data = await res.json();

      setAgendamentos(data.data || []);
      setTotalPagesA(data.meta.pagination.totalPages || 0);
      setTotalElementsA(data.meta.pagination.totalElements || 0);
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
      const params = new URLSearchParams();
      params.set('page', String(pageB));
      params.set('size', String(sizeB));

      if (statusB !== "__all__") {
        params.set('status', statusB);
      }

      if (colaboradorIdB !== "__all__") {
        params.set('colaboradorId', colaboradorIdB);
      }

      const queryString = params.toString();
      const res = await fetch(`${api}/solicitacao?${queryString}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Erro ao carregar solicitações");
      const data = await res.json();
      console.log(data);
      setSolicitacoes(data.data || []);
      setTotalPagesB(data.meta.pagination.totalPages || 0);
      setTotalElementsB(data.meta.pagination.totalElements || 0);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar as solicitações");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarcarFalta(agendamentoId: string) {
    setActionLoading(agendamentoId);
    try {
      const res = await fetch(
        `${api}/agendamento/${agendamentoId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ status: 'FALTOU' }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`Falha ao marcar falta: ${errorText || res.status}`);
      }

      setAgendamentos(prev => prev.map(a =>
        a.idAgendamento === agendamentoId
          ? { ...a, status: 'FALTOU' }
          : a
      ));
      toast.success("Falta marcada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível marcar a falta.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelar(agendamentoId: string) {
    setActionLoading(agendamentoId);
    try {
      const res = await fetch(
        `${api}/agendamento/${agendamentoId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ status: 'CANCELADO' }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`Falha ao cancelar: ${errorText || res.status}`);
      }

      setAgendamentos(prev => prev.map(a =>
        a.idAgendamento === agendamentoId
          ? { ...a, status: 'CANCELADO' }
          : a
      ));
      toast.success("Agendamento cancelado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível cancelar o agendamento.");
    } finally {
      setActionLoading(null);
    }
  }

  const linhasA = useMemo(() => {
    return agendamentos.map((a) => {
      const paciente = a.dependente?.nome ?? a.colaborador?.nome ?? "—";
      const medicoNome = a.medico?.nome ?? "—";
      const especialidadeNome = a.medico?.especialidade?.nome ?? "—";
      const dt = new Date(a.horario);
      const dataFmt = isNaN(+dt) ? "—" : format(dt, "dd/MM/yyyy", { locale: ptBR });
      const horaFmt = isNaN(+dt) ? "—" : format(dt, "HH:mm");
      return { ...a, paciente, medicoNome, especialidadeNome, dataFmt, horaFmt, _dt: dt };
    });
  }, [agendamentos]);



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

  const PaginationControls = ({
    page,
    totalPages,
    totalElements,
    size,
    onPageChange,
    onSizeChange
  }: {
    page: number;
    totalPages: number;
    totalElements: number;
    size: number;
    onPageChange: (newPage: number) => void;
    onSizeChange: (newSize: number) => void;
  }) => {
    const startItem = page * size + 1;
    const endItem = Math.min((page + 1) * size, totalElements);

    return (
      <div className="flex items-center justify-between px-2 py-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {startItem} a {endItem} de {totalElements} resultados
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <Select value={String(size)} onValueChange={(val) => onSizeChange(Number(val))}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--cinza-200)]">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Página {page + 1} de {totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="">
      <div className="">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <History className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Histórico</h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-4 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setSelectedTab("agendamento")}
              className={`rounded-md border px-4 py-2 font-medium transition mb-4 cursor-pointer ${selectedTab === "agendamento"
                ? "bg-[var(--verde-800)] text-[var(--branco)] border-[var(--verde-800)]"
                : "bg-[var(--branco)] text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
                }`}
            >
              Agendamento
            </button>
            <button
              onClick={() => setSelectedTab("beneficio")}
              className={`rounded-md border px-4 py-2 font-medium transition mb-4 cursor-pointer ${selectedTab === "beneficio"
                ? "bg-[var(--verde-800)] text-[var(--branco)] border-[var(--verde-800)]"
                : "bg-[var(--branco)] text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
                }`}
            >
              Benefício
            </button>
          </div>

          {selectedTab === "agendamento" && (
            <div className="mt-4 w-full">
              <div className="flex items-end gap-4 w-full mb-4 flex-wrap">
                <div className="flex flex-col gap-2 w-full max-w-[320px] min-w-[160px]">
                  <Label htmlFor="colaborador-a" className="px-1">Colaborador</Label>
                  <Select value={colaboradorId} onValueChange={(val) => { setColaboradorId(val); setPageA(0); }}>
                    <SelectTrigger id="colaborador-a" className="w-full">
                      <SelectValue placeholder="Selecione o colaborador" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--cinza-200)]">
                      <SelectGroup>
                        <SelectLabel>Todos</SelectLabel>
                        <SelectItem value="__all__">Todos os colaboradores</SelectItem>
                      </SelectGroup>
                      {colaboradores.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Colaboradores</SelectLabel>
                          {colaboradores.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome} - {c.matricula}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 max-w-[240px] w-full min-w-[120px]">
                  <Label htmlFor="status-a" className="px-1">Status</Label>
                  <Select value={statusA} onValueChange={(val) => { setStatusA(val); setPageA(0); }}>
                    <SelectTrigger id="status-a" className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--cinza-200)]">
                      <SelectGroup>
                        <SelectLabel>Todos</SelectLabel>
                        <SelectItem value="__all__">Todos</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="AGENDADO">AGENDADO</SelectItem>
                        <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                        <SelectItem value="CONCLUIDO">CONCLUIDO</SelectItem>
                        <SelectItem value="FALTOU">FALTOU</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cards para mobile/tablet */}
              <div className="block lg:hidden space-y-4 max-h-[50vh] overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Spinner />
                    <p className="mt-2">Carregando...</p>
                  </div>
                ) : linhasA.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-white">
                    Nenhum agendamento encontrado
                  </div>
                ) : (
                  linhasA.map((a) => (
                    <div
                      key={a.idAgendamento}
                      className="relative border-t-4 border-t-[var(--verde-900)] rounded-lg bg-white shadow-md overflow-hidden "
                    >
                      <div className="p-4 space-y-4">
                        {/* Header do Card */}
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-[var(--cinza-700)]">{a.paciente}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={actionLoading === a.idAgendamento || a.status === "FALTOU" || a.status === "CANCELADO"}
                              >
                                {actionLoading === a.idAgendamento ? (
                                  <Spinner className="h-4 w-4" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[var(--cinza-200)]">
                              <DropdownMenuItem
                                onClick={() => handleMarcarFalta(a.idAgendamento)}
                                className="cursor-pointer"
                              >
                                Marcar falta
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCancelar(a.idAgendamento)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                Cancelar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>{a.medicoNome}</span>
                        </div>

                        {/* Especialidade */}
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">ESPECIALIDADE</p>
                          <p className="font-medium text-[var(--cinza-700)]">{a.especialidadeNome}</p>
                        </div>

                        {/* Data e Horário */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              DATA
                            </p>
                            <p className="font-medium text-[var(--cinza-700)]">{a.dataFmt}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              HORÁRIO
                            </p>
                            <p className="font-medium text-[var(--cinza-700)]">{a.horaFmt}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-500">Status</span>
                          <Badge
                            className={
                              `px-4 py-1 font-semibold rounded-full text-sm ${a.status === "CONCLUIDO"
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : a.status === "AGENDADO"
                                  ? "bg-cyan-500 text-white hover:bg-cyan-600"
                                  : a.status === "FALTOU"
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : a.status === "CANCELADO"
                                      ? "bg-gray-400 text-white hover:bg-gray-500"
                                      : "bg-gray-200 text-gray-700"
                              }`
                            }
                          >
                            {formatarTexto(a.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <PaginationControls
                  page={pageA}
                  totalPages={totalPagesA}
                  totalElements={totalElementsA}
                  size={sizeA}
                  onPageChange={setPageA}
                  onSizeChange={(newSize) => { setSizeA(newSize); setPageA(0); }}
                />
              </div>

              {/* Tabela para desktop */}
              <div className="hidden lg:block overflow-auto max-h-[60vh] border-black border rounded-md [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
                <Table className="w-full relative">
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-[var(--verde-800)] text-[var(--branco)] hover:bg-[var(--verde-800)]">
                      <TableHead>Nome</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
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
                    ) : linhasA.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Nenhum agendamento encontrado</TableCell>
                      </TableRow>
                    ) : (
                      linhasA.map((a, index) => (
                        <TableRow key={a.idAgendamento} className={index % 2 === 1 ? "bg-[#DDE9E6]" : ""}>
                          <TableCell className="p-4">{a.paciente}</TableCell>
                          <TableCell>{a.medicoNome}</TableCell>
                          <TableCell>{a.especialidadeNome}</TableCell>
                          <TableCell>{a.dataFmt}</TableCell>
                          <TableCell>{a.horaFmt}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                `font-semibold border-2 rounded-full ${a.status === "CONCLUIDO"
                                  ? "bg-[var(--sucesso-800)] text-[var(--cinza-700)]"
                                  : a.status === "AGENDADO"
                                    ? "bg-[var(--alerta-800)] text-[var(--cinza-700)]"
                                    : a.status === "FALTOU" || a.status === "CANCELADO"
                                      ? "bg-[var(--erro-800)] text-[var(--cinza-700)]"
                                      : "bg-gray-100 text-[var(--cinza-700)]"
                                }`
                              }
                            >
                              {formatarTexto(a.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  disabled={actionLoading === a.idAgendamento || a.status === "FALTOU" || a.status === "CANCELADO"}
                                >
                                  {actionLoading === a.idAgendamento ? (
                                    <Spinner className="h-4 w-4" />
                                  ) : (
                                    <MoreVertical className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[var(--cinza-200)]">
                                <DropdownMenuItem
                                  onClick={() => handleMarcarFalta(a.idAgendamento)}
                                  className="cursor-pointer"
                                >
                                  Marcar falta
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCancelar(a.idAgendamento)}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="sticky bottom-0 z-10 bg-[var(--cinza-200)]">
                  <PaginationControls
                    page={pageA}
                    totalPages={totalPagesA}
                    totalElements={totalElementsA}
                    size={sizeA}
                    onPageChange={setPageA}
                    onSizeChange={(newSize) => { setSizeA(newSize); setPageA(0); }}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedTab === "beneficio" && (
            <div className="mt-4 w-full">
              <div className="flex items-end gap-4 w-full mb-4 flex-wrap">
                <div className="flex flex-col gap-2 max-w-[320px] min-w-[160px] w-full">
                  <Label htmlFor="colaborador-b" className="px-1">Colaborador</Label>
                  <Select value={colaboradorIdB} onValueChange={(val) => { setColaboradorIdB(val); setPageB(0); }}>
                    <SelectTrigger id="colaborador-b" className="w-full">
                      <SelectValue placeholder="Selecione o colaborador" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--cinza-200)]">
                      <SelectGroup>
                        <SelectLabel>Todos</SelectLabel>
                        <SelectItem value="__all__">Todos os colaboradores</SelectItem>
                      </SelectGroup>
                      {colaboradores.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Colaboradores</SelectLabel>
                          {colaboradores.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome} - {c.matricula}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 max-w-[240px] w-full min-w-[120px]">
                  <Label htmlFor="status-b" className="px-1">Status</Label>
                  <Select value={statusB} onValueChange={(val) => { setStatusB(val); setPageB(0); }}>
                    <SelectTrigger id="status-b" className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--cinza-200)]">
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
              </div>

              {/* Cards para mobile/tablet */}
              <div className="block lg:hidden space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Spinner />
                    <p className="mt-2">Carregando...</p>
                  </div>
                ) : linhasB.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-white">
                    Nenhuma solicitação encontrada
                  </div>
                ) : (
                  linhasB.map((s) => (
                    <div
                      key={s.id}
                      className="relative border-t-4 border-t-[var(--verde-900)] rounded-lg bg-white shadow-md overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        {/* Header do Card */}
                        <h3 className="text-xl font-bold text-[var(--cinza-700)]">{s.paciente}</h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>{formatarTexto(s.tipoPagamento)}</span>
                        </div>

                        {/* Data */}
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            DATA
                          </p>
                          <p className="font-medium text-[var(--cinza-700)]">{s.dataFmt}</p>
                        </div>

                        {/* Valores */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">VALOR TOTAL</p>
                            <p className="font-medium text-[var(--cinza-700)]">{s.valorTotal}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">DESCONTO</p>
                            <p className="font-medium text-[var(--cinza-700)]">{s.desconto}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-500">Status</span>
                          <Badge
                            className={
                              `px-4 py-1 font-semibold rounded-full text-sm ${s.status === "APROVADA"
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : s.status === "PENDENTE" || s.status === "PENDENTE_ASSINATURA"
                                  ? "bg-cyan-500 text-white hover:bg-cyan-600"
                                  : s.status === "REJEITADA" || s.status === "CANCELADA"
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-gray-200 text-gray-700"
                              }`
                            }
                          >
                            {formatarTexto(s.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <PaginationControls
                  page={pageB}
                  totalPages={totalPagesB}
                  totalElements={totalElementsB}
                  size={sizeB}
                  onPageChange={setPageB}
                  onSizeChange={(newSize) => { setSizeB(newSize); setPageB(0); }}
                />
              </div>

              {/* Tabela para desktop */}
              <div className="hidden lg:block overflow-auto max-h-[60vh] border-black border rounded-md [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
                <Table className="w-full relative">
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-[var(--verde-800)] text-[var(--branco)] hover:bg-[var(--verde-800)]">
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
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <Spinner />
                            <p className="mt-2">Carregando...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : linhasB.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">Nenhuma solicitação encontrada</TableCell>
                      </TableRow>
                    ) : (
                      linhasB.map((s, index) => (
                        <TableRow key={s.id} className={index % 2 === 1 ? "bg-[#DDE9E6]" : ""}>
                          <TableCell className="p-4">{s.paciente}</TableCell>
                          <TableCell>{formatarTexto(s.tipoPagamento)}</TableCell>
                          <TableCell>{s.dataFmt}</TableCell>
                          <TableCell>{s.valorTotal}</TableCell>
                          <TableCell>{s.desconto}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                `font-semibold border-2 rounded-full
                                ${s.status === "APROVADA"
                                  ? "bg-[var(--sucesso-800)] text-[var(--cinza-700)]"
                                  : s.status === "REJEITADA" || s.status === "CANCELADA"
                                    ? "bg-red-100 text-[var(--cinza-700)]"
                                    : s.status === "PENDENTE" || s.status === "PENDENTE_ASSINATURA"
                                      ? "bg-[var(--alerta-800)] text-[var(--cinza-700)]"
                                      : "bg-gray-100 text-[var(--cinza-700)]"
                                }`
                              }
                            >
                              {formatarTexto(s.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="sticky bottom-0 z-10 bg-[var(--cinza-200)]">
                  <PaginationControls
                    page={pageB}
                    totalPages={totalPagesB}
                    totalElements={totalElementsB}
                    size={sizeB}
                    onPageChange={setPageB}
                    onSizeChange={(newSize) => { setSizeB(newSize); setPageB(0); }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
