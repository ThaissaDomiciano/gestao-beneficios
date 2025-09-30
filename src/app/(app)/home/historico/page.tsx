"use client";
import { useState } from "react";
import { ChevronDownIcon, History, Search } from "lucide-react";
import { Table, TableBody, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function Historico() {
  const [selectedTab, setSelectedTab] = useState<"agendamento" | "beneficio">(
    "agendamento"
  );
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  return (
    <main className="min-h-screen w-screen max-w-none">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <History className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">
              Histórico
            </h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-8 shadow-sm">
             {/* Botões de Tabs */}
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
                                    <SelectGroup>
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

             {/* Conteúdo dinâmico */}
        <div className="mt-6 rounded-lg p-6">
          {selectedTab === "agendamento" && (
             <div className="mt-4 w-full overflow-y-hidden sm:overflow-x-auto">
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
              
              </TableBody>  

              <TableFooter />
            </Table>
          </div>
          )}

          {selectedTab === "beneficio" && (
             <div className="mt-4 w-full overflow-y-hidden sm:overflow-x-auto">
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
              
              </TableBody>  

              <TableFooter />
            </Table>
          </div>
          )}
        </div>
        </div>

       
       
      </div>
    </main>
  );
}
