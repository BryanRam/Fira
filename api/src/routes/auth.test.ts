import { describe, it, expect } from "bun:test";
import { loginRoute, refreshRoute } from "./auth";
import { signToken } from "../auth/jwt";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("loginRoute", () => {
  it("returns 400 when username is missing", async () => {
    const res = await loginRoute(makeRequest({ password: "pass" }));
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toContain("required");
  });

  it("returns 400 when password is missing", async () => {
    const res = await loginRoute(makeRequest({ username: "alice" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is empty", async () => {
    const res = await loginRoute(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 200 with tokens in demo mode", async () => {
    const res = await loginRoute(makeRequest({ username: "alice", password: "any" }));
    expect(res.status).toBe(200);
    const body = await res.json() as { accessToken: string; refreshToken: string; user: { username: string } };
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
    expect(body.user.username).toBe("alice");
  });
});

describe("refreshRoute", () => {
  it("returns 400 when refreshToken is missing", async () => {
    const res = await refreshRoute(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 401 for an invalid refresh token", async () => {
    const res = await refreshRoute(makeRequest({ refreshToken: "invalid.token.here" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when an access token is used instead of refresh token", async () => {
    const { accessToken } = signToken({ sub: "u", username: "u", cn: "U", mail: "u@u.com" });
    const res = await refreshRoute(makeRequest({ refreshToken: accessToken }));
    expect(res.status).toBe(401);
  });

  it("returns 200 with new tokens for a valid refresh token", async () => {
    const { refreshToken } = signToken({ sub: "user-1", username: "alice", cn: "Alice", mail: "alice@example.com" });
    const res = await refreshRoute(makeRequest({ refreshToken }));
    expect(res.status).toBe(200);
    const body = await res.json() as { accessToken: string; refreshToken: string };
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
  });
});
