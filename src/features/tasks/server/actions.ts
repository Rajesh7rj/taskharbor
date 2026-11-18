"use server";

import { redirect } from "next/navigation";

import {
  AuthenticationError,
  AuthorizationError,
} from "@/features/auth/server/errors";
import { requireCurrentUser } from "@/features/auth/server/current-user";
import {
  assertCanCreateTask,
  assertCanDeleteTask,
  assertCanUpdateTaskDetails,
  assertCanUpdateTaskStatus,
} from "@/features/auth/server/policies";
import {
  taskDetailsSchema,
  taskIdSchema,
  taskStatusSchema,
  type TaskDetailsInput,
} from "@/features/tasks/schemas/task-schema";
import { revalidateTaskPages } from "@/features/tasks/server/revalidation";
import { prisma } from "@/lib/prisma";

export type TaskActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
};

function readTaskDetails(formData: FormData) {
  return taskDetailsSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    assigneeId: formData.get("assigneeId"),
  });
}

function toTaskData(input: TaskDetailsInput) {
  return {
    title: input.title,
    description: input.description || null,
    priority: input.priority,
    dueDate: input.dueDate
      ? new Date(`${input.dueDate}T12:00:00.000Z`)
      : null,
    assigneeId: input.assigneeId || null,
  };
}

async function assigneeExists(assigneeId: string) {
  if (!assigneeId) {
    return true;
  }

  const user = await prisma.user.findUnique({
    where: { id: assigneeId },
    select: { id: true },
  });

  return Boolean(user);
}

function actionError(error: unknown): TaskActionState | null {
  if (
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError
  ) {
    return { formError: error.message };
  }

  return null;
}

export async function createTaskAction(
  previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  void previousState;

  const validation = readTaskDetails(formData);

  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const currentUser = await requireCurrentUser();
    assertCanCreateTask(currentUser);

    if (!(await assigneeExists(validation.data.assigneeId))) {
      return { formError: "The selected assignee does not exist." };
    }

    await prisma.task.create({
      data: {
        ...toTaskData(validation.data),
        creatorId: currentUser.id,
      },
    });
  } catch (error) {
    const knownError = actionError(error);

    if (knownError) {
      return knownError;
    }

    throw error;
  }

  revalidateTaskPages();
  redirect("/tasks");
}

export async function updateTaskAction(
  taskId: string,
  previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  void previousState;

  const idValidation = taskIdSchema.safeParse(taskId);
  const validation = readTaskDetails(formData);

  if (!idValidation.success) {
    return { formError: "Invalid task." };
  }

  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const currentUser = await requireCurrentUser();
    const task = await prisma.task.findUnique({
      where: { id: idValidation.data },
      select: { creatorId: true, assigneeId: true },
    });

    if (!task) {
      return { formError: "Task not found." };
    }

    assertCanUpdateTaskDetails(currentUser, task);

    if (!(await assigneeExists(validation.data.assigneeId))) {
      return { formError: "The selected assignee does not exist." };
    }

    await prisma.task.update({
      where: { id: idValidation.data },
      data: toTaskData(validation.data),
    });
  } catch (error) {
    const knownError = actionError(error);

    if (knownError) {
      return knownError;
    }

    throw error;
  }

  revalidateTaskPages();
  redirect("/tasks");
}

export async function updateTaskStatusAction(formData: FormData) {
  const validation = taskStatusSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });

  if (!validation.success) {
    throw new Error("Invalid task status update.");
  }

  const currentUser = await requireCurrentUser();
  const task = await prisma.task.findUnique({
    where: { id: validation.data.taskId },
    select: { creatorId: true, assigneeId: true },
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  assertCanUpdateTaskStatus(currentUser, task);

  await prisma.task.update({
    where: { id: validation.data.taskId },
    data: { status: validation.data.status },
  });

  revalidateTaskPages();
}

export async function deleteTaskAction(formData: FormData) {
  const validation = taskIdSchema.safeParse(
    formData.get("taskId"),
  );

  if (!validation.success) {
    throw new Error("Invalid task.");
  }

  const currentUser = await requireCurrentUser();
  const task = await prisma.task.findUnique({
    where: { id: validation.data },
    select: { creatorId: true, assigneeId: true },
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  assertCanDeleteTask(currentUser, task);
  await prisma.task.delete({ where: { id: validation.data } });
  revalidateTaskPages();
}
