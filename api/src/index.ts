import { getAuthenticatedUser } from "./auth/middleware";
import { json, withCors, corsHeaders } from "./http";
import { refreshRoute, loginRoute } from "./routes/auth";
import { getMyTasksRoute } from "./routes/dashboard";
import { listProjectMembersRoute, setProjectMemberRoleRoute } from "./routes/members";
import { createProjectRoute, deleteProjectRoute, getProjectRoute, listProjectsRoute, updateProjectRoute } from "./routes/projects";
import {
  createChildTaskRoute,
  createProjectTaskRoute,
  deleteTaskRoute,
  getTaskRoute,
  listProjectTasksRoute,
  updateTaskRoute,
  updateTaskStatusRoute
} from "./routes/tasks";
import { getUserRoute, updateUserProfileRoute } from "./routes/users";

type RouteHandler = (request: Request, params: Record<string, string>, userId: string | null) => Promise<Response>;

interface RouteDefinition {
  method: string;
  pattern: URLPattern;
  protected: boolean;
  handler: RouteHandler;
}

const routes: RouteDefinition[] = [
  { method: "POST", pattern: new URLPattern({ pathname: "/auth/login" }), protected: false, handler: (request) => loginRoute(request) },
  { method: "POST", pattern: new URLPattern({ pathname: "/auth/refresh" }), protected: false, handler: (request) => refreshRoute(request) },
  { method: "GET", pattern: new URLPattern({ pathname: "/projects" }), protected: true, handler: () => listProjectsRoute() },
  { method: "POST", pattern: new URLPattern({ pathname: "/projects" }), protected: true, handler: (request) => createProjectRoute(request) },
  { method: "GET", pattern: new URLPattern({ pathname: "/projects/:id" }), protected: true, handler: (_, params) => getProjectRoute(params.id) },
  { method: "PATCH", pattern: new URLPattern({ pathname: "/projects/:id" }), protected: true, handler: (request, params) => updateProjectRoute(params.id, request) },
  { method: "DELETE", pattern: new URLPattern({ pathname: "/projects/:id" }), protected: true, handler: (_, params) => deleteProjectRoute(params.id) },
  { method: "GET", pattern: new URLPattern({ pathname: "/projects/:id/tasks" }), protected: true, handler: (_, params) => listProjectTasksRoute(params.id) },
  { method: "POST", pattern: new URLPattern({ pathname: "/projects/:id/tasks" }), protected: true, handler: (request, params) => createProjectTaskRoute(params.id, request) },
  { method: "GET", pattern: new URLPattern({ pathname: "/tasks/:id" }), protected: true, handler: (_, params) => getTaskRoute(params.id) },
  { method: "PATCH", pattern: new URLPattern({ pathname: "/tasks/:id" }), protected: true, handler: (request, params) => updateTaskRoute(params.id, request) },
  { method: "PATCH", pattern: new URLPattern({ pathname: "/tasks/:id/status" }), protected: true, handler: (request, params) => updateTaskStatusRoute(params.id, request) },
  { method: "DELETE", pattern: new URLPattern({ pathname: "/tasks/:id" }), protected: true, handler: (_, params) => deleteTaskRoute(params.id) },
  { method: "POST", pattern: new URLPattern({ pathname: "/tasks/:id/children" }), protected: true, handler: (request, params) => createChildTaskRoute(params.id, request) },
  { method: "GET", pattern: new URLPattern({ pathname: "/projects/:id/members" }), protected: true, handler: (_, params) => listProjectMembersRoute(params.id) },
  { method: "PUT", pattern: new URLPattern({ pathname: "/projects/:id/members/:userId" }), protected: true, handler: (request, params) => setProjectMemberRoleRoute(params.id, params.userId, request) },
  { method: "GET", pattern: new URLPattern({ pathname: "/me/tasks" }), protected: true, handler: (_, __, userId) => getMyTasksRoute(userId ?? "user-alex") },
  { method: "GET", pattern: new URLPattern({ pathname: "/users/:id" }), protected: true, handler: (_, params) => getUserRoute(params.id) },
  { method: "PATCH", pattern: new URLPattern({ pathname: "/users/:id/profile" }), protected: true, handler: (request, params) => updateUserProfileRoute(params.id, request) }
];

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    for (const route of routes) {
      if (route.method !== request.method) {
        continue;
      }

      const match = route.pattern.exec(url);
      if (!match) {
        continue;
      }

      const user = getAuthenticatedUser(request);
      if (route.protected && !user) {
        return json({ message: "Unauthorized." }, 401);
      }

      try {
        return withCors(await route.handler(request, match.pathname.groups, user?.sub ?? null));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return withCors(json({ message }, 500));
      }
    }

    return withCors(json({ message: "Not found." }, 404));
  }
});

console.log(`Fira API listening on http://localhost:${server.port}`);
