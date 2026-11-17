import type { Metadata } from "next";
import Link from "next/link";
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
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tasks",
};

type TaskStatus = "To do" | "In progress" | "Completed";
type TaskPriority = "Low" | "Medium" | "High";

type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
};

type TasksPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: string;
  }>;
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Prepare the product requirements",
    description: "Document the first version of the TaskHarbor requirements.",
    status: "In progress",
    priority: "High",
    assignee: "Aarav Sharma",
    dueDate: "Nov 20",
  },
  {
    id: 2,
    title: "Review dashboard wireframes",
    description: "Review desktop and mobile dashboard layouts.",
    status: "To do",
    priority: "Medium",
    assignee: "Maya Patel",
    dueDate: "Nov 21",
  },
  {
    id: 3,
    title: "Configure the CI workflow",
    description: "Run linting, type checking, and production builds.",
    status: "Completed",
    priority: "High",
    assignee: "Rajesh Janyani",
    dueDate: "Nov 18",
  },
  {
    id: 4,
    title: "Create the database model",
    description: "Define the initial users and tasks database tables.",
    status: "To do",
    priority: "High",
    assignee: "Rajesh Janyani",
    dueDate: "Nov 24",
  },
  {
    id: 5,
    title: "Write onboarding documentation",
    description: "Explain how a new developer can run the application.",
    status: "In progress",
    priority: "Low",
    assignee: "Maya Patel",
    dueDate: "Nov 26",
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

const priorityStyles: Record<TaskPriority, string> = {
  Low: "border-transparent bg-slate-500/15 text-slate-700 dark:text-slate-300",
  Medium:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  High: "border-transparent bg-red-500/15 text-red-700 dark:text-red-300",
};

export default async function TasksPage({
  searchParams,
}: TasksPageProps) {
  const params = await searchParams;

  const rawQuery = typeof params.query === "string" ? params.query.trim() : "";
  const normalizedQuery = rawQuery.toLowerCase();

  const allowedStatuses = [
    "all",
    "To do",
    "In progress",
    "Completed",
  ] as const;

  const requestedStatus =
    typeof params.status === "string" ? params.status : "all";

  const selectedStatus = allowedStatuses.includes(
    requestedStatus as (typeof allowedStatuses)[number],
  )
    ? requestedStatus
    : "all";

  const filteredTasks = tasks.filter((task) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.description.toLowerCase().includes(normalizedQuery) ||
      task.assignee.toLowerCase().includes(normalizedQuery);

    const matchesStatus =
      selectedStatus === "all" || task.status === selectedStatus;

    return matchesQuery && matchesStatus;
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

        <Button type="button" disabled title="Available in a later phase">
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
                defaultValue={selectedStatus}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All statuses</option>
                <option value="To do">To do</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <Button type="submit">Apply</Button>

            <Link
              href="/tasks"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Clear
            </Link>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={statusStyles[task.status]}
                  >
                    {task.status}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={priorityStyles[task.priority]}
                  >
                    {task.priority} priority
                  </Badge>
                </div>

                <CardTitle>{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <UserRound className="size-4" aria-hidden="true" />
                  {task.assignee}
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Due {task.dueDate}
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