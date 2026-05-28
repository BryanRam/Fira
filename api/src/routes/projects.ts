import { json, readJson } from "../http";
import { demoProjects } from "../services/demo";
import { runQuery } from "../services/neo4j";
import { canCreateProject, type ProjectRole } from "../services/permissions";

interface ProjectBody {
  key: string;
  name: string;
  description: string;
}

export async function listProjectsRoute(): Promise<Response> {
  try {
    const result = await runQuery("MATCH (project:Project) RETURN project ORDER BY project.name");
    const projects = result.records.map((record) => record.get("project").properties);
    return json(projects);
  } catch {
    return json(demoProjects);
  }
}

export async function createProjectRoute(request: Request, role: ProjectRole = "admin"): Promise<Response> {
  if (!canCreateProject(role)) {
    return json({ message: "Forbidden." }, 403);
  }

  const payload = await readJson<ProjectBody>(request);
  const project = {
    id: crypto.randomUUID(),
    key: payload.key ?? "NEW",
    name: payload.name ?? "New Project",
    description: payload.description ?? "",
    teamName: "Engineering Team",
    createdAt: new Date().toISOString()
  };

  try {
    await runQuery(
      "CREATE (project:Project $project) RETURN project",
      { project }
    );
  } catch {
    demoProjects.push(project);
  }

  return json(project, 201);
}

export async function getProjectRoute(projectId: string): Promise<Response> {
  try {
    const result = await runQuery("MATCH (project:Project {id: $projectId}) RETURN project LIMIT 1", { projectId });
    const record = result.records[0];
    if (!record) {
      return json({ message: "Project not found." }, 404);
    }
    return json(record.get("project").properties);
  } catch {
    const project = demoProjects.find((entry) => entry.id === projectId);
    return project ? json(project) : json({ message: "Project not found." }, 404);
  }
}

export async function updateProjectRoute(projectId: string, request: Request): Promise<Response> {
  const payload = await readJson<ProjectBody>(request);

  try {
    await runQuery(
      `MATCH (project:Project {id: $projectId})
       SET project.name = coalesce($name, project.name),
           project.description = coalesce($description, project.description),
           project.key = coalesce($key, project.key)
       RETURN project`,
      { projectId, name: payload.name, description: payload.description, key: payload.key }
    );
  } catch {
    const project = demoProjects.find((entry) => entry.id === projectId);
    if (!project) {
      return json({ message: "Project not found." }, 404);
    }
    project.name = payload.name ?? project.name;
    project.description = payload.description ?? project.description;
    project.key = payload.key ?? project.key;
    return json(project);
  }

  return getProjectRoute(projectId);
}

export async function deleteProjectRoute(projectId: string): Promise<Response> {
  try {
    await runQuery("MATCH (project:Project {id: $projectId}) DETACH DELETE project", { projectId });
  } catch {
    const index = demoProjects.findIndex((entry) => entry.id === projectId);
    if (index === -1) {
      return json({ message: "Project not found." }, 404);
    }
    demoProjects.splice(index, 1);
  }

  return json({ ok: true });
}
