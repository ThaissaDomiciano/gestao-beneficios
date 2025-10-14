'use client'

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getAuthHeader } from '@/app/api/lib/authHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDownIcon, CircleCheckBig, Eye, Search, X } from "lucide-react";
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

type Dependente = { id: string; nome: string; };
type Colaborador = {
  id: string; nome: string; matricula: string; dtNascimento: string;
  funcao: string; genero: string; cidade: string; dependentes: Dependente[];
};
type Beneficio = { id: string; nome: string; descricao: string; percentualDesconto: number; };
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
  tipoPagamento: "DESCONTADO_FOLHA" | "PAGAMENTO_UNICO";
  status: "PENDENTE" | "APROVADO" | "REJEITADO";
};
type Documento = {
  arquivoUrl: string;
  nomeArquivoOriginal: string;
  tamanho: number;
  dataUpload: string;
  contentType: string;
  tipoDocumento?: string;
  dataAssinatura?: string | null;
};

export default function AprovacaoBeneficio() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [modo, setModo] = useState<"detalhe" | "aprovar">("detalhe");
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  // estados do formulário de aprovação
  const [valorTotal, setValorTotal] = useState<string>("");
  const [desconto, setDesconto] = useState<string>("");

  useEffect(() => { buscarSolicitacoes(); }, []);

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

  async function abrirDocumento(nomeArquivo: string) {
    try {
      const res = await fetch(`${api}/documentos/${nomeArquivo}/url-acesso`, {
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error("Erro ao gerar URL do documento");
      const data = await res.json();
      const url: string = data.data ?? data.url; // API retorna em `data`
      if (!url) throw new Error("Resposta sem URL");
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível abrir o documento");
    }
  }

  function abrirModalDetalhe(s: Solicitacao) {
    setSolicitacaoSelecionada(s);
    setModo("detalhe");
    // zera form de aprovação e carrega docs atuais
    setValorTotal((s.valorTotal ?? 0).toString());
    setDesconto((s.desconto ?? 0).toString());
    buscarDocumentos(s.id, s.colaborador.id);
  }

  async function aprovarSolicitacao() {
    if (!solicitacaoSelecionada) return;

    // parse simples número (ponto ou vírgula)
    const toNumber = (v: string) =>
      Number(String(v).replace(/\./g, "").replace(",", ".")) || 0;

    const payload = {
      // se o backend aceitar somente os campos alteráveis, envie só eles;
      // mantendo campos essenciais conforme teu exemplo:
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

      const data = await res.json();

      // atualiza a lista local (status e valores)
      setSolicitacoes((prev) =>
        prev.map((s) =>
          s.id === solicitacaoSelecionada.id
            ? {
                ...s,
                status: "APROVADO",
                valorTotal: payload.valorTotal,
                desconto: payload.desconto
              }
            : s
        )
      );

      toast.success("Solicitação aprovada com sucesso!");
      // volta para detalhe e recarrega os documentos gerados
      setModo("detalhe");
      await buscarDocumentos(solicitacaoSelecionada.id, solicitacaoSelecionada.colaborador.id);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível aprovar a solicitação");
    }
  }

  return (
    <main className="min-h-screen w-screen max-w-none">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <CircleCheckBig className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Aprovação de Benefício</h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-8 shadow-sm">
          <span className="mb-4 block font-bold">Filtros</span>

          <div className="flex items-center gap-2 w-full max-w-4xl">
            <div className="flex flex-col gap-3">
              <Label htmlFor="beneficiado" className="px-1">Beneficiado</Label>
              <form className="flex flex-1 min-w-0">
                <Input type="text" placeholder="Pesquise o beneficiado" className="flex-1 min-w-0 rounded-r-none" />
                <Button type="submit" className="flex-none rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]">
                  <Search className="h-4 w-4 text-[var(--branco)]" />
                </Button>
              </form>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="beneficio" className="px-1">Benefício</Label>
              <Select>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Selecione o benefício" /></SelectTrigger>
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
                    onSelect={(d) => { setDate(d); setOpen(false); }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center">Carregando solicitações...</div>
            ) : solicitacoes.length === 0 ? (
              <div className="text-center">Nenhuma solicitação encontrada</div>
            ) : (
              solicitacoes.map((solicitacao) => (
                <div key={solicitacao.id} className="bg-[var(--cinza-300)] border border-[var(--verde-900)] rounded-lg p-4 flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <span className="font-semibold">Benefício:</span>
                      <p>{solicitacao.beneficio.nome}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">Beneficiado:</span>
                      <p>{solicitacao.dependente ? solicitacao.dependente.nome : solicitacao.colaborador.nome}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-gray-800">
                      {format(new Date(solicitacao.dataSolicitacao), "dd/MM/yyyy", { locale: ptBR })}
                    </p>

                    <Dialog>
                      <DialogTrigger
                        asChild
                        className="bg-[var(--verde-900)] text-[var(--branco)]"
                        onClick={() => abrirModalDetalhe(solicitacao)}
                      >
                        <Button variant="outline">Detalhar</Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[560px] bg-[var(--cinza-200)]">
                        {solicitacaoSelecionada && modo === "detalhe" ? (
                          <>
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-emerald-700">Detalhe do benefício</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-3">
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold">Beneficiado:</span>
                                <span>{solicitacaoSelecionada.dependente ? solicitacaoSelecionada.dependente.nome : solicitacaoSelecionada.colaborador.nome}</span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold">Benefício:</span>
                                <span>{solicitacaoSelecionada.beneficio.nome}</span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold">Descrição:</span>
                                <span>{solicitacaoSelecionada.descricao}</span>
                              </div>

                              <div className="mt-4">
                                <span className="font-semibold block mb-2">Documentos:</span>
                                <div className="space-y-2">
                                  {documentos.map((doc) => (
                                    <div key={doc.arquivoUrl} className="flex items-center justify-between p-2 border rounded-md bg-[var(--branco)]">
                                      <span className="truncate flex-1" title={doc.nomeArquivoOriginal}>{doc.nomeArquivoOriginal}</span>
                                      <Button variant="ghost" size="sm" onClick={() => abrirDocumento(doc.arquivoUrl)} className="ml-2">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  {documentos.length === 0 && (
                                    <div className="text-sm text-muted-foreground">Nenhum documento gerado ainda.</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <DialogFooter className="mt-6 text-[var(--branco)]">
                              <Button onClick={() => setModo("aprovar")} className="gap-2 bg-[var(--verde-900)]" variant="secondary">
                                <CircleCheckBig size={18} className="text-[var(--branco)]" />
                                Aprovar
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
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-emerald-700">Aprovar solicitação</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <Label>Valor Total</Label>
                                  <Input
                                    inputMode="decimal"
                                    placeholder="Ex.: 540,00"
                                    value={valorTotal}
                                    onChange={(e) => setValorTotal(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Valor com Desconto</Label>
                                  <Input
                                    inputMode="decimal"
                                    placeholder="Ex.: 20,00"
                                    value={desconto}
                                    onChange={(e) => setDesconto(e.target.value)}
                                  />
                                </div>
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
                                className="gap-2 text-[var(--branco)] bg-[var(--verde-900)]"
                                onClick={aprovarSolicitacao}
                              >
                                <Check size={18} />
                                Confirmar
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
