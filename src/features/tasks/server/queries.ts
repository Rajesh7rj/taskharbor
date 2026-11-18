import "server-only";

import {
  Prisma,
  Role,
  TaskStatus,
} from "@/generated/prisma/client";
import {
  requireCurrentUser,
  type CurrentUser,
} from "@/features/auth/server/current-user";
import { prisma } from "@/lib/prisma";

export type TaskFilters = {
  query?: string;
  status?: TaskStatus;
};

function getTaskVisibilityWhere(
  user: CurrentUser,
): Prisma.TaskWhereInput {
  if (user.role === Role.ADMIN) {
    return {};
  }

  return {
    assigneeId: user.id,
  };
}

export async function getTasks(filters: TaskFilters = {}) {
  const currentUser = await requireCurrentUser();
  const query = filters.query?.trim();
  const visibilityWhere = getTaskVisibilityWhere(currentUser);

  const filtersWhere: Prisma.TaskWhereInput = {
    AND: [
      filters.status
        ? {
            status: filters.status,
          }
        : {},
      query
        ? {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                assignee: {
                  is: {
                    name: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {},
    ],
  };

  const where: Prisma.TaskWhereInput = {
    AND: [visibilityWhere, filtersWhere],
  };

  const [tasks, totalTaskCount] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          title: "asc",
        },
      ],
    }),
    prisma.task.count({
      where: visibilityWhere,
    }),
  ]);

  return {
    tasks,
    totalTaskCount,
  };
}

export async function getDashboardData() {
  const currentUser = await requireCurrentUser();
  const visibilityWhere = getTaskVisibilityWhere(currentUser);
  const now = new Date();

  const [
    totalTaskCount,
    completedTaskCount,
    inProgressTaskCount,
    overdueTaskCount,
    recentTasks,
  ] = await prisma.$transaction([
    prisma.task.count({
      where: visibilityWhere,
    }),
    prisma.task.count({
      where: {
        AND: [
          visibilityWhere,
          {
            status: TaskStatus.COMPLETED,
          },
        ],
      },
    }),
    prisma.task.count({
      where: {
        AND: [
          visibilityWhere,
          {
            status: TaskStatus.IN_PROGRESS,
          },
        ],
      },
    }),
    prisma.task.count({
      where: {
        AND: [
          visibilityWhere,
          {
            dueDate: {
              lt: now,
            },
            status: {
              not: TaskStatus.COMPLETED,
            },
          },
        ],
      },
    }),
    prisma.task.findMany({
      where: visibilityWhere,
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        assignee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    statistics: {
      total: totalTaskCount,
      completed: completedTaskCount,
      inProgress: inProgressTaskCount,
      overdue: overdueTaskCount,
    },
    recentTasks,
    scope: currentUser.role === Role.ADMIN ? "workspace" : "assigned",
  };
}
