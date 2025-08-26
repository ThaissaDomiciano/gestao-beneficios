import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex">
         <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <main>
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
