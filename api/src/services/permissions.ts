export type ProjectRole = "admin" | "engineer" | "read-only";

export function canCreateTask(role: ProjectRole): boolean {
  return role === "admin" || role === "engineer";
}

export function canEditTask(role: ProjectRole): boolean {
  return role === "admin" || role === "engineer";
}

export function canMoveTask(role: ProjectRole): boolean {
  return role === "admin" || role === "engineer";
}

export function canManageMembers(role: ProjectRole): boolean {
  return role === "admin";
}

export function canCreateProject(role: ProjectRole): boolean {
  return role === "admin";
}
