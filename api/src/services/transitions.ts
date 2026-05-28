import type { ProjectRole } from "./permissions";

const allowedTransitions: Record<string, Array<{ to: string; requiredRole: ProjectRole; command: string }>> = {
  todo: [
    { to: "in-progress", requiredRole: "engineer", command: "field-update" },
    { to: "done", requiredRole: "admin", command: "notification" }
  ],
  "in-progress": [
    { to: "in-review", requiredRole: "engineer", command: "notification" },
    { to: "done", requiredRole: "admin", command: "field-update" }
  ],
  "in-review": [
    { to: "done", requiredRole: "engineer", command: "webhook" },
    { to: "in-progress", requiredRole: "engineer", command: "notification" }
  ],
  done: [{ to: "in-progress", requiredRole: "admin", command: "notification" }]
};

export function validateTransition(fromStatus: string, toStatus: string, role: ProjectRole): boolean {
  const transitions = allowedTransitions[fromStatus] ?? [];
  return transitions.some((transition) => transition.to === toStatus && (role === "admin" || transition.requiredRole === role));
}

export function dispatchTransitionCommand(taskId: string, fromStatus: string, toStatus: string): { command: string; taskId: string; fromStatus: string; toStatus: string } | null {
  const command = (allowedTransitions[fromStatus] ?? []).find((transition) => transition.to === toStatus)?.command;
  if (!command) {
    return null;
  }

  return { command, taskId, fromStatus, toStatus };
}
