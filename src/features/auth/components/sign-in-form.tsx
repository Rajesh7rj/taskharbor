"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle, LogIn } from "lucide-react";

import type { SignInActionState } from "@/features/auth/server/actions";
import { signInAction } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: SignInActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
    >
      {pending ? (
        <LoaderCircle
          className="size-4 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <LogIn className="size-4" aria-hidden="true" />
      )}

      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export function SignInForm() {
  const [state, formAction] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium"
        >
          Email
        </label>

        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email
              ? "email-error"
              : undefined
          }
        />

        {state.fieldErrors?.email?.[0] ? (
          <p
            id="email-error"
            className="text-xs text-destructive"
          >
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium"
        >
          Password
        </label>

        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password
              ? "password-error"
              : undefined
          }
        />

        {state.fieldErrors?.password?.[0] ? (
          <p
            id="password-error"
            className="text-xs text-destructive"
          >
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {state.formError ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.formError}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}