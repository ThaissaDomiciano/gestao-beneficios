"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const STORAGE_KEY = "gb_token";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      router.replace('/login');
      return;
    }
    setAllowed(true);
  }, [router, pathname]);

  if (!allowed) return null;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen relative w-screen mb-6">
        <AppSidebar />
        <main className="max-w-[90vw] mx-auto pl-[52px] lg:pl-[78px] mt-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
