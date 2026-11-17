import Link from "next/link";
import { Anchor, ShieldCheck } from "lucide-react";

import { DashboardNav } from "@/components/layout/dashboard-nav";

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Anchor className="size-4" aria-hidden="true" />
          </span>

          <span>TaskHarbor</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>

        <DashboardNav className="flex-col" />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Demo Administrator</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}