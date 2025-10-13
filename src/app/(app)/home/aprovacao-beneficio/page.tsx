'use client'

import { useState } from "react";
import { cn } from "@/lib/utils";
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
    PopoverTrigger,
} from "@/components/ui/popover";
import { 
    CalendarIcon, 
    Check, 
    ChevronDownIcon, 
    CircleCheckBig, 
    Search, 
    X 
} from "lucide-react";
import { 
    Dialog, 
    DialogClose, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";

export default function AprovacaoBeneficio() {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [modo, setModo] = useState<"detalhe" | "remarcar">("detalhe")
    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined)

    return (
        <main className="min-h-screen w-screen max-w-none">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
                            <CircleCheckBig className="h-6 w-6 text-[var(--cinza-700)]" />
                        </div>
                        <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">
                            Aprovação de Benefício
                        </h1>
                    </div>
                </div>
                <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-8 shadow-sm">
                    <span className="mb-4 block font-bold">Filtros</span>
                    <div className="flex items-center gap-2 w-full max-w-4xl">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="beneficiado" className="px-1">
                                Beneficiado
                            </Label>
                            <form className="flex flex-1 min-w-0">
                                <Input
                                    type="text"
                                    placeholder="Pesquise o beneficiado"
                                    className="flex-1 min-w-0 rounded-r-none"
                                />
                                <Button
                                    type="submit"
                                    className="flex-none rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]"
                                >
                                    <Search className="h-4 w-4 text-[var(--branco)]" />
                                </Button>
                            </form>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="beneficio" className="px-1">
                                Benefício
                            </Label>
                            <Select>
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Selecione o benefício" />
                                </SelectTrigger>
                                <SelectContent className="w-[220px] bg-[var(--cinza-200)]">
                                    <SelectGroup >
                                        <SelectLabel>Benefícios</SelectLabel>
                                        <SelectItem value="beneficio1">Dentista</SelectItem>
                                        <SelectItem value="beneficio2">Óculos</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="date" className="px-1">
                                Data
                            </Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date"
                                        className="w-[250px] justify-between font-normal"
                                    >
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
                                            setDate(d)
                                            setOpen(false)
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="bg-[var(--cinza-300)] border border-[var(--verde-900)] rounded-lg p-4 flex justify-between items-center mt-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex gap-2">
                                <span className="font-semibold">Nome do benefíc io</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold">Beneficiado</span>
                                <p>Kaiky</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <p className="text-sm text-gray-800">12/09/2025</p>
                            <Dialog>
                                <DialogTrigger asChild className="bg-[var(--verde-900)] text-[var(--branco)]">
                                    <Button variant="outline">Detalhar</Button>
                                </DialogTrigger>

                                <DialogContent className="sm:max-w-[520px] bg-[var(--cinza-200)]">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-emerald-700">
                                            Detalhe do benefício
                                        </DialogTitle>
                                        <DialogDescription className="sr-only">
                                            Visualize detalhes ou remarque a data e hora.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {modo === "detalhe" ? (
                                        <>
                                            <div className="space-y-3">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold">Beneficiado</span>
                                                    <span>Nome Beneficiado</span>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold">Descrição</span>
                                                    <span>Rorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</span>
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
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "justify-start text-left font-normal",
                                                                    !dataSelecionada && "text-muted-foreground"
                                                                )}
                                                            >
                                                            </Button>
                                                        </PopoverTrigger>
                                                    </Popover>
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
        </main>
    )
}
