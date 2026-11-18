import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role, TaskStatus } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  requireCurrentUser: vi.fn(),
  findTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  findUser: vi.fn(),
  revalidateTaskPages: vi.fn(),
}));

vi.mock("@/features/auth/server/current-user", () => ({
  requireCurrentUser: mocks.requireCurrentUser,
}));

vi.mock("@/features/tasks/server/revalidation", () => ({
  revalidateTaskPages: mocks.revalidateTaskPages,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findUnique: mocks.findTask,
      update: mocks.updateTask,
      delete: mocks.deleteTask,
    },
    user: { findUnique: mocks.findUser },
  },
}));

import {
  DELETE,
  GET,
  PATCH,
} from "@/app/api/tasks/[taskId]/route";

const taskId = "00000000-0000-4000-8000-000000000101";
const admin = {
  id: "00000000-0000-4000-8000-000000000001",
  role: Role.ADMIN,
};
const member = {
  id: "00000000-0000-4000-8000-000000000002",
  role: Role.MEMBER,
};
const task = {
  id: taskId,
  title: "Assigned task",
  creatorId: admin.id,
  assigneeId: member.id,
  status: TaskStatus.TODO,
};
const context = {
  params: Promise.resolve({ taskId }),
};

describe("/api/tasks/[taskId]", () => {
  beforeEach(() => {
    mocks.requireCurrentUser.mockResolvedValue(admin);
    mocks.findTask.mockResolvedValue(task);
    mocks.updateTask.mockResolvedValue(task);
    mocks.deleteTask.mockResolvedValue(task);
  });

  it("returns a visible task and returns 404 when it is missing", async () => {
    const response = await GET(
      new Request(`http://localhost/api/tasks/${taskId}`),
      context,
    );

    expect(response.status).toBe(200);

    mocks.findTask.mockResolvedValueOnce(null);
    const missingResponse = await GET(
      new Request(`http://localhost/api/tasks/${taskId}`),
      context,
    );

    expect(missingResponse.status).toBe(404);
  });

  it("prevents a member from viewing another member's task", async () => {
    mocks.requireCurrentUser.mockResolvedValue(member);
    mocks.findTask.mockResolvedValue({
      ...task,
      assigneeId: "00000000-0000-4000-8000-000000000003",
    });

    const response = await GET(
      new Request(`http://localhost/api/tasks/${taskId}`),
      context,
    );

    expect(response.status).toBe(403);
  });

  it("allows an assigned member to update task status", async () => {
    mocks.requireCurrentUser.mockResolvedValue(member);
    mocks.updateTask.mockResolvedValue({
      ...task,
      status: TaskStatus.COMPLETED,
    });

    const response = await PATCH(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      }),
      context,
    );

    expect(response.status).toBe(200);
    expect(mocks.updateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: TaskStatus.COMPLETED },
      }),
    );
  });

  it("allows an administrator to delete a task", async () => {
    const response = await DELETE(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: "DELETE",
      }),
      context,
    );

    expect(response.status).toBe(204);
    expect(mocks.deleteTask).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(mocks.revalidateTaskPages).toHaveBeenCalledOnce();
  });
});
