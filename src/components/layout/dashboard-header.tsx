import Link from "next/link";
import { Anchor } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold md:hidden"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Anchor className="size-4" aria-hidden="true" />
            </span>

            <span>TaskHarbor</span>
          </Link>

          <div className="hidden md:block">
            <p className="text-sm font-medium">Task workspace</p>
            <p className="text-xs text-muted-foreground">
              Organize and monitor your team&apos;s work
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">Demo Administrator</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>

          <div
            className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            aria-label="Demo Administrator"
          >
            DA
          </div>
        </div>
      </div>
    </header>
  );
}
