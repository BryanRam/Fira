import { defineStore } from 'pinia';
import { ref } from 'vue';
import { createProject as createProjectRequest, getProject, getProjects, type ProjectSummary } from '../api';
import { useAuthStore } from './auth';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<ProjectSummary[]>([]);
  const currentProject = ref<ProjectSummary | null>(null);
  const loading = ref(false);

  async function fetchProjects(): Promise<void> {
    const auth = useAuthStore();
    loading.value = true;
    try {
      projects.value = await getProjects(auth.accessToken);
      if (!currentProject.value && projects.value.length > 0) currentProject.value = projects.value[0];
    } finally {
      loading.value = false;
    }
  }

  async function fetchProject(id: string): Promise<void> {
    const auth = useAuthStore();
    currentProject.value = await getProject(id, auth.accessToken);
  }

  async function createProject(payload: Partial<ProjectSummary>): Promise<ProjectSummary> {
    const auth = useAuthStore();
    const project = await createProjectRequest(payload, auth.accessToken);
    projects.value = [project, ...projects.value];
    currentProject.value = project;
    return project;
  }

  return { projects, currentProject, loading, fetchProjects, fetchProject, createProject };
});
