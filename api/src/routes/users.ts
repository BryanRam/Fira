import { json, readJson } from "../http";
import { demoUsers } from "../services/demo";

interface ProfileBody {
  displayName?: string;
  avatarUrl?: string;
}

export async function getUserRoute(userId: string): Promise<Response> {
  const user = demoUsers.find((entry) => entry.id === userId || entry.username === userId);
  return user ? json(user) : json({ message: "User not found." }, 404);
}

export async function updateUserProfileRoute(userId: string, request: Request): Promise<Response> {
  const user = demoUsers.find((entry) => entry.id === userId || entry.username === userId);
  if (!user) {
    return json({ message: "User not found." }, 404);
  }

  const payload = await readJson<ProfileBody>(request);
  user.displayName = payload.displayName ?? user.displayName;
  user.avatarUrl = payload.avatarUrl ?? user.avatarUrl;
  return json(user);
}
