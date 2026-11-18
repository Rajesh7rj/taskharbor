import type { Role } from "@/generated/prisma/enums";
import { Role as RoleValues } from "@/generated/prisma/enums";

import { AuthorizationError } from "./errors";

export type AuthorizationActor = {
  id: string;
  role: Role;
};

export type TaskAuthorizationResource = {
  creatorId: string;
  assigneeId: string | null;
};

export function isAdmin(actor: AuthorizationActor) {
  return actor.role === RoleValues.ADMIN;
}

export function canViewAllTasks(actor: AuthorizationActor) {
  return isAdmin(actor);
}

export function canViewTask(
  actor: AuthorizationActor,
  task: TaskAuthorizationResource,
) {
  return isAdmin(actor) || task.assigneeId === actor.id;
}

export function canCreateTask(actor: AuthorizationActor) {
  return isAdmin(actor);
}

export function canUpdateTaskDetails(
  actor: AuthorizationActor,
  task: TaskAuthorizationResource,
) {
  void task;
  return isAdmin(actor);
}

export function canUpdateTaskStatus(
  actor: AuthorizationActor,
  task: TaskAuthorizationResource,
) {
  return isAdmin(actor) || task.assigneeId === actor.id;
}

export function canDeleteTask(
  actor: AuthorizationActor,
  task: TaskAuthorizationResource,
) {
  void task;
  return isAdmin(actor);
}

export function assertCanCreateTask(actor: AuthorizationActor) {
  if (!canCreateTask(actor)) {
    throw new AuthorizationError(
      "Only administrators can create tasks.",
    );
  }
}

export function assertCanViewTask(
  actor: AuthorizationActor,
  task: TaskAuthorizationResource,
) {
  if (!canViewTask(actor, task)) {
    throw new AuthorizationError(
      "You cannot view this task.",
    );
  }
}

export function assertCanUpdateTaskDetails(
  actor: AuthorizationActor,
  task: TaskAuthorizationResource,
) {
  if (!canUpdateTaskDetails(actor, task)) {
    throw new AuthorizationError(
      "Only administrators can edit task details.",
    );
  }
}

export function assertCanUpdateTaskStatus(
  actor: AuthorizationActor,
  task: TaskAuthorizationResource,
) {
  if (!canUpdateTaskStatus(actor, task)) {
    throw new AuthorizationError(
      "You cannot update this task's status.",
    );
  }
}

export function assertCanDeleteTask(
  actor: AuthorizationActor,
  task: TaskAuthorizationResource,
) {
  if (!canDeleteTask(actor, task)) {
    throw new AuthorizationError(
      "Only administrators can delete tasks.",
    );
  }
}
