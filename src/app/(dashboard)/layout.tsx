import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { getCurrentUser } from "@/features/auth/server/current-user";

type DashboardLayoutProps = {
  children: ReactNode;
};

function SessionLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <LoaderCircle
          className="size-5 animate-spin"
          aria-hidden="true"
        />
        Checking your session...
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <Suspense fallback={<SessionLoading />}>
      <AuthenticatedDashboardLayout>
        {children}
      </AuthenticatedDashboardLayout>
    </Suspense>
  );
}

async function AuthenticatedDashboardLayout({
  children,
}: DashboardLayoutProps) {
  await connection();

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30 md:flex">
      <AppSidebar user={currentUser} />

      <div className="min-w-0 flex-1">
        <DashboardHeader user={currentUser} />

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
