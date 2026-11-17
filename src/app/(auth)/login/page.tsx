import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome to TaskHarbor</CardTitle>
          <CardDescription>
            Authentication will be connected in a later phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link
            href="/dashboard"
            className={buttonVariants({ className: "w-full" })}
          >
            Open demo dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}