import { Role } from "@/generated/prisma/enums";

export const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: "Administrator",
  [Role.MEMBER]: "Member",
};

export function getUserDisplayName(
  name: string | null | undefined,
  email: string | null | undefined,
) {
  return name?.trim() || email?.trim() || "TaskHarbor user";
}

export function getUserInitials(displayName: string) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "TH";
}
