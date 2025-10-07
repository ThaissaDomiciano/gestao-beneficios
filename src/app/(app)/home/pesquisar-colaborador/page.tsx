"use client"

import { useState, useEffect } from "react"
import { Search, Eye } from "lucide-react"
import { toast } from "sonner"
import { getAuthHeader } from '@/app/api/lib/authHeader'
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const api = process.env.NEXT_PUBLIC_BACKEND_URL as string;

type Colaborador = {
  matricula: string
  nome: string
  dtNascimento: string
  funcao: string
  genero: string
  cidade: string
}

export default function PesquisarColaborador() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"consultas" | "beneficios">(
    "consultas"
  );
  const [selected, setSelected] = useState<Colaborador | null>(null)

  useEffect(() => {
    buscarColaboradores()
  }, [])

  async function buscarColaboradores() {
    setLoading(true)
    try {
      const res = await fetch(`${api}/colaborador`, {
        method: "GET",
        headers: getAuthHeader()
      })

      if(!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error?.message || "Erro ao carregar colaboradores")
      }

      const data = await res.json()
      setColaboradores(data.data || [])
    } catch (error: any) {
      console.error("Erro ao carregar colaboradores:", error)
      toast.error(error?.message || "Não foi possível carregar os colaboradores")
    } finally {
      setLoading(false)
    }
  }

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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Carregando...
                    </TableCell>
                    </TableRow>
                ): colaboradores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                    Nenhum colaborador encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  colaboradores.map((item) => (
                  <TableRow key={item.matricula}>
                    <TableCell>{item.matricula}</TableCell>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{new Date(item.dtNascimento).toLocaleDateString()}</TableCell>
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
                            <SheetTitle>Histórico do Colaborador</SheetTitle>
                          </SheetHeader>
                          {selected && (
                            <div className="mt-4 space-y-2">
                              <p>
                                <strong>Matrícula:</strong> {selected.matricula}
                              </p>
                              <p>
                                <strong>Nome:</strong> {selected.nome}
                              </p>
                            </div>
                          )}
                           <div className="mt-6 flex gap-4">
                            <button
                              onClick={() => setSelectedTab("consultas")}
                              className={`rounded-md border px-4 py-2 font-medium transition mb-4 ${
                                selectedTab === "consultas"
                                  ? "bg-[var(--verde-800)] text-white border-[var(--verde-800)]"
                                  : "bg-white text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
                              }`}
                            >
                              Consultas
                            </button>

                            <button
                              onClick={() => setSelectedTab("beneficios")}
                              className={`rounded-md border px-4 py-2 font-medium transition mb-4 ${
                                selectedTab === "beneficios"
                                  ? "bg-[var(--verde-800)] text-white border-[var(--verde-800)]"
                                  : "bg-white text-[var(--verde-900)] border-[var(--verde-900)] hover:bg-[var(--cinza-200)]"
                              }`}
                            >
                              Benefícios
                            </button>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                  ))  
              )}
              </TableBody>

              <TableFooter />
            </Table>
          </div>
        </div>
      </div>
    </main>
  )
}
