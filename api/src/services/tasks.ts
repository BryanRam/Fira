import { demoTasks, getDemoTask } from "./demo";
import { runQuery } from "./neo4j";

export interface TaskNode {
  id: string;
  issueId: string;
  projectId: string;
  parentId: string | null;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  label: string;
  storyPoints: number;
  assigneeId: string;
  estimatedStart: string;
  estimatedEnd: string;
  dueDate: string;
  children: TaskNode[];
}

function toTaskNode(task: Omit<TaskNode, "children">): TaskNode {
  return { ...task, children: [] };
}

export async function getTaskTree(projectId: string): Promise<TaskNode[]> {
  try {
    const result = await runQuery(
      `
      MATCH (project:Project {id: $projectId})<-[:BELONGS_TO]-(task:Task)
      OPTIONAL MATCH (task)-[:CHILD_OF]->(parent:Task)
      RETURN task, parent
      ORDER BY task.issueId
      `,
      { projectId }
    );

    const tasks = result.records.map((record) => {
      const task = record.get("task").properties as Record<string, string | number | null>;
      const parent = record.get("parent")?.properties as Record<string, string | null> | undefined;
      return toTaskNode({
        id: String(task.id),
        issueId: String(task.issueId),
        projectId: String(task.projectId),
        parentId: parent?.id ? String(parent.id) : null,
        title: String(task.title),
        description: String(task.description ?? ""),
        type: String(task.type ?? "task"),
        status: String(task.status ?? "todo"),
        priority: String(task.priority ?? "medium"),
        label: String(task.label ?? "General"),
        storyPoints: Number(task.storyPoints ?? 0),
        assigneeId: String(task.assigneeId ?? ""),
        estimatedStart: String(task.estimatedStart ?? ""),
        estimatedEnd: String(task.estimatedEnd ?? ""),
        dueDate: String(task.dueDate ?? ""),
        children: []
      });
    });

    return buildTree(tasks);
  } catch {
    const fallback = demoTasks
      .filter((task) => task.projectId === projectId)
      .map((task) => toTaskNode({ ...task, children: [] }));
    return buildTree(fallback);
  }
}

function buildTree(tasks: TaskNode[]): TaskNode[] {
  const map = new Map<string, TaskNode>();
  const roots: TaskNode[] = [];

  tasks.forEach((task) => {
    task.children = [];
    map.set(task.id, task);
  });

  tasks.forEach((task) => {
    if (task.parentId) {
      map.get(task.parentId)?.children.push(task);
    } else {
      roots.push(task);
    }
  });

  return roots;
}

export async function getTaskById(taskId: string): Promise<TaskNode | null> {
  try {
    const result = await runQuery("MATCH (task:Task {id: $taskId}) RETURN task LIMIT 1", { taskId });
    const record = result.records[0];
    if (!record) {
      return null;
    }
    const task = record.get("task").properties as Record<string, string | number | null>;
    return toTaskNode({
      id: String(task.id),
      issueId: String(task.issueId),
      projectId: String(task.projectId),
      parentId: task.parentId ? String(task.parentId) : null,
      title: String(task.title),
      description: String(task.description ?? ""),
      type: String(task.type ?? "task"),
      status: String(task.status ?? "todo"),
      priority: String(task.priority ?? "medium"),
      label: String(task.label ?? "General"),
      storyPoints: Number(task.storyPoints ?? 0),
      assigneeId: String(task.assigneeId ?? ""),
      estimatedStart: String(task.estimatedStart ?? ""),
      estimatedEnd: String(task.estimatedEnd ?? ""),
      dueDate: String(task.dueDate ?? ""),
      children: []
    });
  } catch {
    const fallback = getDemoTask(taskId);
    return fallback ? toTaskNode({ ...fallback, children: [] }) : null;
  }
}
