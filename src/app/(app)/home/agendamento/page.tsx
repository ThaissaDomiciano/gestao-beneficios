'use client'

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAuthHeader } from '@/app/api/lib/authHeader';
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Agendamento as AgendamentoType } from "@/types/index";
import { CalendarDays, CalendarIcon, X, Check } from "lucide-react";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

type SlotDisponibilidade = {
  horario: string;
  disponivel: boolean;
};

export default function Agendamento() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [modo, setModo] = useState<"detalhe" | "remarcar">("detalhe");
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [agendamentos, setAgendamentos] = useState<AgendamentoType[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<AgendamentoType[]>([]);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoType | null>(null);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<SlotDisponibilidade[]>([]);
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  const [slotSelecionadoISO, setSlotSelecionadoISO] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(new Date()));
  const [fetchingMonth, setFetchingMonth] = useState(false);
  const monthAvailabilityCache = useRef<Map<string, Set<string>>>(new Map());
  const [availableDaysThisMonth, setAvailableDaysThisMonth] = useState<Set<string>>(new Set());

  const toISODate = (d: Date) => format(d, 'yyyy-MM-dd');
  const monthKey = (d: Date) => format(d, 'yyyy-MM');
  const ddmmyyyyHHmm = (isoUTC: string) => format(new Date(isoUTC), "dd/MM/yyyy HH:mm", { locale: ptBR });
  const ddmmyyyy = (isoUTC: string) => format(new Date(isoUTC), "dd/MM/yyyy", { locale: ptBR });
  const onlyHHmm = (isoUTC: string) => format(new Date(isoUTC), "HH:mm", { locale: ptBR });
  const hhmm = (isoUTC: string) => format(new Date(isoUTC), 'HH:mm', { locale: ptBR });
  const todayISO = () => format(new Date(), 'yyyy-MM-dd');
  const isFutureOrTodayISO = (iso: string) => iso >= todayISO();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  useEffect(() => {
    if (!date) {
      setFilteredAgendamentos(agendamentos);
      return;
    }
    const filtered = agendamentos.filter((agendamento) => {
      const agendamentoDate = new Date(agendamento.horario);
      return (
        agendamentoDate.getDate() === date.getDate() &&
        agendamentoDate.getMonth() === date.getMonth() &&
        agendamentoDate.getFullYear() === date.getFullYear()
      );
    });
    setFilteredAgendamentos(filtered);
  }, [date, agendamentos]);

  async function buscarAgendamentos() {
    setLoading(true);
    try {
      const res = await fetch(`${api}/agendamento`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Erro ao carregar agendamentos");
      const data = await res.json();
      const apenasAgendados = (data.data || []).filter(
        (agendamento: AgendamentoType) => agendamento.status === "AGENDADO"
      );
      setAgendamentos(apenasAgendados);
      setFilteredAgendamentos(apenasAgendados);
    } catch {
      toast.error("Não foi possível carregar os agendamentos");
    } finally {
      setLoading(false);
    }
  }

  async function buscarDisponibilidadeDia(medicoId: string, dia: Date) {
    setCarregandoSlots(true);
    setSlots([]);
    setSlotSelecionadoISO(null);
    try {
      const diaStr = toISODate(dia);
      const url = `${api}/medico/${medicoId}/disponibilidade?dia=${encodeURIComponent(diaStr)}`;
      const res = await fetch(url, { headers: getAuthHeader() });
      if (!res.ok) {
        let bodyText = '';
        try { bodyText = await res.text(); } catch { }
        if (res.status === 400 && bodyText) {
          try {
            const j = JSON.parse(bodyText);
            const msg = (j?.message || j?.error || '').toString().toLowerCase();
            if (msg.includes('não atende neste dia')) {
              toast.info("Este médico não atende nesse dia da semana.");
              return;
            }
            if (msg.includes('fora do expediente')) {
              toast.info("Sem horários no expediente para esta data.");
              return;
            }
          } catch { }
        }
        throw new Error(`GET disponibilidade falhou: ${bodyText || res.status}`);
      }
      const json = await res.json();
      const lista = (json?.data ?? []) as SlotDisponibilidade[];
      setSlots(Array.isArray(lista) ? lista : []);
      if (!lista || lista.length === 0 || !lista.some(s => s.disponivel)) {
        toast.info("Sem horários para esta data.");
      }
    } catch {
      toast.error("Falha ao consultar disponibilidade do médico.");
    } finally {
      setCarregandoSlots(false);
    }
  }

  async function buscarDiasDisponiveisDoMes(medicoId: string, baseMonth: Date) {
    const key = `${medicoId}-${monthKey(baseMonth)}`;
    if (monthAvailabilityCache.current.has(key)) {
      const cached = monthAvailabilityCache.current.get(key)!;
      const futureOnly = new Set(Array.from(cached).filter(isFutureOrTodayISO));
      setAvailableDaysThisMonth(futureOnly);
      if (futureOnly.size > 0) {
        const firstIso = Array.from(futureOnly).sort()[0];
        if (!dataSelecionada || !futureOnly.has(toISODate(dataSelecionada))) {
          setDataSelecionada(new Date(firstIso + 'T00:00:00'));
        }
      } else {
        setDataSelecionada(undefined);
        setSlots([]);
        setSlotSelecionadoISO(null);
      }
      return;
    }
    setFetchingMonth(true);
    const start = startOfMonth(baseMonth);
    const end = endOfMonth(baseMonth);
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      days.push(new Date(d));
    }
    const CONCURRENCY = 4;
    const availableSet = new Set<string>();
    let index = 0;

    async function worker() {
      while (index < days.length) {
        const i = index++;
        const dia = days[i];
        const diaStr = toISODate(dia);
        if (!isFutureOrTodayISO(diaStr)) continue;
        const url = `${api}/medico/${medicoId}/disponibilidade?dia=${encodeURIComponent(diaStr)}`;
        try {
          const res = await fetch(url, { headers: getAuthHeader() });
          if (!res.ok) {
            if (res.status === 400) continue;
            continue;
          }
          const json = await res.json();
          const lista = (json?.data ?? []) as SlotDisponibilidade[];
          const temDisponivel = Array.isArray(lista) && lista.some(s => s.disponivel);
          if (temDisponivel) {
            availableSet.add(diaStr);
          }
        } catch {
          continue;
        }
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    monthAvailabilityCache.current.set(key, availableSet);
    const futureOnly = new Set(Array.from(availableSet).filter(isFutureOrTodayISO));
    setAvailableDaysThisMonth(futureOnly);

    if (futureOnly.size > 0) {
      const firstIso = Array.from(futureOnly).sort()[0];
      if (!dataSelecionada || !futureOnly.has(toISODate(dataSelecionada))) {
        setDataSelecionada(new Date(firstIso + 'T00:00:00'));
      }
    } else {
      setDataSelecionada(undefined);
      setSlots([]);
      setSlotSelecionadoISO(null);
    }
    setFetchingMonth(false);
  }

  useEffect(() => {
    if (modo !== "remarcar" || !agendamentoSelecionado) return;
    const dataDoAgendamento = new Date(agendamentoSelecionado.horario);
    setDataSelecionada(dataDoAgendamento);
    const m = startOfMonth(dataDoAgendamento);
    setCalendarMonth(m);
    buscarDiasDisponiveisDoMes(agendamentoSelecionado.medico.id, m)
      .catch(() => toast.error("Falha ao consultar dias do mês."));
  }, [modo, agendamentoSelecionado]);

  const handleMonthChange = (m: Date) => {
    setCalendarMonth(m);
    if (agendamentoSelecionado) {
      buscarDiasDisponiveisDoMes(agendamentoSelecionado.medico.id, m)
        .catch(() => toast.error("Falha ao consultar dias do mês."));
    }
  };

  useEffect(() => {
    if (modo !== "remarcar" || !agendamentoSelecionado || !dataSelecionada) return;
    buscarDisponibilidadeDia(agendamentoSelecionado.medico.id, dataSelecionada);
  }, [dataSelecionada, modo, agendamentoSelecionado]);

  async function confirmarRemarcacao() {
    if (!agendamentoSelecionado || !slotSelecionadoISO) {
      toast.warning("Selecione um horário disponível.");
      return;
    }

    const slotDateLocalISO = format(new Date(slotSelecionadoISO), "yyyy-MM-dd");
    try {
      const resDisp = await fetch(
        `${api}/medico/${agendamentoSelecionado.medico.id}/disponibilidade?dia=${encodeURIComponent(slotDateLocalISO)}`,
        { headers: getAuthHeader() }
      );
      if (!resDisp.ok) {
        const msg = await resDisp.text().catch(() => "");
        throw new Error(msg || "Falha ao validar disponibilidade.");
      }
      const json = await resDisp.json();
      const lista = (json?.data ?? []) as SlotDisponibilidade[];
      const aindaDisponivel = Array.isArray(lista) && lista.some(s => s.disponivel && s.horario === slotSelecionadoISO);
      if (!aindaDisponivel) {
        toast.error("Esse horário não está mais disponível para o médico.");
        return;
      }

      const res = await fetch(
        `${api}/agendamento/${agendamentoSelecionado.idAgendamento}/data`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ horario: slotSelecionadoISO }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`Falha ao remarcar: ${errorText || res.status}`);
      }

      setAgendamentos(prev => prev.map(a =>
        a.idAgendamento === agendamentoSelecionado.idAgendamento
          ? { ...a, horario: slotSelecionadoISO }
          : a
      ));
      setFilteredAgendamentos(prev => prev.map(a =>
        a.idAgendamento === agendamentoSelecionado.idAgendamento
          ? { ...a, horario: slotSelecionadoISO }
          : a
      ));
      setAgendamentoSelecionado(prev =>
        prev ? { ...prev, horario: slotSelecionadoISO } : prev
      );

      toast.success("Agendamento remarcado com sucesso!");
      setModo("detalhe");
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível remarcar o agendamento.");
    }
  }


  function SlotButton({ slot }: { slot: SlotDisponibilidade }) {
    const isSelected = slotSelecionadoISO === slot.horario;
    const disabled = !slot.disponivel;
    return (
      <Button
        type="button"
        variant={isSelected ? "default" : "outline"}
        disabled={disabled}
        onClick={() => !disabled && setSlotSelecionadoISO(slot.horario)}
        className={cn(
          "justify-center",
          "border-[var(--verde-900)]",
          isSelected && "bg-[var(--verde-900)] text-[var(--branco)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {hhmm(slot.horario)}
      </Button>
    );
  }

  const modifiers = useMemo(() => ({
    selected: (day: Date) => dataSelecionada ? toISODate(day) === toISODate(dataSelecionada) : false,
    available: (day: Date) => availableDaysThisMonth.has(toISODate(day)),
  }), [dataSelecionada, availableDaysThisMonth]);

  const modifiersStyles = useMemo(() => ({
    selected: {
      backgroundColor: 'var(--verde-900)',
      color: 'var(--branco)',
      fontWeight: 'bold',
      borderRadius: '4px'
    },
    available: {
      border: '1px solid var(--verde-900)',
      fontWeight: 600,
    }
  }), []);

  const availableDatesList = useMemo(() => {
    return Array.from(availableDaysThisMonth)
      .filter(isFutureOrTodayISO)
      .sort()
      .map(iso => new Date(iso + 'T00:00:00'));
  }, [availableDaysThisMonth]);

  return (
    <main className="min-h-screen w-screen max-w-none">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <CalendarDays />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Agendamento</h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-12 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow-sm w-[400px]"
                captionLayout="dropdown"
                modifiers={{
                  selected: (day) => date ? day.getTime() === date.getTime() : false
                }}
                modifiersStyles={{
                  selected: {
                    backgroundColor: 'var(--verde-900)',
                    color: 'var(--branco)',
                    fontWeight: 'bold',
                    borderRadius: '4px'
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <Spinner />
                  <p className="mt-2">Carregando...</p>
                </div>
              ) : filteredAgendamentos.length === 0 ? (
                <div>Nenhum agendamento encontrado</div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
                  {filteredAgendamentos.map((agendamento) => (
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
                          {ddmmyyyyHHmm(agendamento.horario)}
                        </p>

                        <Dialog>
                          <DialogTrigger
                            asChild
                            className="bg-[var(--verde-900)] text-[var(--branco)]"
                            onClick={() => {
                              setAgendamentoSelecionado(agendamento);
                              setModo("detalhe");
                            }}
                          >
                            <Button variant="outline">Detalhar</Button>
                          </DialogTrigger>

                          <DialogContent className="sm:max-w-[720px] bg-[var(--cinza-200)]">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-[var(--verde-900)]">
                                Detalhe do agendamento
                              </DialogTitle>
                              <DialogDescription className="sr-only">
                                Visualize detalhes ou remarque a data e hora.
                              </DialogDescription>
                            </DialogHeader>

                            {modo === "detalhe" && agendamentoSelecionado ? (
                              <>
                                <div className="space-y-3">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-semibold">Paciente</span>
                                    <span>
                                      {agendamentoSelecionado.dependente
                                        ? agendamentoSelecionado.dependente.nome
                                        : agendamentoSelecionado.colaborador.nome}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-semibold">Médico</span>
                                    <span>{agendamentoSelecionado.medico.nome}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <span className="font-semibold">Data </span>
                                      {ddmmyyyy(agendamentoSelecionado.horario)}
                                    </div>
                                    <div>
                                      <span className="font-semibold">Horário </span>
                                      {onlyHHmm(agendamentoSelecionado.horario)}
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter className="mt-6 text-[var(--branco)]">
                                  <Button
                                    onClick={() => setModo("remarcar")}
                                    className="gap-2 bg-[var(--verde-900)]"
                                    variant="secondary"
                                  >
                                    <CalendarIcon size={18} className="text-[var(--branco)]" />
                                    Remarcar
                                  </Button>
                                  <DialogClose asChild className="text-[var(--branco)]">
                                    <Button variant="outline" className="gap-2 bg-[var(--verde-900)]">
                                      <X size={18} className="text-[var(--branco)]" />
                                      Fechar
                                    </Button>
                                  </DialogClose>
                                </DialogFooter>
                              </>
                            ) : (
                              <>
                                <div className="space-y-3">
                                  <Label>Escolha um dia com disponibilidade</Label>

                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "justify-start text-left font-normal",
                                              !dataSelecionada && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dataSelecionada
                                              ? format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })
                                              : "DD/MM/AA"}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            mode="single"
                                            month={calendarMonth}
                                            onMonthChange={handleMonthChange}
                                            selected={dataSelecionada}
                                            onSelect={(d) => {
                                              if (!d) return;
                                              const iso = toISODate(d);
                                              if (iso < todayISO()) return;
                                              if (!availableDaysThisMonth.has(iso)) return;
                                              setDataSelecionada(d);
                                            }}
                                            initialFocus
                                            locale={ptBR}
                                            modifiers={modifiers}
                                            modifiersStyles={modifiersStyles}
                                            disabled={(day) => {
                                              const iso = toISODate(day);
                                              return iso < todayISO() || !availableDaysThisMonth.has(iso);
                                            }}
                                          />
                                        </PopoverContent>
                                      </Popover>

                                      {fetchingMonth && (
                                        <div className="flex items-center gap-2 text-sm opacity-70">
                                          <Spinner /> <span>Carregando dias do mês…</span>
                                        </div>
                                      )}

                                      {availableDatesList.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                          {availableDatesList.map((d) => {
                                            const isActive = dataSelecionada && toISODate(d) === toISODate(dataSelecionada);
                                            return (
                                              <Button
                                                key={toISODate(d)}
                                                size="sm"
                                                variant={isActive ? "default" : "outline"}
                                                onClick={() => setDataSelecionada(d)}
                                                className={cn(
                                                  "px-3",
                                                  isActive && "bg-[var(--verde-900)] text-[var(--branco)]"
                                                )}
                                              >
                                                {format(d, "dd/MM", { locale: ptBR })}
                                              </Button>
                                            );
                                          })}
                                        </div>
                                      )}
                                      {availableDatesList.length === 0 && !fetchingMonth && (
                                        <p className="text-sm text-muted-foreground">
                                          Nenhum dia com disponibilidade neste mês.
                                        </p>
                                      )}
                                    </div>

                                    <div className="hidden xl:flex" />
                                  </div>

                                  <div className="mt-2">
                                    {(() => {
                                      if (carregandoSlots) {
                                        return (
                                          <div className="flex items-center gap-2">
                                            <Spinner />
                                            <span>Carregando horários…</span>
                                          </div>
                                        );
                                      }
                                      if (!dataSelecionada) {
                                        return (
                                          <p className="text-sm text-muted-foreground">
                                            Selecione uma data.
                                          </p>
                                        );
                                      }
                                      const isToday = format(dataSelecionada, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                                      const now = new Date();
                                      const futureSlots = slots.filter(s => {
                                        if (!s.disponivel) return false;
                                        if (!isToday) return true;
                                        return new Date(s.horario) > now;
                                      });
                                      if (futureSlots.length === 0) {
                                        return (
                                          <p className="text-sm text-muted-foreground">
                                            Sem horários disponíveis para esta data.
                                          </p>
                                        );
                                      }
                                      return (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[240px] overflow-auto pr-1">
                                          {futureSlots.map((s) => (
                                            <SlotButton key={s.horario} slot={s} />
                                          ))}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>

                                <DialogFooter className="mt-6 text-[var(--branco)]">
                                  <Button
                                    variant="outline"
                                    className="gap-2 bg-[var(--verde-900)]"
                                    onClick={() => setModo("detalhe")}
                                  >
                                    <X size={18} />
                                    Cancelar
                                  </Button>
                                 <Button
                                      className="gap-2 text-[var(--branco)] bg-[var(--verde-900)] disabled:opacity-60 justify-center min-w-[150px]"
                                      onClick={async () => {
                                        if (!slotSelecionadoISO || confirming) return;
                                        setConfirming(true);
                                        try {
                                          await confirmarRemarcacao();  
                                        } finally {
                                          setConfirming(false);
                                        }
                                      }}
                                      disabled={!slotSelecionadoISO || confirming}
                                      aria-busy={confirming}
                                    >
                                      {confirming ? (
                                        <>
                                          <Spinner />
                                          Remarcando…
                                        </>
                                      ) : (
                                        <>
                                          <Check size={18} />
                                          Confirmar
                                        </>
                                      )}
                                    </Button>

                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
