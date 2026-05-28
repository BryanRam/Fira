import { describe, it, expect } from "bun:test";
import {
  listProjectTasksRoute,
  createProjectTaskRoute,
  getTaskRoute,
  updateTaskRoute,
  updateTaskStatusRoute,
  deleteTaskRoute,
  createChildTaskRoute
} from "./tasks";

function makeRequest(body: unknown, url = "http://localhost/"): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("listProjectTasksRoute", () => {
  it("returns an array of tasks for a known project (demo fallback)", async () => {
    const res = await listProjectTasksRoute("project-phoenix");
    expect(res.status).toBe(200);
    const tasks = await res.json() as unknown[];
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
  });

  it("returns an empty array for an unknown project", async () => {
    const res = await listProjectTasksRoute("project-unknown");
    expect(res.status).toBe(200);
    const tasks = await res.json() as unknown[];
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBe(0);
  });
});

describe("getTaskRoute", () => {
  it("returns 200 for a known demo task", async () => {
    const res = await getTaskRoute("task-phx-12");
    expect(res.status).toBe(200);
    const task = await res.json() as { id: string };
    expect(task.id).toBe("task-phx-12");
  });

  it("returns 404 for an unknown task", async () => {
    const res = await getTaskRoute("task-does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("createProjectTaskRoute", () => {
  it("returns 403 for read-only role", async () => {
    const res = await createProjectTaskRoute("project-phoenix", makeRequest({ title: "New" }), "read-only");
    expect(res.status).toBe(403);
  });

  it("returns 201 for engineer role", async () => {
    const res = await createProjectTaskRoute("project-phoenix", makeRequest({ title: "Test Task" }), "engineer");
    expect(res.status).toBe(201);
    const task = await res.json() as { title: string; projectId: string };
    expect(task.title).toBe("Test Task");
    expect(task.projectId).toBe("project-phoenix");
  });

  it("uses default title when not provided", async () => {
    const res = await createProjectTaskRoute("project-phoenix", makeRequest({}), "admin");
    expect(res.status).toBe(201);
    const task = await res.json() as { title: string };
    expect(task.title).toBe("New task");
  });
});

describe("updateTaskRoute", () => {
  it("returns 403 for read-only role", async () => {
    const res = await updateTaskRoute("task-phx-14", makeRequest({ title: "Changed" }), "read-only");
    expect(res.status).toBe(403);
  });

  it("returns 404 for unknown task", async () => {
    const res = await updateTaskRoute("task-unknown", makeRequest({ title: "Changed" }), "engineer");
    expect(res.status).toBe(404);
  });

  it("updates task fields for engineer role", async () => {
    const res = await updateTaskRoute("task-phx-16", makeRequest({ title: "Updated Title" }), "engineer");
    expect(res.status).toBe(200);
    const task = await res.json() as { title: string };
    expect(task.title).toBe("Updated Title");
  });
});

describe("updateTaskStatusRoute", () => {
  it("returns 400 when status is missing", async () => {
    const res = await updateTaskStatusRoute("task-phx-22", makeRequest({}), "engineer");
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown task", async () => {
    const res = await updateTaskStatusRoute("task-unknown", makeRequest({ status: "done" }), "engineer");
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid transition", async () => {
    // task-phx-22 is 'done'; done → in-review is not a valid transition
    const res = await updateTaskStatusRoute("task-phx-23", makeRequest({ status: "in-review" }), "engineer");
    expect(res.status).toBe(400);
  });

  it("returns 400 when engineer tries todo → done", async () => {
    // task-orb-7 is in-review; let's use a task with todo status blocked for engineer
    const createRes = await createProjectTaskRoute("project-orbit", makeRequest({ title: "Status Test" }), "admin");
    const newTask = await createRes.json() as { id: string };
    const res = await updateTaskStatusRoute(newTask.id, makeRequest({ status: "done" }), "engineer");
    expect(res.status).toBe(400);
  });

  it("allows a valid transition and returns the updated task", async () => {
    // task-phx-12 starts as 'todo'; todo → in-progress is valid for engineer
    const res = await updateTaskStatusRoute("task-phx-12", makeRequest({ status: "in-progress" }), "engineer");
    expect(res.status).toBe(200);
    const body = await res.json() as { task: { status: string }; command: unknown };
    expect(body.task.status).toBe("in-progress");
    expect(body.command).not.toBeNull();
  });
});

describe("deleteTaskRoute", () => {
  it("returns 404 for an unknown task", async () => {
    const res = await deleteTaskRoute("task-unknown");
    expect(res.status).toBe(404);
  });

  it("deletes a task and returns ok", async () => {
    const createRes = await createProjectTaskRoute("project-phoenix", makeRequest({ title: "To Delete" }), "admin");
    const { id } = await createRes.json() as { id: string };
    const res = await deleteTaskRoute(id);
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });
});

describe("createChildTaskRoute", () => {
  it("returns 404 for an unknown parent task", async () => {
    const res = await createChildTaskRoute("task-unknown", makeRequest({ title: "Child" }), "engineer");
    expect(res.status).toBe(404);
  });

  it("returns 403 for read-only role", async () => {
    const res = await createChildTaskRoute("task-phx-18", makeRequest({ title: "Child" }), "read-only");
    expect(res.status).toBe(403);
  });

  it("creates a child task with parentId set", async () => {
    const res = await createChildTaskRoute("task-phx-18", makeRequest({ title: "My Child Task" }), "engineer");
    expect(res.status).toBe(201);
    const child = await res.json() as { parentId: string; title: string; type: string };
    expect(child.parentId).toBe("task-phx-18");
    expect(child.title).toBe("My Child Task");
    expect(child.type).toBe("subtask");
  });
});
