import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role, TaskStatus } from "@/generated/prisma/enums";

const mocks = vi.hoisted(() => ({
  requireCurrentUser: vi.fn(),
  redirect: vi.fn(),
  revalidateTaskPages: vi.fn(),
  findUser: vi.fn(),
  findTask: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/features/auth/server/current-user", () => ({
  requireCurrentUser: mocks.requireCurrentUser,
}));

vi.mock("@/features/tasks/server/revalidation", () => ({
  revalidateTaskPages: mocks.revalidateTaskPages,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUser },
    task: {
      findUnique: mocks.findTask,
      create: mocks.createTask,
      update: mocks.updateTask,
      delete: mocks.deleteTask,
    },
  },
}));

import {
  createTaskAction,
  updateTaskStatusAction,
} from "@/features/tasks/server/actions";

const admin = {
  id: "00000000-0000-4000-8000-000000000001",
  role: Role.ADMIN,
};
const member = {
  id: "00000000-0000-4000-8000-000000000002",
  role: Role.MEMBER,
};
const assignedTask = {
  creatorId: admin.id,
  assigneeId: member.id,
};

function createTaskFormData() {
  const formData = new FormData();
  formData.set("title", "Server Action task");
  formData.set("description", "");
  formData.set("priority", "MEDIUM");
  formData.set("dueDate", "");
  formData.set("assigneeId", "");
  return formData;
}

function createStatusFormData(status: TaskStatus) {
  const formData = new FormData();
  formData.set(
    "taskId",
    "00000000-0000-4000-8000-000000000101",
  );
  formData.set("status", status);
  return formData;
}

describe("task Server Actions", () => {
  beforeEach(() => {
    mocks.requireCurrentUser.mockResolvedValue(admin);
    mocks.createTask.mockResolvedValue({ id: "task-id" });
    mocks.findTask.mockResolvedValue(assignedTask);
    mocks.updateTask.mockResolvedValue(assignedTask);
  });

  it("allows an administrator to create a task", async () => {
    await createTaskAction({}, createTaskFormData());

    expect(mocks.createTask).toHaveBeenCalledOnce();
    expect(mocks.revalidateTaskPages).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/tasks");
  });

  it("prevents a member from creating a task", async () => {
    mocks.requireCurrentUser.mockResolvedValue(member);

    const result = await createTaskAction({}, createTaskFormData());

    expect(result.formError).toMatch(/administrators/i);
    expect(mocks.createTask).not.toHaveBeenCalled();
  });

  it("allows an assigned member to update task status", async () => {
    mocks.requireCurrentUser.mockResolvedValue(member);

    await updateTaskStatusAction(
      createStatusFormData(TaskStatus.COMPLETED),
    );

    expect(mocks.updateTask).toHaveBeenCalledWith({
      where: {
        id: "00000000-0000-4000-8000-000000000101",
      },
      data: { status: TaskStatus.COMPLETED },
    });
  });

  it("prevents a member from updating another member's task", async () => {
    mocks.requireCurrentUser.mockResolvedValue(member);
    mocks.findTask.mockResolvedValue({
      ...assignedTask,
      assigneeId: "00000000-0000-4000-8000-000000000003",
    });

    await expect(
      updateTaskStatusAction(
        createStatusFormData(TaskStatus.COMPLETED),
      ),
    ).rejects.toThrow("cannot update");
    expect(mocks.updateTask).not.toHaveBeenCalled();
  });
});
