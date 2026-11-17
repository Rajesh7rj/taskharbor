import Link from "next/link";
import { Compass } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md space-y-5 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="size-6" aria-hidden="true" />
        </span>

        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Page not found
          </h1>

          <p className="text-muted-foreground">
            The page you requested does not exist or may have been moved.
          </p>
        </div>

        <Link
          href="/dashboard"
          className={cn(buttonVariants())}
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}