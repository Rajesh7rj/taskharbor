import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskForm } from "@/features/tasks/components/task-form";
import { createTaskAction } from "@/features/tasks/server/actions";
import { getTaskFormAssignees } from "@/features/tasks/server/queries";

import DashboardLoading from "../../loading";

export const metadata: Metadata = {
  title: "New task",
};

export default function NewTaskPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <NewTaskContent />
    </Suspense>
  );
}

async function NewTaskContent() {
  await connection();
  const assignees = await getTaskFormAssignees();

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Create task</CardTitle>
        <CardDescription>
          Add a task and optionally assign it to a team member.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TaskForm
          action={createTaskAction}
          assignees={assignees}
        />
      </CardContent>
    </Card>
  );
}
