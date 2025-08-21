import Link from "next/link"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar"
import { BookMinus, CircleCheckBig, CirclePlus, History, Home, Search } from "lucide-react"

const items = [
    {
        title: 'Home',
        url: '#',
        icon: Home,
    },
     {
        title: 'Cadastro',
        url: '#',
        icon: CirclePlus,
    },
     {
        title: 'Agendamento',
        url: '#',
        icon: BookMinus,
    },
     {
        title: 'Aprovação de Benefício',
        url: '#',
        icon: CircleCheckBig,
    },
     {
        title: 'Pesquisar Colaborador',
        url: '#',
        icon: Search,
    },
     {
        title: 'Histórico',
        url: '#',
        icon: History,
    }
]
 
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="group bg-sidebar text-sidebar-foreground [--sidebar-width:230px] [--sidebar-width-icon:60px]">
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
                  <SidebarMenuButton asChild
                    className="gap-2 [&>svg]:h-6 [&>svg]:w-6">
                    <a href={item.url} className="flex items-center gap-2 mb-2">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Link href="/settings" className="flex items-center gap-2">
          <Image src="/" alt="Settings" width={24} height={24} />
          <span>Settings</span>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}