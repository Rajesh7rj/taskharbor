import { describe, expect, it } from "vitest";

import {
  taskDetailsSchema,
  taskPatchSchema,
} from "@/features/tasks/schemas/task-schema";

const validTask = {
  title: "Prepare release",
  description: "Verify the MVP release.",
  priority: "HIGH",
  dueDate: "2026-12-01",
  assigneeId: "00000000-0000-4000-8000-000000000002",
};

describe("task schemas", () => {
  it("accepts valid task details", () => {
    expect(taskDetailsSchema.safeParse(validTask).success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = taskDetailsSchema.safeParse({
      ...validTask,
      title: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = taskDetailsSchema.safeParse({
      ...validTask,
      priority: "URGENT",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid calendar date", () => {
    const result = taskDetailsSchema.safeParse({
      ...validTask,
      dueDate: "2026-02-30",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid assignee ID", () => {
    const result = taskDetailsSchema.safeParse({
      ...validTask,
      assigneeId: "not-a-uuid",
    });

    expect(result.success).toBe(false);
  });

  it("requires a patch field and accepts a status patch", () => {
    expect(taskPatchSchema.safeParse({}).success).toBe(false);
    expect(
      taskPatchSchema.safeParse({ status: "COMPLETED" }).success,
    ).toBe(true);
  });
});
