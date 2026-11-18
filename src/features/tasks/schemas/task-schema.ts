import { z } from "zod";

import {
  TaskPriority,
  TaskStatus,
} from "@/generated/prisma/enums";

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value === "") {
        return true;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(date.getTime()) &&
        date.toISOString().startsWith(value)
      );
    },
    "Enter a valid due date.",
  );

export const taskDetailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(160, "Title must contain at most 160 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Description must contain at most 2000 characters."),
  priority: z.enum(TaskPriority),
  dueDate: optionalDate,
  assigneeId: z.union([
    z.literal(""),
    z.uuid("Select a valid assignee."),
  ]),
});

export const taskStatusSchema = z.object({
  taskId: z.uuid(),
  status: z.enum(TaskStatus),
});

export const taskPatchSchema = taskDetailsSchema
  .partial()
  .extend({
    status: z.enum(TaskStatus).optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

export const taskIdSchema = z.uuid();

export type TaskDetailsInput = z.infer<
  typeof taskDetailsSchema
>;

export type TaskPatchInput = z.infer<typeof taskPatchSchema>;
