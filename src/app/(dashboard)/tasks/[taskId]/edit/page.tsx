import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { updateTaskAction } from "@/features/tasks/server/actions";
import {
  getTaskForEdit,
  getTaskFormAssignees,
} from "@/features/tasks/server/queries";

import DashboardLoading from "../../../loading";

export const metadata: Metadata = {
  title: "Edit task",
};

type EditTaskPageProps = {
  params: Promise<{ taskId: string }>;
};

export default function EditTaskPage({
  params,
}: EditTaskPageProps) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <EditTaskContent params={params} />
    </Suspense>
  );
}

async function EditTaskContent({ params }: EditTaskPageProps) {
  await connection();
  const { taskId } = await params;
  const [task, assignees] = await Promise.all([
    getTaskForEdit(taskId),
    getTaskFormAssignees(),
  ]);

  if (!task) {
    notFound();
  }

  const action = updateTaskAction.bind(null, task.id);

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Edit task</CardTitle>
        <CardDescription>
          Update the task details and assignment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TaskForm
          action={action}
          assignees={assignees}
          task={task}
        />
      </CardContent>
    </Card>
  );
}
