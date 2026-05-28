import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { createTask as createTaskRequest, getProjectTasks, updateTask as updateTaskRequest, updateTaskStatus, type TaskItem, type TaskStatus } from '../api';
import { useAuthStore } from './auth';

function flattenTasks(tasks: TaskItem[]): TaskItem[] {
  return tasks.flatMap((task) => [task, ...(task.children ? flattenTasks(task.children) : [])]);
}

export const useTasksStore = defineStore('tasks', () => {
  const tasksByProject = ref<Record<string, TaskItem[]>>({});
  const selectedTask = ref<TaskItem | null>(null);
  const loading = ref(false);
  const tasksMap = computed(() => tasksByProject.value);

  async function fetchProjectTasks(projectId: string): Promise<void> {
    const auth = useAuthStore();
    loading.value = true;
    try {
      tasksByProject.value[projectId] = await getProjectTasks(projectId, auth.accessToken);
    } finally {
      loading.value = false;
    }
  }

  async function createTask(projectId: string, payload: Partial<TaskItem>): Promise<TaskItem> {
    const auth = useAuthStore();
    const task = await createTaskRequest(projectId, payload, auth.accessToken);
    await fetchProjectTasks(projectId);
    return task;
  }

  async function updateTask(taskId: string, payload: Partial<TaskItem>): Promise<TaskItem> {
    const auth = useAuthStore();
    const task = await updateTaskRequest(taskId, payload, auth.accessToken);
    if (task.projectId) await fetchProjectTasks(task.projectId);
    return task;
  }

  async function moveTask(taskId: string, status: TaskStatus, projectId: string): Promise<TaskItem> {
    const auth = useAuthStore();
    const task = await updateTaskStatus(taskId, status, auth.accessToken);
    await fetchProjectTasks(projectId);
    return task;
  }

  function getFlatTasks(projectId: string): TaskItem[] {
    return flattenTasks(tasksByProject.value[projectId] ?? []);
  }

  return { tasksByProject, tasksMap, selectedTask, loading, fetchProjectTasks, createTask, updateTask, moveTask, getFlatTasks };
});
