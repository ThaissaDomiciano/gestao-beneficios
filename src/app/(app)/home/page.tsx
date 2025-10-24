"use client";

import { DashboardKPIs } from "@/types";
import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

const meses = [
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
const anos = [2023, 2024, 2025];

export type DashboardData = {
  consultasPorMes: {
    mes: string;
    quantidade: number;
  }[];
  beneficiosPorTipo: {
    beneficio: string;
    quantidade: number;
  }[];
}


export default function HomePage() {
    const [mes, setMes] = useState("Janeiro");
    const [ano, setAno] = useState("2025");
    const [consultasPorMes, setConsultasPorMes] = useState<{ mes: string; quantidade: number; }[]>([]);
    const [beneficiosPorTipo, setBeneficiosPorTipo] = useState<{ beneficio: string; quantidade: number; }[]>([]);
    const [kpis, setKpis] = useState<DashboardKPIs>({
        solicitacoesPendentes: 0,
        solicitacoesRecusadas: 0,
        solicitacoesPendenteAssinatura: 0,
        consultasPendentes: 0,
        consultasDoMes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        buscarDadosDashboard();
    }, []);

    async function buscarDadosDashboard() {
        try {
            const res = await fetch(`${api}/dashboard/resumo`, {
                headers: getAuthHeader()
            });
        if(!res.ok) {
            throw new Error("Falha ao carregar os dados do dashboard");
        }

        const data = await res.json();
        const consultasFormatadas = (data.data.consultasPorMes || []).map(
            (consulta: any) => ({
                ...consulta,
                mes: format(
                    new Date(2025, (consulta.nroMes ?? 1) - 1, 1), 
                    "MMMM", 
                    { locale: ptBR }
                ).replace(/^\w/, c => c.toUpperCase()) 
            })
        );


        setKpis(data.data.kpis);
        setConsultasPorMes(consultasFormatadas);
        setBeneficiosPorTipo(data.data.solicitacoesPorBeneficio);
        } catch(error) {
            console.error(error);
            toast.error("Não foi possível carregar os dados do dashboard");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen w-screen max-w-none">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
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
                    <div className="mb-6 flex flex-wrap items-center ">
                        <div className="ml-auto flex items-center gap-2">
                            <div>
                                <Select value={mes} onValueChange={setMes}>
                                    <SelectTrigger className="border-[var(--verde-900)] bg-white text-[var(--cinza-700)]">
                                        <SelectValue placeholder="Mês" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {meses.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select value={ano} onValueChange={setAno}>
                                    <SelectTrigger className="border-[var(--verde-900)] bg-white text-[var(--cinza-700)]">
                                        <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {anos.map((a) => (
                                            <SelectItem key={a} value={String(a)}>
                                                {a}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <CardEstatistica
                            titulo="Benefícios Pendentes"
                            valor={String(kpis.solicitacoesPendentes)}
                            Icone={FileText}
                            loading={loading}
                        />
                        <CardEstatistica
                            titulo="Pendente Assinatura"
                            valor={String(kpis.solicitacoesPendenteAssinatura)}
                            Icone={CalendarClock}
                            loading={loading}
                        />
                        <CardEstatistica
                            titulo="Consultas Pendentes"
                            valor={String(kpis.consultasPendentes)}
                            Icone={FileX}
                            loading={loading}
                        />
                        <CardEstatistica
                            titulo="Consultas do Mês"
                            valor={String(kpis.consultasDoMes)}
                            Icone={CalendarCheck}
                            loading={loading}
                        />
                    </div>

                    <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="h-64 w-full rounded-xl border border-[var(--verde-900)] bg-white/60 p-4">
                            <p className="font-semibold">Consultas por mês</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={consultasPorMes}
                                           margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                           >
                                    <defs>
                                        <linearGradient id="corGrafico" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="#047857"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#047857"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="mes" stroke="#374151" />
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
                        </div>

                        <div className="h-64 w-full rounded-xl border border-[var(--verde-900)] bg-white/60 p-4">
                            <p className="font-semibold">Quantidade por tipo de benefício</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={beneficiosPorTipo}
                                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="beneficio" stroke="#374151" />
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
                                        barSize={40}
                                        name="Quantidade"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
