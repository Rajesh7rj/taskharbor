import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  CalendarDays,
  CirclePlus,
  Search,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TaskStatus } from "@/generated/prisma/enums";
import {
  formatTaskDueDate,
  taskPriorityLabels,
  taskPriorityStyles,
  taskStatusLabels,
  taskStatusStyles,
} from "@/features/tasks/presentation";
import { getTasks } from "@/features/tasks/server/queries";
import { cn } from "@/lib/utils";

import DashboardLoading from "../loading";

export const metadata: Metadata = {
  title: "Tasks",
};

type TasksPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: string;
  }>;
};

export default function TasksPage({
  searchParams,
}: TasksPageProps) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <TasksContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TasksContent({
  searchParams,
}: TasksPageProps) {
  await connection();

  const params = await searchParams;

  const rawQuery =
    typeof params.query === "string"
      ? params.query.trim()
      : "";

  const requestedStatus =
    typeof params.status === "string"
      ? params.status
      : undefined;

  const selectedStatus = Object.values(TaskStatus).find(
    (status) => status === requestedStatus,
  );

  const { tasks, totalTaskCount } = await getTasks({
    query: rawQuery,
    status: selectedStatus,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tasks
          </h1>

          <p className="mt-1 text-muted-foreground">
            View, assign, and manage workspace tasks.
          </p>
        </div>

        <Button
          type="button"
          disabled
          title="Available in a later phase"
        >
          <CirclePlus className="size-4" aria-hidden="true" />
          New task
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Task filters</CardTitle>
          <CardDescription>
            Search by task, description, or assignee.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto_auto]"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                name="query"
                defaultValue={rawQuery}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="pl-9"
              />
            </div>

            <div>
              <label htmlFor="status" className="sr-only">
                Filter by status
              </label>

              <select
                id="status"
                name="status"
                defaultValue={selectedStatus ?? "all"}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All statuses</option>

                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {taskStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit">Apply</Button>

            <Link
              href="/tasks"
              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
              )}
            >
              Clear
            </Link>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Showing {tasks.length} of {totalTaskCount} tasks
      </p>

      {tasks.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={taskStatusStyles[task.status]}
                  >
                    {taskStatusLabels[task.status]}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={taskPriorityStyles[task.priority]}
                  >
                    {taskPriorityLabels[task.priority]} priority
                  </Badge>
                </div>

                <CardTitle>{task.title}</CardTitle>

                <CardDescription>
                  {task.description ?? "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <UserRound
                    className="size-4"
                    aria-hidden="true"
                  />
                  {task.assignee?.name ?? "Unassigned"}
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays
                    className="size-4"
                    aria-hidden="true"
                  />
                  {formatTaskDueDate(task.dueDate)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">No tasks found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing or clearing your filters.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
