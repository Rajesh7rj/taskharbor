"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      disabled={pending}
      title="Sign out"
      aria-label="Sign out"
    >
      {pending ? (
        <LoaderCircle
          className="size-4 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <LogOut className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
