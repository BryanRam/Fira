import { describe, it, expect } from "bun:test";
import { getMyTasksRoute } from "./dashboard";

describe("getMyTasksRoute", () => {
  it("returns tasks assigned to the given user", async () => {
    const res = await getMyTasksRoute("user-alex");
    expect(res.status).toBe(200);
    const tasks = await res.json() as Array<{ assigneeId: string }>;
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => t.assigneeId === "user-alex")).toBe(true);
  });

  it("returns an empty array for a user with no tasks", async () => {
    const res = await getMyTasksRoute("user-nobody");
    expect(res.status).toBe(200);
    const tasks = await res.json() as unknown[];
    expect(tasks.length).toBe(0);
  });

  it("includes projectName on each task", async () => {
    const res = await getMyTasksRoute("user-sam");
    const tasks = await res.json() as Array<{ projectName: string }>;
    expect(tasks.every((t) => typeof t.projectName === "string")).toBe(true);
  });
});
