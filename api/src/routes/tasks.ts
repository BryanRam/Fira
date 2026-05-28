import { json, readJson } from "../http";
import { demoTasks, getDemoTask } from "../services/demo";
import { runQuery } from "../services/neo4j";
import { canCreateTask, canEditTask, canMoveTask, type ProjectRole } from "../services/permissions";
import { getTaskById, getTaskTree } from "../services/tasks";
import { dispatchTransitionCommand, validateTransition } from "../services/transitions";

interface TaskBody {
  title: string;
  description: string;
  status?: "todo" | "in-progress" | "in-review" | "done";
  priority?: "high" | "medium" | "low";
  label?: string;
  storyPoints?: number;
  assigneeId?: string;
  estimatedStart?: string;
  estimatedEnd?: string;
  dueDate?: string;
}

export async function listProjectTasksRoute(projectId: string): Promise<Response> {
  return json(await getTaskTree(projectId));
}

export async function createProjectTaskRoute(projectId: string, request: Request, role: ProjectRole = "engineer"): Promise<Response> {
  if (!canCreateTask(role)) {
    return json({ message: "Forbidden." }, 403);
  }

  const payload = await readJson<TaskBody>(request);
  const issueSeed = demoTasks.filter((task) => task.projectId === projectId).length + 10;
  const prefix = projectId === "project-phoenix" ? "PHX" : "PRJ";
  const task = {
    id: crypto.randomUUID(),
    issueId: `${prefix}-${issueSeed}`,
    projectId,
    parentId: null,
    title: payload.title ?? "New task",
    description: payload.description ?? "",
    type: "task",
    status: payload.status ?? "todo",
    priority: payload.priority ?? "medium",
    label: payload.label ?? "General",
    storyPoints: payload.storyPoints ?? 1,
    assigneeId: payload.assigneeId ?? "user-alex",
    estimatedStart: payload.estimatedStart ?? new Date().toISOString().slice(0, 10),
    estimatedEnd: payload.estimatedEnd ?? new Date().toISOString().slice(0, 10),
    dueDate: payload.dueDate ?? new Date().toISOString().slice(0, 10)
  };

  demoTasks.push(task);
  return json(task, 201);
}

export async function getTaskRoute(taskId: string): Promise<Response> {
  const task = await getTaskById(taskId);
  return task ? json(task) : json({ message: "Task not found." }, 404);
}

export async function updateTaskRoute(taskId: string, request: Request, role: ProjectRole = "engineer"): Promise<Response> {
  if (!canEditTask(role)) {
    return json({ message: "Forbidden." }, 403);
  }

  const task = getDemoTask(taskId);
  if (!task) {
    return json({ message: "Task not found." }, 404);
  }

  const payload = await readJson<TaskBody>(request);
  task.title = payload.title ?? task.title;
  task.description = payload.description ?? task.description;
  task.priority = payload.priority ?? task.priority;
  task.label = payload.label ?? task.label;
  task.storyPoints = payload.storyPoints ?? task.storyPoints;
  task.assigneeId = payload.assigneeId ?? task.assigneeId;
  task.estimatedStart = payload.estimatedStart ?? task.estimatedStart;
  task.estimatedEnd = payload.estimatedEnd ?? task.estimatedEnd;
  task.dueDate = payload.dueDate ?? task.dueDate;
  return json(task);
}

export async function updateTaskStatusRoute(taskId: string, request: Request, role: ProjectRole = "engineer"): Promise<Response> {
  if (!canMoveTask(role)) {
    return json({ message: "Forbidden." }, 403);
  }

  const payload = await readJson<{ status: "todo" | "in-progress" | "in-review" | "done" }>(request);

  const currentTask = await getTaskById(taskId);
  if (!currentTask) {
    return json({ message: "Task not found." }, 404);
  }

  if (!payload.status || !validateTransition(currentTask.status, payload.status, role)) {
    return json({ message: "Invalid status transition." }, 400);
  }

  const previousStatus = currentTask.status;

  try {
    await runQuery(
      "MATCH (task:Task {id: $taskId}) SET task.status = $status",
      { taskId, status: payload.status }
    );
    const updated = await getTaskById(taskId);
    return json({ task: updated, command: dispatchTransitionCommand(taskId, previousStatus, payload.status) });
  } catch {
    const task = getDemoTask(taskId);
    if (task) {
      task.status = payload.status;
    }
    return json({ task: { ...currentTask, status: payload.status }, command: dispatchTransitionCommand(taskId, previousStatus, payload.status) });
  }
}

export async function deleteTaskRoute(taskId: string): Promise<Response> {
  const index = demoTasks.findIndex((task) => task.id === taskId);
  if (index === -1) {
    return json({ message: "Task not found." }, 404);
  }

  demoTasks.splice(index, 1);
  return json({ ok: true });
}

export async function createChildTaskRoute(taskId: string, request: Request, role: ProjectRole = "engineer"): Promise<Response> {
  if (!canCreateTask(role)) {
    return json({ message: "Forbidden." }, 403);
  }

  const parent = getDemoTask(taskId);
  if (!parent) {
    return json({ message: "Parent task not found." }, 404);
  }

  const payload = await readJson<TaskBody>(request);
  const child = {
    ...parent,
    id: crypto.randomUUID(),
    issueId: `${parent.issueId}-1`,
    parentId: parent.id,
    title: payload.title ?? `${parent.title} child`,
    description: payload.description ?? parent.description,
    type: "subtask",
    status: payload.status ?? "todo",
    priority: payload.priority ?? parent.priority,
    label: payload.label ?? parent.label,
    storyPoints: payload.storyPoints ?? 1,
    assigneeId: payload.assigneeId ?? parent.assigneeId,
    estimatedStart: payload.estimatedStart ?? parent.estimatedStart,
    estimatedEnd: payload.estimatedEnd ?? parent.estimatedEnd,
    dueDate: payload.dueDate ?? parent.dueDate
  };

  demoTasks.push(child);
  return json(child, 201);
}
