import { describe, it, expect } from "bun:test";
import { signToken, verifyToken } from "./jwt";

describe("signToken", () => {
  const payload = { sub: "user-1", username: "alice", cn: "Alice Smith", mail: "alice@example.com" };

  it("returns an accessToken and refreshToken", () => {
    const tokens = signToken(payload);
    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");
    expect(typeof tokens.accessToken).toBe("string");
    expect(typeof tokens.refreshToken).toBe("string");
  });

  it("access token has type=access", () => {
    const { accessToken } = signToken(payload);
    const decoded = verifyToken(accessToken);
    expect(decoded.type).toBe("access");
  });

  it("refresh token has type=refresh", () => {
    const { refreshToken } = signToken(payload);
    const decoded = verifyToken(refreshToken);
    expect(decoded.type).toBe("refresh");
  });

  it("tokens include sub and username", () => {
    const { accessToken } = signToken(payload);
    const decoded = verifyToken(accessToken);
    expect(decoded.sub).toBe("user-1");
    expect(decoded.username).toBe("alice");
    expect(decoded.cn).toBe("Alice Smith");
    expect(decoded.mail).toBe("alice@example.com");
  });
});

describe("verifyToken", () => {
  it("throws on tampered token", () => {
    const { accessToken } = signToken({ sub: "u", username: "u", cn: "U", mail: "u@u.com" });
    expect(() => verifyToken(accessToken + "tampered")).toThrow();
  });

  it("throws on completely invalid token", () => {
    expect(() => verifyToken("not.a.valid.jwt")).toThrow();
  });
});
