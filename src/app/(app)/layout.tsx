import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const COOKIE = "gb_token"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value

  if (!token) {
    redirect("/login")
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen relative">
        <AppSidebar />
        <main className="p-6">{children}</main>
      </div>
    </SidebarProvider>
  )
}