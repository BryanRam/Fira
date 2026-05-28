import { authenticateUser } from "../auth/ldap";
import { signToken, verifyToken } from "../auth/jwt";
import { json, readJson } from "../http";
import { demoUsers, getDemoUser } from "../services/demo";

interface LoginBody {
  username: string;
  password: string;
}

export async function loginRoute(request: Request): Promise<Response> {
  const { username = "", password = "" } = await readJson<LoginBody>(request);
  if (!username || !password) {
    return json({ message: "Username and password are required." }, 400);
  }

  const ldapUser = await authenticateUser(username, password);
  const resolvedUser = ldapUser
    ? {
        id: `user-${username.toLowerCase()}`,
        username,
        cn: ldapUser.cn,
        mail: ldapUser.mail,
        displayName: ldapUser.cn,
        avatarUrl: ""
      }
    : getDemoUser(username) ?? {
        id: `user-${username.toLowerCase()}`,
        username,
        cn: username,
        mail: `${username}@demo.local`,
        displayName: username,
        avatarUrl: ""
      };

  if (!ldapUser && !process.env.LDAP_URL) {
    demoUsers.push(resolvedUser);
  }

  const tokens = signToken({
    sub: resolvedUser.id,
    username: resolvedUser.username,
    cn: resolvedUser.displayName,
    mail: resolvedUser.mail
  });

  return json({
    ...tokens,
    user: resolvedUser,
    mode: ldapUser ? "ldap" : "mock"
  });
}

export async function refreshRoute(request: Request): Promise<Response> {
  const { refreshToken = "" } = await readJson<{ refreshToken: string }>(request);
  if (!refreshToken) {
    return json({ message: "Refresh token is required." }, 400);
  }

  try {
    const payload = verifyToken(refreshToken);
    if (payload.type !== "refresh") {
      return json({ message: "Invalid refresh token." }, 401);
    }

    const tokens = signToken({
      sub: payload.sub,
      username: payload.username,
      cn: payload.cn,
      mail: payload.mail
    });

    return json(tokens);
  } catch {
    return json({ message: "Unable to refresh token." }, 401);
  }
}
