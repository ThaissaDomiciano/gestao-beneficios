"use client";

import { DashboardKPIs } from "@/types";
import { useEffect, useState, useMemo } from "react";
import { getAuthHeader } from "@/app/api/lib/authHeader";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarCheck,
  CalendarClock,
  FileText,
  FileX,
  Home,
} from "lucide-react";

import CardEstatistica from "@/components/CardEstatistica";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

function SkeletonArea() {
  return (
    <div className="h-full w-full animate-pulse">
      <div className="h-full w-full rounded-md bg-gradient-to-b from-gray-200/70 to-gray-100/40 relative overflow-hidden">
        <div className="absolute inset-6 flex flex-col justify-end gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-px w-full bg-gray-300/60" />
          ))}
          <div className="h-24 w-full bg-gray-300/70 rounded-t-lg" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBars() {
  return (
    <div className="h-full w-full animate-pulse">
      <div className="h-full w-full rounded-md bg-gradient-to-b from-gray-200/70 to-gray-100/40 relative overflow-hidden">
        <div className="absolute inset-6 flex items-end gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-300/70 rounded-t"
              style={{ height: `${20 + ((i * 13) % 65)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const MESES_PT: string[] = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function HomePage() {
  const [mes, setMes] = useState<"todos" | string>("todos");
  const [ano, setAno] = useState<"todos" | string>("todos");

  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);
  const [anosDisponiveis, setAnosDisponiveis] = useState<string[]>([]);

  const [consultasPorMesRaw, setConsultasPorMesRaw] = useState<
    { mes: string; quantidade: number; nroMes?: number; ano?: string }[]
  >([]);
  const [beneficiosPorTipo, setBeneficiosPorTipo] = useState<
    { beneficio: string; quantidade: number }[]
  >([]);

  const [kpis, setKpis] = useState<DashboardKPIs>({
    solicitacoesPendentes: 0,
    solicitacoesRecusadas: 0,
    solicitacoesPendenteAssinatura: 0,
    consultasPendentes: 0,
    consultasDoMes: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    buscarDadosDashboard(mes, ano);
  }, [mes, ano]);

  async function buscarDadosDashboard(mesAtual?: string, anoAtual?: string) {
    try {
      const mesNumero =
        mesAtual && mesAtual !== "todos"
          ? MESES_PT.indexOf(mesAtual) + 1
          : undefined;

      const queryParams = new URLSearchParams();
      if (mesNumero) queryParams.append("mes", String(mesNumero));
      if (anoAtual && anoAtual !== "todos") queryParams.append("ano", anoAtual);

      const url = `${api}/dashboard/resumo${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const res = await fetch(url, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Falha ao carregar os dados do dashboard");

      const data = await res.json();

      const consultasFormatadas: {
        quantidade: number;
        nroMes?: number;
        ano: string;
        mes: string;
      }[] = (data?.data?.consultasPorMes || []).map((consulta: any) => {
        const anoItem = String(consulta.ano ?? new Date().getFullYear());
        const nroMes = consulta.nroMes ?? 1;
        const nomeMes = format(new Date(Number(anoItem), nroMes - 1, 1), "MMMM", {
          locale: ptBR,
        }).replace(/^\w/u, (c) => c.toUpperCase());
        return {
          quantidade: consulta.quantidade,
          nroMes,
          ano: anoItem,
          mes: nomeMes,
        };
      });

      const mesesUnicos: string[] = Array.from(
        new Set(consultasFormatadas.map((c: { mes: string }) => c.mes))
      ).sort((a, b) => MESES_PT.indexOf(a) - MESES_PT.indexOf(b));

      const anosUnicos: string[] = Array.from(
        new Set(consultasFormatadas.map((c: { ano: string }) => c.ano))
      ).sort((a, b) => Number(b) - Number(a));

      setMesesDisponiveis(mesesUnicos);
      setAnosDisponiveis(anosUnicos);
      setKpis(data.data.kpis);
      setConsultasPorMesRaw(consultasFormatadas);
      setBeneficiosPorTipo(data.data.solicitacoesPorBeneficio || []);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar os dados do dashboard");
    } finally {
      setLoading(false);
    }
  }

  const consultasPorMes = useMemo(() => {
    const soma = new Map<string, number>();
    consultasPorMesRaw.forEach((item) => {
      const v = soma.get(item.mes) ?? 0;
      soma.set(item.mes, v + (item.quantidade ?? 0));
    });
    return MESES_PT.map((mesNome) => ({
      mes: mesNome,
      quantidade: soma.get(mesNome) ?? 0,
    }));
  }, [consultasPorMesRaw]);

 const renderValor = (valor: number) => {
  if (loading) {
    return <Spinner className="h-5 w-5" />;
  }
  return String(valor);
};

  return (
    <main>
      <div>
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <Home className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">
              Home
            </h1>
          </div>
        </header>

        <section className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-4 md:p-8 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center">
            <div className="ml-auto flex items-center gap-2">
              <Select
                value={mes}
                onValueChange={(value) => {
                  setMes(value);
                  setLoading(true);
                }}
              >
                <SelectTrigger className="border-[var(--verde-900)] bg-[var(--cinza-200)] text-[var(--cinza-700)]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--cinza-200)]">
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {mesesDisponiveis.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={ano}
                onValueChange={(value) => {
                  setAno(value);
                  setLoading(true);
                }}
              >
                <SelectTrigger className="border-[var(--verde-900)] bg-[var(--cinza-200)] text-[var(--cinza-700)]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--cinza-200)]">
                  <SelectItem value="todos">Todos os anos</SelectItem>
                  {anosDisponiveis.map((a) => (
                    <SelectItem key={a} value={String(a)}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <CardEstatistica
        titulo="Benefícios Pendentes"
        valor={renderValor(kpis.solicitacoesPendentes)}
        Icone={FileText}
        loading={loading}
      />
      <CardEstatistica
        titulo="Documentos Cancelados"
        valor={renderValor(kpis.solicitacoesRecusadas)}
        Icone={FileX}
        loading={loading}
      />
      <CardEstatistica
        titulo="Pendente Assinatura"
        valor={renderValor(kpis.solicitacoesPendenteAssinatura)}
        Icone={CalendarClock}
        loading={loading}
      />
      <CardEstatistica
        titulo="Consultas do Mês"
        valor={renderValor(kpis.consultasDoMes)}
        Icone={CalendarCheck}
        loading={loading}
      />
    </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="h-80 w-full rounded-xl border border-[var(--verde-900)] bg-white/60 p-4 flex flex-col">
              <p className="font-semibold">Consultas por mês</p>
              <div className="flex-1">
                {loading ? (
                  <SkeletonArea />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={consultasPorMes}
                      margin={{ top: 10, right: 50, left: 40, bottom: 30 }}
                    >
                      <defs>
                        <linearGradient id="corGrafico" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#047857" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#047857" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="mes"
                        stroke="#374151"
                        interval={0}
                        minTickGap={0}
                        tickMargin={10}
                        height={30}
                        tick={{ fontSize: 13 }}
                        tickFormatter={(mesCheio) => mesCheio.substring(0, 3)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.5rem",
                          border: "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: 500 }}
                        itemStyle={{ color: "#065F46" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="quantidade"
                        stroke="#047857"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#corGrafico)"
                        name="Consultas"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="h-80 w-full rounded-xl border border-[var(--verde-900)] bg-white/60 p-4 flex flex-col">
              <p className="font-semibold">Quantidade por tipo de benefício</p>
              <div className="flex-1">
                {loading ? (
                  <SkeletonBars />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={beneficiosPorTipo}
                      margin={{ top: 10, right: 30, left: 20, bottom: 45 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="beneficio"
                        stroke="#374151"
                        interval={0}
                        tick={{ fontSize: 14 }}
                        tickFormatter={(txt: string) => {
                          const limit = 8;
                          if (!txt) return "";
                          if (txt.length <= limit) return txt;
                          return txt.substring(0, limit) + "...";
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.5rem",
                          border: "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: 500 }}
                        itemStyle={{ color: "#065F46" }}
                      />
                      <Bar
                        dataKey="quantidade"
                        fill="#047857"
                        radius={[6, 6, 0, 0]}
                        barSize={30}
                        name="Quantidade"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
