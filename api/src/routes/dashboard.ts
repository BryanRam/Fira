import { json } from "../http";
import { demoProjects, demoTasks, getDemoUser } from "../services/demo";

export async function getMyTasksRoute(userId: string): Promise<Response> {
  const tasks = demoTasks
    .filter((task) => task.assigneeId === userId)
    .map((task) => ({
      ...task,
      projectName: demoProjects.find((project) => project.id === task.projectId)?.name ?? "Unknown Project",
      assignee: getDemoUser(task.assigneeId)
    }));

  return json(tasks);
}
