import type { Metadata } from "next";

import { SignInForm } from "@/features/auth/components/sign-in-form";
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
            Sign in with your TaskHarbor account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <SignInForm />

          {process.env.NODE_ENV === "development" ? (
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                Local demo accounts
              </p>
              <p className="mt-1">
                Admin: admin@taskharbor.dev
              </p>
              <p>Member: aarav@taskharbor.dev</p>
              <p>Password: TaskHarbor123!</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
