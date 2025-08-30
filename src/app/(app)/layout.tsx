import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({children}: {children: React.ReactNode}) {
    return (
        <SidebarProvider>
        <div className='min-h-screen flex'>
            <AppSidebar />
            <main className='flex-1- p-6'>{children}</main>
        </div>
        </SidebarProvider>
    )
}