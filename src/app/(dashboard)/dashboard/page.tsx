import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

import {
  formatTaskDueDate,
  taskStatusLabels,
  taskStatusStyles,
} from "@/features/tasks/presentation";
import { getDashboardData } from "@/features/tasks/server/queries";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DashboardLoading from "../loading";

export const metadata: Metadata = {
  title: "Dashboard",
};

type Statistic = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};


export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await connection();

  const { statistics, recentTasks, scope } =
    await getDashboardData();

  const completionRate =
    statistics.total > 0
      ? Math.round((statistics.completed / statistics.total) * 100)
      : 0;

  const statisticCards: Statistic[] = [
    {
      label: "Total tasks",
      value: statistics.total,
      description:
        scope === "workspace"
          ? "Across the workspace"
          : "Assigned to you",
      icon: ListTodo,
    },
    {
      label: "Completed",
      value: statistics.completed,
      description: `${completionRate}% completion rate`,
      icon: CheckCircle2,
    },
    {
      label: "In progress",
      value: statistics.inProgress,
      description: "Currently being worked on",
      icon: Clock3,
    },
    {
      label: "Overdue",
      value: statistics.overdue,
      description: "Require attention",
      icon: CircleAlert,
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-muted-foreground">
          {scope === "workspace"
            ? "Monitor workspace task progress and recent activity."
            : "Monitor your assigned tasks and recent activity."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statisticCards.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <Card key={statistic.label}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {statistic.label}
                </CardTitle>

                <CardAction>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                </CardAction>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {statistic.value}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {statistic.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Recent tasks</CardTitle>
          <CardDescription>
            {scope === "workspace"
              ? "The latest tasks in your workspace."
              : "The latest tasks assigned to you."}
          </CardDescription>
        </CardHeader>

        <CardContent className="divide-y">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{task.title}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Assigned to {task.assignee?.name ?? "Unassigned"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                  <Badge
                    variant="outline"
                    className={taskStatusStyles[task.status]}
                  >
                    {taskStatusLabels[task.status]}
                  </Badge>

                  <span className="text-xs text-muted-foreground">
                    {formatTaskDueDate(task.dueDate)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No tasks have been created yet.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
