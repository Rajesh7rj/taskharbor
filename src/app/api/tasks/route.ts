import { requireCurrentUser } from "@/features/auth/server/current-user";
import { assertCanCreateTask } from "@/features/auth/server/policies";
import { taskDetailsSchema } from "@/features/tasks/schemas/task-schema";
import { revalidateTaskPages } from "@/features/tasks/server/revalidation";
import { getTasks } from "@/features/tasks/server/queries";
import { TaskStatus } from "@/generated/prisma/enums";
import {
  apiErrorResponse,
  apiValidationError,
} from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") ?? undefined;
    const rawStatus = url.searchParams.get("status");
    const status = rawStatus
      ? Object.values(TaskStatus).find(
          (value) => value === rawStatus,
        )
      : undefined;

    if (rawStatus && !status) {
      return apiValidationError(
        { status: ["Select a valid task status."] },
      );
    }

    const result = await getTasks({ query, status });
    return Response.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireCurrentUser();
    assertCanCreateTask(currentUser);

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return apiValidationError(null, "Request body must be valid JSON.");
    }

    const rawBody =
      typeof body === "object" && body !== null
        ? body
        : {};
    const validation = taskDetailsSchema.safeParse({
      description: "",
      dueDate: "",
      assigneeId: "",
      ...rawBody,
    });

    if (!validation.success) {
      return apiValidationError(
        validation.error.flatten().fieldErrors,
      );
    }

    if (validation.data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: validation.data.assigneeId },
        select: { id: true },
      });

      if (!assignee) {
        return apiValidationError({
          assigneeId: ["The selected assignee does not exist."],
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: validation.data.title,
        description: validation.data.description || null,
        priority: validation.data.priority,
        dueDate: validation.data.dueDate
          ? new Date(`${validation.data.dueDate}T12:00:00.000Z`)
          : null,
        assigneeId: validation.data.assigneeId || null,
        creatorId: currentUser.id,
      },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    revalidateTaskPages();
    return Response.json({ task }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
