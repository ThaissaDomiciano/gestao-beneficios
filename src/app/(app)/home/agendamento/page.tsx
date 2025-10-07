'use client'

import { Calendar } from "@/components/ui/calendar"
import { CalendarDays } from "lucide-react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { CalendarIcon, X, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export default function Agendamento() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [modo, setModo] = React.useState<"detalhe" | "remarcar">("detalhe");
    const [dataSelecionada, setDataSelecionada] = React.useState<Date | undefined>(new Date());
    const [hora, setHora] = React.useState("13:00");

return (
    <main className="min-h-screen w-screen max-w-none">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
                <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
                        <CalendarDays></CalendarDays>
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
                            className="rounded-md border shadow-sm"
                            captionLayout="dropdown"
                        />
                    </div>
                    <div>
                        <div className="bg-[var(--cinza-300)] border border-[var(--verde-900)] rounded-lg p-4 flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-2">
                                    <span className="font-semibold">Paciente</span>
                                    <p>Luis Felipe</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold">Médico</span>
                                    <p>Alefe Augusto</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <p className="text-sm text-gray-800">12/09/2025&nbsp;&nbsp;13:00</p>
                                <Dialog>
                                    <DialogTrigger asChild className="bg-[var(--verde-900)] text-[var(--branco)]">
                                        <Button variant="outline">Detalhar</Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-[520px] bg-[var(--cinza-200)]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold text-emerald-700">
                                                Detalhe do agendamento
                                            </DialogTitle>
                                            <DialogDescription className="sr-only">
                                                Visualize detalhes ou remarque a data e hora.
                                            </DialogDescription>
                                        </DialogHeader>

                                        {modo === "detalhe" ? (
                                            <>
                                            <div className="space-y-3">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold">Paciente</span>
                                                    <span>Luis Felipe</span>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold">Médico</span>
                                                    <span>Alefe Augusto</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <span className="font-semibold">Data </span>
                                                        {format(new Date(2025, 8, 12), "dd/MM/yyyy", { locale: ptBR })}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">Horário </span>13:00
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
                                                        Cancelar
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Data e Hora</Label>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {/* Data */}
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
                                                                    : "DD/MM/YY"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={dataSelecionada}
                                                                onSelect={setDataSelecionada}
                                                                initialFocus
                                                                locale={ptBR}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>

                                                            {/* Hora */}
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 opacity-60" />
                                                        <Input
                                                            type="time"
                                                            value={hora}
                                                            onChange={(e) => setHora(e.target.value)}
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

                                                <Button className="gap-2 text-[var(--branco)] bg-[var(--verde-900)]">
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
                </div>
            </div>
        </div>
    </div>
</main >
    )

}

