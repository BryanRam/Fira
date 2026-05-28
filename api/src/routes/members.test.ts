import { describe, it, expect } from "bun:test";
import { listProjectMembersRoute, setProjectMemberRoleRoute } from "./members";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("listProjectMembersRoute", () => {
  it("returns members for a known project", async () => {
    const res = await listProjectMembersRoute("project-phoenix");
    expect(res.status).toBe(200);
    const members = await res.json() as Array<{ userId: string; projectId: string }>;
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThan(0);
    expect(members.every((m) => m.projectId === "project-phoenix")).toBe(true);
  });

  it("returns an empty array for an unknown project", async () => {
    const res = await listProjectMembersRoute("project-unknown");
    expect(res.status).toBe(200);
    const members = await res.json() as unknown[];
    expect(members.length).toBe(0);
  });
});

describe("setProjectMemberRoleRoute", () => {
  it("returns 403 for engineer role", async () => {
    const res = await setProjectMemberRoleRoute("project-phoenix", "user-sam", makeRequest({ role: "admin" }), "engineer");
    expect(res.status).toBe(403);
  });

  it("returns 403 for read-only role", async () => {
    const res = await setProjectMemberRoleRoute("project-phoenix", "user-sam", makeRequest({ role: "admin" }), "read-only");
    expect(res.status).toBe(403);
  });

  it("updates existing member role as admin", async () => {
    const res = await setProjectMemberRoleRoute("project-phoenix", "user-sam", makeRequest({ role: "read-only" }), "admin");
    expect(res.status).toBe(200);
    const members = await res.json() as Array<{ userId: string; role: string }>;
    const sam = members.find((m) => m.userId === "user-sam");
    expect(sam?.role).toBe("read-only");
  });

  it("adds a new member when user is not yet in the project", async () => {
    const res = await setProjectMemberRoleRoute("project-phoenix", "user-new-person", makeRequest({ role: "engineer" }), "admin");
    expect(res.status).toBe(200);
    const members = await res.json() as Array<{ userId: string; role: string }>;
    const newPerson = members.find((m) => m.userId === "user-new-person");
    expect(newPerson?.role).toBe("engineer");
  });
});
