import { json, readJson } from "../http";
import { demoMembers, getDemoProjectMembers } from "../services/demo";
import { canManageMembers, type ProjectRole } from "../services/permissions";

export async function listProjectMembersRoute(projectId: string): Promise<Response> {
  return json(getDemoProjectMembers(projectId));
}

export async function setProjectMemberRoleRoute(projectId: string, userId: string, request: Request, role: ProjectRole = "admin"): Promise<Response> {
  if (!canManageMembers(role)) {
    return json({ message: "Forbidden." }, 403);
  }

  const payload = await readJson<{ role: ProjectRole }>(request);
  const member = demoMembers.find((entry) => entry.projectId === projectId && entry.userId === userId);
  if (!member) {
    demoMembers.push({ projectId, userId, role: payload.role ?? "read-only" });
  } else {
    member.role = payload.role ?? member.role;
  }

  return json(getDemoProjectMembers(projectId));
}
