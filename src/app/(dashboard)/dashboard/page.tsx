import type { Metadata } from "next";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

type TaskStatus = "To do" | "In progress" | "Completed";

type Statistic = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

type RecentTask = {
  id: number;
  title: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
};

const statistics: Statistic[] = [
  {
    label: "Total tasks",
    value: 12,
    description: "Across the workspace",
    icon: ListTodo,
  },
  {
    label: "Completed",
    value: 5,
    description: "42% completion rate",
    icon: CheckCircle2,
  },
  {
    label: "In progress",
    value: 4,
    description: "Currently being worked on",
    icon: Clock3,
  },
  {
    label: "Overdue",
    value: 2,
    description: "Require attention",
    icon: CircleAlert,
  },
];

const recentTasks: RecentTask[] = [
  {
    id: 1,
    title: "Prepare the product requirements",
    assignee: "Aarav Sharma",
    status: "In progress",
    dueDate: "Nov 20",
  },
  {
    id: 2,
    title: "Review dashboard wireframes",
    assignee: "Maya Patel",
    status: "To do",
    dueDate: "Nov 21",
  },
  {
    id: 3,
    title: "Configure the CI workflow",
    assignee: "Rajesh Janyani",
    status: "Completed",
    dueDate: "Nov 18",
  },
];

const statusStyles: Record<TaskStatus, string> = {
  "To do":
    "border-transparent bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  "In progress":
    "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-300",
  Completed:
    "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-muted-foreground">
          Monitor task progress and recent activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => {
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
            The latest tasks in your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="divide-y">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{task.title}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Assigned to {task.assignee}
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                <Badge
                  variant="outline"
                  className={statusStyles[task.status]}
                >
                  {task.status}
                </Badge>

                <span className="text-xs text-muted-foreground">
                  Due {task.dueDate}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}