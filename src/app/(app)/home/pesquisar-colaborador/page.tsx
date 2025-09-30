"use client"

import { useState } from "react"
import { Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type Colaborador = {
  matricula: string
  nome: string
  dataNascimento: string
  funcao: string
  genero: string
  cidade: string
}

const dados: Colaborador[] = [
  {
    matricula: "001",
    nome: "Thaissa",
    dataNascimento: "12/06/2004",
    funcao: "Aprendiz",
    genero: "Feminino",
    cidade: "SJB",
  },
]

export default function PesquisarColaborador() {
  const [selected, setSelected] = useState<Colaborador | null>(null)

  return (
    <main className="min-h-screen w-screen max-w-none">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
              <Search className="h-6 w-6 text-[var(--cinza-700)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">
              Pesquisa de Colaborador
            </h1>
          </div>
        </div>

        <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-12 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3">
            <Label htmlFor="colaborador" className="px-1">
              Colaborador
            </Label>
            <form className="flex w-full max-w-sm items-center">
              <Input
                id="colaborador"
                type="text"
                placeholder="Pesquise o colaborador"
                className="rounded-r-none"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-[var(--verde-800)] hover:bg-[var(--verde-900)]"
              >
                <Search className="h-4 w-4 text-[var(--branco)]" />
              </Button>
            </form>
          </div>

          <div className="mt-4 w-full overflow-y-hidden sm:overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-[var(--verde-800)] text-[var(--branco)]">
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data Nascimento</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Gênero</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="text-center">Ação</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {dados.map((item) => (
                  <TableRow key={item.matricula}>
                    <TableCell>{item.matricula}</TableCell>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{item.dataNascimento}</TableCell>
                    <TableCell>{item.funcao}</TableCell>
                    <TableCell>{item.genero}</TableCell>
                    <TableCell>{item.cidade}</TableCell>
                    <TableCell className="text-center">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelected(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-[var(--cinza-100)] p-4">
                          <SheetHeader>
                            <SheetTitle>Detalhes do Colaborador</SheetTitle>
                            <SheetDescription>
                              Informações completas
                            </SheetDescription>
                          </SheetHeader>
                          {selected && (
                            <div className="mt-4 space-y-2">
                              <p>
                                <strong>Matrícula:</strong> {selected.matricula}
                              </p>
                              <p>
                                <strong>Nome:</strong> {selected.nome}
                              </p>
                              <p>
                                <strong>Data Nascimento:</strong>{" "}
                                {selected.dataNascimento}
                              </p>
                              <p>
                                <strong>Função:</strong> {selected.funcao}
                              </p>
                              <p>
                                <strong>Gênero:</strong> {selected.genero}
                              </p>
                              <p>
                                <strong>Cidade:</strong> {selected.cidade}
                              </p>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter />
            </Table>
          </div>
        </div>
      </div>
    </main>
  )
}
