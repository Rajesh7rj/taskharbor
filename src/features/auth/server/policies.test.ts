import { describe, expect, it } from "vitest";

import {
  assertCanDeleteTask,
  assertCanUpdateTaskDetails,
  canCreateTask,
  canDeleteTask,
  canUpdateTaskDetails,
  canUpdateTaskStatus,
  canViewTask,
  isAdmin,
} from "@/features/auth/server/policies";
import { Role } from "@/generated/prisma/enums";

const admin = { id: "admin", role: Role.ADMIN };
const member = { id: "member", role: Role.MEMBER };
const assignedTask = {
  creatorId: "admin",
  assigneeId: "member",
};
const otherTask = {
  creatorId: "admin",
  assigneeId: "other-member",
};

describe("task authorization policies", () => {
  it("identifies administrators", () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(member)).toBe(false);
  });

  it("allows administrators to create tasks", () => {
    expect(canCreateTask(admin)).toBe(true);
  });

  it("prevents members from creating tasks", () => {
    expect(canCreateTask(member)).toBe(false);
  });

  it("allows administrators to view any task", () => {
    expect(canViewTask(admin, otherTask)).toBe(true);
  });

  it("allows members to view assigned tasks", () => {
    expect(canViewTask(member, assignedTask)).toBe(true);
  });

  it("prevents members from viewing other tasks", () => {
    expect(canViewTask(member, otherTask)).toBe(false);
  });

  it("allows only administrators to edit and delete tasks", () => {
    expect(canUpdateTaskDetails(admin, assignedTask)).toBe(true);
    expect(canDeleteTask(admin, assignedTask)).toBe(true);
    expect(canUpdateTaskDetails(member, assignedTask)).toBe(false);
    expect(canDeleteTask(member, assignedTask)).toBe(false);
    expect(() =>
      assertCanUpdateTaskDetails(member, assignedTask),
    ).toThrow("Only administrators");
    expect(() => assertCanDeleteTask(member, assignedTask)).toThrow(
      "Only administrators",
    );
  });

  it("allows members to update only assigned task status", () => {
    expect(canUpdateTaskStatus(member, assignedTask)).toBe(true);
    expect(canUpdateTaskStatus(member, otherTask)).toBe(false);
  });
});
