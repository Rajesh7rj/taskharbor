import {
  TaskPriority,
  TaskStatus,
} from "@/generated/prisma/enums";

export const taskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "To do",
  [TaskStatus.IN_PROGRESS]: "In progress",
  [TaskStatus.COMPLETED]: "Completed",
};

export const taskStatusStyles: Record<TaskStatus, string> = {
  [TaskStatus.TODO]:
    "border-transparent bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  [TaskStatus.IN_PROGRESS]:
    "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-300",
  [TaskStatus.COMPLETED]:
    "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: "Low",
  [TaskPriority.MEDIUM]: "Medium",
  [TaskPriority.HIGH]: "High",
};

export const taskPriorityStyles: Record<TaskPriority, string> = {
  [TaskPriority.LOW]:
    "border-transparent bg-slate-500/15 text-slate-700 dark:text-slate-300",
  [TaskPriority.MEDIUM]:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  [TaskPriority.HIGH]:
    "border-transparent bg-red-500/15 text-red-700 dark:text-red-300",
};

const dueDateFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatTaskDueDate(dueDate: Date | null) {
  if (!dueDate) {
    return "No due date";
  }

  return `Due ${dueDateFormatter.format(dueDate)}`;
}