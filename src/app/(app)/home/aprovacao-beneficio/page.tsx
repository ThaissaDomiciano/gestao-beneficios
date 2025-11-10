'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getAuthHeader } from '@/app/api/lib/authHeader';
import type { Solicitacao, Documento, Beneficio } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Check,
  ChevronDownIcon,
  CircleCheckBig,
  Eye,
  Search,
  X
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export default function AprovacaoBeneficio() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [modo, setModo] = useState<"detalhe" | "aprovar">("detalhe");
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [valorTotal, setValorTotal] = useState<string>("");
  const [valorComDesconto, setValorComDesconto] = useState<string>("");
  const [desconto, setDesconto] = useState<string>("")
  const [pesquisarBeneficiado, setPesquisarBeneficiado] = useState("");
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const BENEFICIO_ALL = "ALL";
  const [beneficioSelecionado, setBeneficioSelecionado] = useState<string>(BENEFICIO_ALL);
  const [isAproving, setIsAproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    buscarSolicitacoes();
    buscarBeneficios();
  }, []);

  const norm = (s?: string) =>
    (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

  const solicitacoesFiltradas = useMemo(() => {
    let base = solicitacoes.filter(s => s.status === "PENDENTE");
    const q = norm(pesquisarBeneficiado.trim());
    if (q) {
      base = base.filter((s) => {
        const beneficiadoNome = s.dependente ? s.dependente.nome : s.colaborador.nome;
        return norm(beneficiadoNome).includes(q);
      });
    }
    if (beneficioSelecionado !== BENEFICIO_ALL) {
      const alvo = norm(beneficioSelecionado);
      base = base.filter((s) => norm(s.beneficio.nome).includes(alvo));
    }
    if (date) {
      const start = startOfDay(date);
      const end = endOfDay(date);
      base = base.filter((s) => {
        const d = parseISO(s.dataSolicitacao);
        return isWithinInterval(d, { start, end });
      });
    }
    return base;
  }, [solicitacoes, pesquisarBeneficiado, beneficioSelecionado, date]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  const calcularDesconto = (valor: string, percentual: number) => {
    const valorNumerico = Number(String(valor).replace(/\./g, "").replace(",", ".")) || 0;
    const descontoValor = (valorNumerico * percentual) / 100;
    const valorFinal = valorNumerico - descontoValor;
    return {
      desconto: descontoValor,
      valorComDesconto: valorFinal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    };
  };

  const HandleValorTotalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const novoValor = e.target.value;
    setValorTotal(novoValor);
  };

  useEffect(() => {
    if (!solicitacaoSelecionada) {
      setValorComDesconto("");
      return;
    }
    const { desconto: dsc, valorComDesconto: vcd } = calcularDesconto(
      valorTotal || "0",
      solicitacaoSelecionada.beneficio?.percentualDesconto ?? 0
    );
    setDesconto(String(dsc));
    setValorComDesconto(vcd);
  }, [valorTotal, solicitacaoSelecionada]);

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

  async function buscarDocumentos(solicitacaoId: string, colaboradorId: string) {
    try {
      const res = await fetch(`${api}/documentos/${solicitacaoId}/${colaboradorId}`, {
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error("Erro ao carregar documentos");
      const data = await res.json();
      setDocumentos(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os documentos");
    }
  }

  async function buscarBeneficios() {
    try {
      const res = await fetch(`${api}/beneficio`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Erro ao carregar benefício");
      const data = await res.json();
      setBeneficios(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os benefícios");
    }
  }

  async function abrirDocumento(nomeArquivoUnico: string) {
    try {
      const res = await fetch(
        `${api}/documentos/${encodeURIComponent(nomeArquivoUnico)}/url-acesso`,
        { headers: getAuthHeader() }
      );
      if (!res.ok) throw new Error("Erro ao gerar URL do documento");
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Documento informado não foi encontrado!");
      const url: string = data.data ?? data.url;
      if (!url) throw new Error("Resposta sem URL");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Não foi possível abrir o documento");
    }
  }

  function abrirModalDetalhe(s: Solicitacao) {
    setSolicitacaoSelecionada(s);
    setModo("detalhe");
    setValorTotal((s.valorTotal ?? 0).toString());
    setDesconto((s.desconto ?? 0).toString());
    buscarDocumentos(s.id, s.colaborador.id);
  }

  async function aprovarSolicitacao() {
    if (!solicitacaoSelecionada || isAproving) return;
    setIsAproving(true);
    const toNumber = (v: string) =>
      Number(String(v).replace(/\./g, "").replace(",", ".")) || 0;

    const payload = {
      valorTotal: toNumber(valorTotal),
      desconto: toNumber(desconto),
      descricao: solicitacaoSelecionada.descricao,
      qtdeParcelas: solicitacaoSelecionada.qtdeParcelas,
      tipoPagamento: solicitacaoSelecionada.tipoPagamento,
      beneficioId: solicitacaoSelecionada.beneficio.id,
      colaboradorId: solicitacaoSelecionada.colaborador.id,
      dependenteId: solicitacaoSelecionada.dependente?.id ?? null
    };

    try {
      const res = await fetch(`${api}/solicitacao/${solicitacaoSelecionada.id}/aprovar`, {
        method: "POST",
        headers: getAuthHeader({ withJsonBody: true }),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Erro ao aprovar solicitação");
      }
      await res.json();
      setSolicitacoes((prev) =>
        prev.map((s) =>
          s.id === solicitacaoSelecionada.id
            ? {
              ...s,
              status: "APROVADA",
              valorTotal: payload.valorTotal,
              desconto: payload.desconto
            }
            : s
        )
      );
      toast.success("Solicitação aprovada com sucesso!");
      setModo("detalhe");
      await buscarDocumentos(solicitacaoSelecionada.id, solicitacaoSelecionada.colaborador.id);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Não foi possível aprovar a solicitação");
    } finally {
      setIsAproving(false);
    }
  }

  async function rejeitarSolicitacao() {
    if (!solicitacaoSelecionada || isRejecting) return;
    setIsRejecting(true);

    try {
      const res = await fetch(`${api}/solicitacao/${solicitacaoSelecionada.id}`, {
        method: "PATCH",
        headers: getAuthHeader({ withJsonBody: true }),
        body: JSON.stringify({ status: "RECUSADA" })
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Erro ao rejeitar solicitação");
      }

      await res.json();
      
      setSolicitacoes((prev) =>
        prev.map((s) =>
          s.id === solicitacaoSelecionada.id
            ? { ...s, status: "RECUSADA" }
            : s
        )
      );
      
      toast.success("Solicitação rejeitada com sucesso!");
      setModo("detalhe");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Não foi possível rejeitar a solicitação");
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <main className="">
      <div className="">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <CircleCheckBig className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Aprovação de Benefício</h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-4 md:p-8 shadow-sm">
          <span className="mb-4 block font-bold">Filtros</span>

          <div className="flex flex-col md:flex-row md:items-end gap-4 w-full">
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-1 md:min-w-[200px]">
              <Label htmlFor="beneficiado" className="px-1">Beneficiado</Label>
              <form className="flex w-full" onSubmit={handleSearch}>
                <Input
                  type="text"
                  placeholder="Pesquise o beneficiado"
                  className="flex-1 rounded-r-none"
                  value={pesquisarBeneficiado}
                  onChange={(e) => setPesquisarBeneficiado(e.target.value)}
                />
                <Button type="submit" className="rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]">
                  <Search className="h-4 w-4 text-[var(--branco)]" />
                </Button>
              </form>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[110px]">
              <Label htmlFor="beneficio" className="px-1">Benefício</Label>
              <Select
                value={beneficioSelecionado}
                onValueChange={setBeneficioSelecionado}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o benefício" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--cinza-200)]">
                  <SelectGroup>
                    <SelectLabel>Benefícios</SelectLabel>
                    <SelectItem value={BENEFICIO_ALL}>Todos</SelectItem>
                    {beneficios.map((beneficio) => (
                      <SelectItem key={beneficio.id} value={beneficio.nome}>
                        {beneficio.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[110px]">
              <Label htmlFor="date" className="px-1">Data</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" id="date" className="w-full justify-between font-normal">
                    {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                    <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-[var(--cinza-200)]" align="start">
                  <div className="p-2">
                    <Calendar
                      mode="single"
                      selected={date}
                      locale={ptBR}
                      captionLayout="dropdown"
                      onSelect={(d) => { setDate(d); setOpen(false); }}
                    />
                    {date && (
                      <div className="mt-2 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>
                          Limpar data
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Spinner />
                <p className="mt-2">Carregando...</p>
              </div>
            ) : solicitacoesFiltradas.length === 0 ? (
              <div className="text-center py-8">Nenhuma solicitação encontrada</div>
            ) : (
              solicitacoesFiltradas.map((solicitacao) => (
                <div key={solicitacao.id} className="bg-[var(--cinza-300)] border border-[var(--verde-900)] rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:gap-2">
                      <span className="font-semibold whitespace-nowrap">Benefício:</span>
                      <p className="break-words">{solicitacao.beneficio.nome}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:gap-2">
                      <span className="font-semibold whitespace-nowrap">Beneficiado:</span>
                      <p className="break-words">{solicitacao.dependente ? solicitacao.dependente.nome : solicitacao.colaborador.nome}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
                    <p className="text-sm text-[var(--cinza-700)]">
                      {format(new Date(solicitacao.dataSolicitacao), "dd/MM/yyyy", { locale: ptBR })}
                    </p>

                    <Dialog>
                      <DialogTrigger
                        asChild
                        className="bg-[var(--verde-900)] text-[var(--branco)] w-full sm:w-auto"
                        onClick={() => abrirModalDetalhe(solicitacao)}
                      >
                        <Button variant="outline">Detalhar</Button>
                      </DialogTrigger>

                      <DialogContent className="w-[95vw] max-w-[560px] max-h-[90vh] overflow-y-auto bg-[var(--cinza-200)]">
                        {solicitacaoSelecionada && modo === "detalhe" ? (
                          <>
                            <DialogHeader>
                              <DialogTitle className="text-xl sm:text-2xl font-bold text-[var(--verde-900)]">Detalhe do benefício</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <span className="font-semibold">Beneficiado:</span>
                                <span className="break-words">{solicitacaoSelecionada.dependente ? solicitacaoSelecionada.dependente.nome : solicitacaoSelecionada.colaborador.nome}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <span className="font-semibold">Benefício:</span>
                                <span className="break-words">{solicitacaoSelecionada.beneficio.nome}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <span className="font-semibold">Descrição:</span>
                                <span className="break-words">{solicitacaoSelecionada.descricao}</span>
                              </div>

                              <div className="mt-4">
                                <span className="font-semibold block mb-2">Documentos:</span>
                                <div className="space-y-2">
                                  {documentos.map((doc) => (
                                    <div
                                      key={`${doc.nomeArquivoUnico}-${doc.dataUpload}`}
                                      className="flex items-center justify-between p-2 border rounded-md bg-[var(--branco)] gap-2"
                                    >
                                      <span className="truncate flex-1 text-sm" title={doc.nomeArquivoOriginal}>
                                        {doc.nomeArquivoOriginal}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => abrirDocumento(doc.nomeArquivoUnico)}
                                        className="flex-shrink-0"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  {documentos.length === 0 && (
                                    <div className="text-sm text-muted-foreground">Nenhum documento anexado ainda.</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                              <Button onClick={() => setModo("aprovar")} className="w-full sm:w-auto gap-2 bg-[var(--verde-900)] hover:bg-[var(--verde-900)]/80 text-[var(--branco)]" variant="secondary">
                                <CircleCheckBig size={18} className="text-[var(--branco)]" />
                                Aprovar
                              </Button>

                              <Button 
                                onClick={rejeitarSolicitacao}
                                disabled={isRejecting}
                                variant="outline" 
                                className="w-full sm:w-auto gap-2 bg-[var(--error)] hover:bg-[var(--error)]/80 text-[var(--branco)]"
                              >
                                {isRejecting ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Rejeitando...
                                  </>
                                ) : (
                                  <>
                                    <X size={18} className="text-[var(--branco)]" />
                                    Rejeitar
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </>
                        ) : (
                          <>
                            <DialogHeader>
                              <DialogTitle className="text-xl sm:text-2xl font-bold text-[var(--verde-900)]">Aprovar solicitação</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <Label>Valor Total</Label>
                                  <Input
                                    inputMode="decimal"
                                    placeholder="Ex.: 540,00"
                                    value={valorTotal}
                                    onChange={HandleValorTotalChange}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">
                                    Valor com Desconto ({solicitacaoSelecionada?.beneficio.percentualDesconto}% off)
                                  </Label>
                                  <Input
                                    inputMode="decimal"
                                    value={valorComDesconto}
                                    disabled
                                    className="bg-[var(--cinza-300)] text-[var(--cinza-800)]"
                                  />
                                </div>
                              </div>
                            </div>

                            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                className="w-full sm:w-auto gap-2 bg-[var(--error)] hover:bg-[var(--error)]/80 text-[var(--branco)]"
                                onClick={() => setModo("detalhe")}
                              >
                                <X size={18} />
                                Cancelar
                              </Button>

                              <Button
                                className="w-full sm:w-auto gap-2 text-[var(--branco)] bg-[var(--verde-900)] hover:bg-[var(--verde-900)]/80"
                                onClick={aprovarSolicitacao}
                                disabled={isAproving}
                              >
                                {isAproving ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Aprovando...
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
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
