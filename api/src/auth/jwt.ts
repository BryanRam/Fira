import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  sub: string;
  username: string;
  cn: string;
  mail: string;
  type: "access" | "refresh";
}

const secret = process.env.JWT_SECRET ?? "development-secret";

export function signToken(payload: Omit<AuthTokenPayload, "type">): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign({ ...payload, type: "access" }, secret, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ ...payload, type: "refresh" }, secret, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, secret) as AuthTokenPayload;
}
