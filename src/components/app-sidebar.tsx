"use client"

import Link from "next/link"
import Image from "next/image"
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  User2
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"

import {
  CircleCheckBig,
  CirclePlus,
  History,
  Home,
  Search
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "./ui/collapsible"

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu
} from "./ui/dropdown-menu"

import { useRef } from "react"
import { useClickAway } from "react-use"
import { useRouter } from "next/navigation"

const items = [
  { title: "Home", url: "/home", icon: Home },
  {
    title: "Cadastro",
    icon: CirclePlus,
    children: [
      { title: "Cadastro de Médico", url: "/home/cadastro-medico" },
      { title: "Cadastro de Benefício", url: "/home/cadastro-beneficio" },
    ],
  },
  { title: "Agendamento", url: "/home/agendamento", icon: CalendarDays },
  { title: "Aprovação de Benefício", url: "/home/aprovacao-beneficio", icon: CircleCheckBig },
  { title: "Pesquisar Colaborador", url: "/home/pesquisar-colaborador", icon: Search },
  { title: "Histórico", url: "/home/historico", icon: History },
]

function InnerSidebar() {
  const { open, setOpen } = useSidebar()
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useClickAway(ref, () => { if (open) setOpen(false) })

  const handleOpenOnPointerDownCapture: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!open) {
      setOpen(true)
      const actionable = (e.target as HTMLElement)?.closest("a,button,[role='menuitem']")
      if (actionable) e.preventDefault()
    }
  }

 async function handleLogout() {
  const STORAGE_KEY = "gb_token";
  localStorage.removeItem(STORAGE_KEY);
  router.replace("/login");
}

  return (
    <>
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <div ref={ref} className="relative z-50">
        <Sidebar
          variant="floating"
          collapsible="icon"
          onPointerDownCapture={handleOpenOnPointerDownCapture}
           className="group bg-sidebar text-sidebar-foreground
                      [--sidebar-width:230px] [--sidebar-width-icon:60px]
                      [--sidebar-border:transparent]           
                      border-0 ring-0 shadow-none outline-none 

                      [&_[data-sidebar='sidebar']]:border-0  
                      [&_[data-sidebar='sidebar']]:ring-0
                      [&_[data-sidebar='rail']]:border-0      
                      [&_[data-sidebar='content']]:border-0
                      [&_[data-sidebar='footer']]:border-0"
        >
          <SidebarHeader>
            <div className="gap-3 px-2 py-4">
              <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.children ? (
                        <Collapsible className="group/c">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="gap-2 [&>svg]:h-6 [&>svg]:w-6">
                              <item.icon />
                              <span className="truncate">{item.title}</span>
                              <ChevronDown
                                className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/c:rotate-180"
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                            <div className="mt-1 ml-9 flex flex-col gap-2 pb-2">
                              {item.children.map((sub) => (
                                <Link
                                  key={sub.title}
                                  href={sub.url}
                                  className="text-sm opacity-90 hover:opacity-100"
                                >
                                  {sub.title}
                                </Link>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton asChild className="gap-2 [&>svg]:h-6 [&>svg]:w-6">
                          <Link href={item.url}>
                            <item.icon />
                            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="bg-emerald-700">
                      <User2 /> Username
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width] border border-[var(--branco)]"
                  >
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        handleLogout()
                      }}
                    >
                      <span className="text-white">Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  )
}

export function AppSidebar() {
  return <InnerSidebar />
}