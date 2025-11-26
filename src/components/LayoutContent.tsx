"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Suspense } from "react";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show sidebar on auth pages, invite acceptance, onboarding, or landing page
  const isAuthPage = 
    pathname === "/" ||
    pathname === "/login" || 
    pathname === "/register" || 
    pathname.startsWith("/accept-invite/") ||
    pathname === "/onboarding";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </Suspense>
  );
}

