import { json, readJson } from "../http";
import { demoMembers, getDemoProjectMembers } from "../services/demo";
import { runQuery } from "../services/neo4j";
import { canManageMembers, type ProjectRole } from "../services/permissions";

export async function listProjectMembersRoute(projectId: string): Promise<Response> {
  try {
    const result = await runQuery(
      `MATCH (user:User)-[m:MEMBER_OF]->(project:Project {id: $projectId})
       RETURN user, m.role AS role`,
      { projectId }
    );
    const members = result.records.map((record) => {
      const user = record.get("user").properties as Record<string, string>;
      const role = String(record.get("role"));
      return {
        userId: String(user.id),
        projectId,
        role,
        user: {
          id: String(user.id),
          username: String(user.username ?? user.id),
          cn: String(user.displayName ?? user.id),
          mail: String(user.email ?? ""),
          displayName: String(user.displayName ?? user.id),
          avatarUrl: String(user.avatarUrl ?? "")
        }
      };
    });
    return json(members);
  } catch {
    return json(getDemoProjectMembers(projectId));
  }
}

export async function setProjectMemberRoleRoute(projectId: string, userId: string, request: Request, role: ProjectRole = "admin"): Promise<Response> {
  if (!canManageMembers(role)) {
    return json({ message: "Forbidden." }, 403);
  }

  const payload = await readJson<{ role: ProjectRole }>(request);
  const memberRole = payload.role ?? "read-only";

  try {
    await runQuery(
      `MATCH (user:User {id: $userId})
       MATCH (project:Project {id: $projectId})
       MERGE (user)-[m:MEMBER_OF]->(project)
       SET m.role = $memberRole`,
      { userId, projectId, memberRole }
    );
    return listProjectMembersRoute(projectId);
  } catch {
    const member = demoMembers.find((entry) => entry.projectId === projectId && entry.userId === userId);
    if (!member) {
      demoMembers.push({ projectId, userId, role: memberRole });
    } else {
      member.role = memberRole;
    }
    return json(getDemoProjectMembers(projectId));
  }
}

export async function removeProjectMemberRoute(projectId: string, userId: string, role: ProjectRole = "admin"): Promise<Response> {
  if (!canManageMembers(role)) {
    return json({ message: "Forbidden." }, 403);
  }

  try {
    await runQuery(
      `MATCH (user:User {id: $userId})-[m:MEMBER_OF]->(project:Project {id: $projectId})
       DELETE m`,
      { userId, projectId }
    );
    return listProjectMembersRoute(projectId);
  } catch {
    const index = demoMembers.findIndex((entry) => entry.projectId === projectId && entry.userId === userId);
    if (index !== -1) {
      demoMembers.splice(index, 1);
    }
    return json(getDemoProjectMembers(projectId));
  }
}
