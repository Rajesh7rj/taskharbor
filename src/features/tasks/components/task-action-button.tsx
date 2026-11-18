"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type TaskActionButtonProps = {
  label: string;
  pendingLabel: string;
  variant?: "default" | "outline" | "destructive";
};

export function TaskActionButton({
  label,
  pendingLabel,
  variant = "default",
}: TaskActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="sm"
      variant={variant}
      disabled={pending}
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}
