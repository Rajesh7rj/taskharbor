import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import {
  PrismaClient,
  Role,
  TaskPriority,
  TaskStatus,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const defaultDemoPassword = "TaskHarbor123!";
const seedUserPassword =
  process.env.SEED_USER_PASSWORD ?? defaultDemoPassword;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const ids = {
  admin: "00000000-0000-4000-8000-000000000001",
  memberOne: "00000000-0000-4000-8000-000000000002",
  memberTwo: "00000000-0000-4000-8000-000000000003",
  taskOne: "00000000-0000-4000-8000-000000000101",
  taskTwo: "00000000-0000-4000-8000-000000000102",
  taskThree: "00000000-0000-4000-8000-000000000103",
  taskFour: "00000000-0000-4000-8000-000000000104",
  taskFive: "00000000-0000-4000-8000-000000000105",
} as const;

function daysFromNow(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

async function main() {
  const passwordHash = await hash(seedUserPassword, 12);

  await prisma.user.upsert({
    where: {
      id: ids.admin,
    },
    update: {
      name: "Demo Administrator",
      email: "admin@taskharbor.dev",
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      id: ids.admin,
      name: "Demo Administrator",
      email: "admin@taskharbor.dev",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: {
      id: ids.memberOne,
    },
    update: {
      name: "Aarav Sharma",
      email: "aarav@taskharbor.dev",
      passwordHash,
      role: Role.MEMBER,
    },
    create: {
      id: ids.memberOne,
      name: "Aarav Sharma",
      email: "aarav@taskharbor.dev",
      passwordHash,
      role: Role.MEMBER,
    },
  });

  await prisma.user.upsert({
    where: {
      id: ids.memberTwo,
    },
    update: {
      name: "Maya Patel",
      email: "maya@taskharbor.dev",
      passwordHash,
      role: Role.MEMBER,
    },
    create: {
      id: ids.memberTwo,
      name: "Maya Patel",
      email: "maya@taskharbor.dev",
      passwordHash,
      role: Role.MEMBER,
    },
  });

  const taskSeeds = [
    {
      id: ids.taskOne,
      title: "Prepare the product requirements",
      description: "Document the first version of the TaskHarbor requirements.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: daysFromNow(2),
      creatorId: ids.admin,
      assigneeId: ids.memberOne,
    },
    {
      id: ids.taskTwo,
      title: "Review dashboard wireframes",
      description: "Review desktop and mobile dashboard layouts.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: daysFromNow(3),
      creatorId: ids.admin,
      assigneeId: ids.memberTwo,
    },
    {
      id: ids.taskThree,
      title: "Configure the CI workflow",
      description: "Run linting, type checking, and production builds.",
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      dueDate: daysFromNow(-1),
      creatorId: ids.admin,
      assigneeId: ids.admin,
    },
    {
      id: ids.taskFour,
      title: "Create the database model",
      description: "Define the initial users and tasks database tables.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: daysFromNow(6),
      creatorId: ids.admin,
      assigneeId: ids.admin,
    },
    {
      id: ids.taskFive,
      title: "Write onboarding documentation",
      description: "Explain how a new developer can run the application.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      dueDate: daysFromNow(8),
      creatorId: ids.admin,
      assigneeId: ids.memberTwo,
    },
  ];

  for (const task of taskSeeds) {
    const { id, ...data } = task;

    await prisma.task.upsert({
      where: {
        id,
      },
      update: data,
      create: {
        id,
        ...data,
      },
    });
  }

  console.log("Database seeded successfully.");
  console.log("Admin login: admin@taskharbor.dev");

  if (!process.env.SEED_USER_PASSWORD) {
    console.log(`Demo password: ${defaultDemoPassword}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
