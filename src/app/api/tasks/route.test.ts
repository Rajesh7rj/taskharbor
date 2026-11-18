import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthenticationError } from "@/features/auth/server/errors";
import { Role, TaskPriority, TaskStatus } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  requireCurrentUser: vi.fn(),
  getTasks: vi.fn(),
  findUser: vi.fn(),
  createTask: vi.fn(),
  revalidateTaskPages: vi.fn(),
}));

vi.mock("@/features/auth/server/current-user", () => ({
  requireCurrentUser: mocks.requireCurrentUser,
}));

vi.mock("@/features/tasks/server/queries", () => ({
  getTasks: mocks.getTasks,
}));

vi.mock("@/features/tasks/server/revalidation", () => ({
  revalidateTaskPages: mocks.revalidateTaskPages,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUser },
    task: { create: mocks.createTask },
  },
}));

import { GET, POST } from "@/app/api/tasks/route";

const admin = {
  id: "00000000-0000-4000-8000-000000000001",
  role: Role.ADMIN,
};
const member = {
  id: "00000000-0000-4000-8000-000000000002",
  role: Role.MEMBER,
};

describe("/api/tasks", () => {
  beforeEach(() => {
    mocks.requireCurrentUser.mockResolvedValue(admin);
    mocks.getTasks.mockResolvedValue({
      tasks: [],
      totalTaskCount: 0,
    });
    mocks.createTask.mockResolvedValue({
      id: "task-id",
      title: "API task",
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
    });
  });

  it("returns 401 when task listing is unauthenticated", async () => {
    mocks.getTasks.mockRejectedValue(new AuthenticationError());

    const response = await GET(
      new Request("http://localhost/api/tasks"),
    );

    expect(response.status).toBe(401);
  });

  it("returns the authenticated user's scoped task list", async () => {
    mocks.getTasks.mockResolvedValue({
      tasks: [{ id: "assigned-task" }],
      totalTaskCount: 1,
    });

    const response = await GET(
      new Request(
        "http://localhost/api/tasks?status=TODO&query=release",
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.getTasks).toHaveBeenCalledWith({
      query: "release",
      status: TaskStatus.TODO,
    });
    await expect(response.json()).resolves.toMatchObject({
      totalTaskCount: 1,
    });
  });

  it("allows an administrator to create a task", async () => {
    const response = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "API task",
          priority: "HIGH",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.createTask).toHaveBeenCalledOnce();
    expect(mocks.revalidateTaskPages).toHaveBeenCalledOnce();
  });

  it("rejects invalid task creation data", async () => {
    const response = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "", priority: "URGENT" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it("prevents a member from creating a task", async () => {
    mocks.requireCurrentUser.mockResolvedValue(member);

    const response = await POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Forbidden task",
          priority: "LOW",
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.createTask).not.toHaveBeenCalled();
  });
});
