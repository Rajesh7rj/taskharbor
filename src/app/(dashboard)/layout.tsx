import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 md:flex">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <DashboardHeader />

        <div className="border-b bg-background p-2 md:hidden">
          <DashboardNav className="grid grid-cols-2" />
        </div>

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}