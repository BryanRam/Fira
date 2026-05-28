import { verifyToken, type AuthTokenPayload } from "./jwt";

export function getAuthenticatedUser(request: Request): AuthTokenPayload | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
