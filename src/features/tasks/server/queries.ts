import "server-only";

import {
  Prisma,
  TaskStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type TaskFilters = {
  query?: string;
  status?: TaskStatus;
};

export async function getTasks(filters: TaskFilters = {}) {
  const query = filters.query?.trim();

  const where: Prisma.TaskWhereInput = {
    ...(filters.status
      ? {
          status: filters.status,
        }
      : {}),
    ...(query
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
      : {}),
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
    prisma.task.count(),
  ]);

  return {
    tasks,
    totalTaskCount,
  };
}

export async function getDashboardData() {
  const now = new Date();

  const [
    totalTaskCount,
    completedTaskCount,
    inProgressTaskCount,
    overdueTaskCount,
    recentTasks,
  ] = await prisma.$transaction([
    prisma.task.count(),
    prisma.task.count({
      where: {
        status: TaskStatus.COMPLETED,
      },
    }),
    prisma.task.count({
      where: {
        status: TaskStatus.IN_PROGRESS,
      },
    }),
    prisma.task.count({
      where: {
        dueDate: {
          lt: now,
        },
        status: {
          not: TaskStatus.COMPLETED,
        },
      },
    }),
    prisma.task.findMany({
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
  };
}