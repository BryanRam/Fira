import { describe, it, expect } from "bun:test";
import { getUserRoute, updateUserProfileRoute } from "./users";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("getUserRoute", () => {
  it("returns 200 for a known user by id", async () => {
    const res = await getUserRoute("user-alex");
    expect(res.status).toBe(200);
    const user = await res.json() as { id: string; username: string };
    expect(user.id).toBe("user-alex");
    expect(user.username).toBe("alex");
  });

  it("returns 200 for a known user by username", async () => {
    const res = await getUserRoute("sam");
    expect(res.status).toBe(200);
    const user = await res.json() as { username: string };
    expect(user.username).toBe("sam");
  });

  it("returns 404 for an unknown user", async () => {
    const res = await getUserRoute("user-nobody");
    expect(res.status).toBe(404);
  });
});

describe("updateUserProfileRoute", () => {
  it("returns 404 for an unknown user", async () => {
    const res = await updateUserProfileRoute("user-nobody", makeRequest({ displayName: "Ghost" }));
    expect(res.status).toBe(404);
  });

  it("updates the display name for a known user", async () => {
    const res = await updateUserProfileRoute("user-jamie", makeRequest({ displayName: "Jamie Updated" }));
    expect(res.status).toBe(200);
    const user = await res.json() as { displayName: string };
    expect(user.displayName).toBe("Jamie Updated");
  });

  it("updates the avatarUrl for a known user", async () => {
    const res = await updateUserProfileRoute("user-maya", makeRequest({ avatarUrl: "https://example.com/avatar.png" }));
    expect(res.status).toBe(200);
    const user = await res.json() as { avatarUrl: string };
    expect(user.avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("leaves unchanged fields intact when updating", async () => {
    const before = await getUserRoute("user-sam");
    const { displayName } = await before.json() as { displayName: string };
    const res = await updateUserProfileRoute("user-sam", makeRequest({ avatarUrl: "https://example.com/sam.png" }));
    const user = await res.json() as { displayName: string; avatarUrl: string };
    expect(user.displayName).toBe(displayName);
    expect(user.avatarUrl).toBe("https://example.com/sam.png");
  });
});
