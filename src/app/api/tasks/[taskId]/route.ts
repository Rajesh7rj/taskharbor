import type { Prisma } from "@/generated/prisma/client";

import { requireCurrentUser } from "@/features/auth/server/current-user";
import {
  assertCanDeleteTask,
  assertCanUpdateTaskDetails,
  assertCanUpdateTaskStatus,
  assertCanViewTask,
} from "@/features/auth/server/policies";
import {
  taskIdSchema,
  taskPatchSchema,
} from "@/features/tasks/schemas/task-schema";
import { revalidateTaskPages } from "@/features/tasks/server/revalidation";
import {
  apiErrorResponse,
  apiNotFound,
  apiValidationError,
} from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

type TaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

async function getValidatedTaskId(context: TaskRouteContext) {
  const { taskId } = await context.params;
  return taskIdSchema.safeParse(taskId);
}

export async function GET(
  _request: Request,
  context: TaskRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const idValidation = await getValidatedTaskId(context);

    if (!idValidation.success) {
      return apiValidationError({ taskId: ["Invalid task ID."] });
    }

    const task = await prisma.task.findUnique({
      where: { id: idValidation.data },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return apiNotFound("Task not found.");
    }

    assertCanViewTask(currentUser, task);
    return Response.json({ task });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  context: TaskRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const idValidation = await getValidatedTaskId(context);

    if (!idValidation.success) {
      return apiValidationError({ taskId: ["Invalid task ID."] });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: idValidation.data },
      select: { creatorId: true, assigneeId: true },
    });

    if (!existingTask) {
      return apiNotFound("Task not found.");
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return apiValidationError(null, "Request body must be valid JSON.");
    }

    const validation = taskPatchSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const { status, ...details } = validation.data;
    const updatesDetails = Object.keys(details).length > 0;

    if (updatesDetails) {
      assertCanUpdateTaskDetails(currentUser, existingTask);
    }

    if (status !== undefined) {
      assertCanUpdateTaskStatus(currentUser, existingTask);
    }

    if (details.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: details.assigneeId },
        select: { id: true },
      });

      if (!assignee) {
        return apiValidationError({
          assigneeId: ["The selected assignee does not exist."],
        });
      }
    }

    const data: Prisma.TaskUncheckedUpdateInput = {};

    if (details.title !== undefined) data.title = details.title;
    if (details.description !== undefined) {
      data.description = details.description || null;
    }
    if (details.priority !== undefined) data.priority = details.priority;
    if (details.assigneeId !== undefined) {
      data.assigneeId = details.assigneeId || null;
    }
    if (details.dueDate !== undefined) {
      data.dueDate = details.dueDate
        ? new Date(`${details.dueDate}T12:00:00.000Z`)
        : null;
    }
    if (status !== undefined) data.status = status;

    const task = await prisma.task.update({
      where: { id: idValidation.data },
      data,
      include: {
        assignee: { select: { id: true, name: true } },
      },
    });

    revalidateTaskPages();
    return Response.json({ task });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: TaskRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const idValidation = await getValidatedTaskId(context);

    if (!idValidation.success) {
      return apiValidationError({ taskId: ["Invalid task ID."] });
    }

    const task = await prisma.task.findUnique({
      where: { id: idValidation.data },
      select: { creatorId: true, assigneeId: true },
    });

    if (!task) {
      return apiNotFound("Task not found.");
    }

    assertCanDeleteTask(currentUser, task);
    await prisma.task.delete({ where: { id: idValidation.data } });
    revalidateTaskPages();

    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
