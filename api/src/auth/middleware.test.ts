import { describe, it, expect } from "bun:test";
import { getAuthenticatedUser } from "./middleware";
import { signToken } from "./jwt";

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/", { headers });
}

describe("getAuthenticatedUser", () => {
  it("returns null when no Authorization header is present", () => {
    expect(getAuthenticatedUser(makeRequest())).toBeNull();
  });

  it("returns null when Authorization header does not start with Bearer", () => {
    expect(getAuthenticatedUser(makeRequest({ Authorization: "Basic abc123" }))).toBeNull();
  });

  it("returns null for an invalid bearer token", () => {
    expect(getAuthenticatedUser(makeRequest({ Authorization: "******" }))).toBeNull();
  });

  it("returns user payload for a valid access token", () => {
    const payload = { sub: "user-1", username: "alice", cn: "Alice", mail: "alice@example.com" };
    const { accessToken } = signToken(payload);
    const user = getAuthenticatedUser(makeRequest({ Authorization: "Bearer " + accessToken }));
    expect(user).not.toBeNull();
    expect(user?.sub).toBe("user-1");
    expect(user?.username).toBe("alice");
  });

  it("returns user payload for a valid refresh token", () => {
    const payload = { sub: "user-2", username: "bob", cn: "Bob", mail: "bob@example.com" };
    const { refreshToken } = signToken(payload);
    const user = getAuthenticatedUser(makeRequest({ Authorization: "Bearer " + refreshToken }));
    expect(user).not.toBeNull();
    expect(user?.sub).toBe("user-2");
  });
});
