"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle, Save } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { taskPriorityLabels } from "@/features/tasks/presentation";
import type { TaskActionState } from "@/features/tasks/server/actions";
import { TaskPriority } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

type TaskFormAction = (
  state: TaskActionState,
  formData: FormData,
) => Promise<TaskActionState>;

type TaskFormProps = {
  action: TaskFormAction;
  assignees: Array<{ id: string; name: string }>;
  task?: {
    title: string;
    description: string | null;
    priority: TaskPriority;
    dueDate: Date | null;
    assigneeId: string | null;
  };
};

const initialState: TaskActionState = {};

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      {pending
        ? "Saving..."
        : editing
          ? "Save changes"
          : "Create task"}
    </Button>
  );
}

export function TaskForm({
  action,
  assignees,
  task,
}: TaskFormProps) {
  const [state, formAction] = useActionState(
    action,
    initialState,
  );
  const dueDate = task?.dueDate
    ? task.dueDate.toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={task?.title}
          maxLength={160}
          required
        />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.title[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={task?.description ?? ""}
          maxLength={2000}
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={task?.priority ?? TaskPriority.MEDIUM}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Object.values(TaskPriority).map((priority) => (
              <option key={priority} value={priority}>
                {taskPriorityLabels[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="assigneeId" className="text-sm font-medium">
            Assignee
          </label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={task?.assigneeId ?? ""}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium">
            Due date
          </label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={dueDate}
          />
        </div>
      </div>

      {state.formError ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.formError}
        </p>
      ) : null}

      <div className="flex gap-3">
        <SubmitButton editing={Boolean(task)} />
        <Link
          href="/tasks"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
