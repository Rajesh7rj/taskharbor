"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function DashboardError({
  error,
  reset,
}: DashboardErrorProps) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md space-y-5 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert className="size-6" aria-hidden="true" />
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>

          <p className="text-sm text-muted-foreground">
            We could not load this page. You can try again or return to the
            dashboard.
          </p>

          {error.digest ? (
            <p className="text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            Try again
          </Button>

          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}