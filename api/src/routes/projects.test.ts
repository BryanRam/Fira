import { describe, it, expect } from "bun:test";
import { listProjectsRoute, createProjectRoute, getProjectRoute, updateProjectRoute, deleteProjectRoute } from "./projects";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("listProjectsRoute", () => {
  it("returns an array of projects (demo fallback)", async () => {
    const res = await listProjectsRoute();
    expect(res.status).toBe(200);
    const projects = await res.json() as unknown[];
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });
});

describe("createProjectRoute", () => {
  it("returns 403 for engineer role", async () => {
    const res = await createProjectRoute(makeRequest({ key: "TST", name: "Test", description: "" }), "engineer");
    expect(res.status).toBe(403);
  });

  it("returns 403 for read-only role", async () => {
    const res = await createProjectRoute(makeRequest({ key: "TST", name: "Test", description: "" }), "read-only");
    expect(res.status).toBe(403);
  });

  it("returns 201 and creates a project for admin role", async () => {
    const res = await createProjectRoute(makeRequest({ key: "NEW", name: "New Project", description: "desc" }), "admin");
    expect(res.status).toBe(201);
    const project = await res.json() as { key: string; name: string };
    expect(project.key).toBe("NEW");
    expect(project.name).toBe("New Project");
  });

  it("uses defaults when fields are missing", async () => {
    const res = await createProjectRoute(makeRequest({}), "admin");
    expect(res.status).toBe(201);
    const project = await res.json() as { key: string; name: string };
    expect(project.key).toBe("NEW");
    expect(project.name).toBe("New Project");
  });
});

describe("getProjectRoute", () => {
  it("returns 200 for a known demo project", async () => {
    const res = await getProjectRoute("project-phoenix");
    expect(res.status).toBe(200);
    const project = await res.json() as { id: string; name: string };
    expect(project.id).toBe("project-phoenix");
  });

  it("returns 404 for an unknown project", async () => {
    const res = await getProjectRoute("project-does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("updateProjectRoute", () => {
  it("updates name and description for an existing project", async () => {
    const req = makeRequest({ name: "Updated Phoenix", description: "Updated desc" });
    const res = await updateProjectRoute("project-phoenix", req);
    expect(res.status).toBe(200);
    const project = await res.json() as { name: string; description: string };
    expect(project.name).toBe("Updated Phoenix");
    expect(project.description).toBe("Updated desc");
  });

  it("returns 404 for an unknown project", async () => {
    const req = makeRequest({ name: "Ghost" });
    const res = await updateProjectRoute("project-ghost", req);
    expect(res.status).toBe(404);
  });
});

describe("deleteProjectRoute", () => {
  it("returns 200 and deletes an existing project", async () => {
    const createRes = await createProjectRoute(makeRequest({ key: "DEL", name: "Delete Me", description: "" }), "admin");
    const { id } = await createRes.json() as { id: string };
    const res = await deleteProjectRoute(id);
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("returns 404 for an unknown project", async () => {
    const res = await deleteProjectRoute("project-nonexistent");
    expect(res.status).toBe(404);
  });
});
