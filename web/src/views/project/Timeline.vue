<template>
  <div class="layout">
    <AppSidebar :current-project-id="projectId" />
    <main class="page">
      <header class="project-header">
        <div class="header-left">
          <span class="project-badge">{{ projectKey }}</span>
          <h1>{{ project?.name ?? 'Project' }}</h1>
          <nav class="tab-bar">
            <RouterLink :to="`/projects/${projectId}/kanban`" class="tab" active-class="tab-active">Kanban</RouterLink>
            <RouterLink :to="`/projects/${projectId}/timeline`" class="tab" active-class="tab-active">Timeline</RouterLink>
            <RouterLink :to="`/projects/${projectId}/settings`" class="tab" active-class="tab-active">List</RouterLink>
          </nav>
        </div>
        <div class="header-right">
          <button class="icon-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 0 0-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 0 0-5-5z" stroke="#475569" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 14.5a2 2 0 0 0 4 0" stroke="#475569" stroke-width="1.5"/></svg>
          </button>
          <button class="icon-btn" title="Help">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#475569" stroke-width="1.5"/><path d="M6.5 7a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="13.5" r="0.75" fill="#475569"/></svg>
          </button>
          <UserAvatar :name="auth.user?.displayName ?? 'Alex Morgan'" :src="auth.user?.avatarUrl" :size="36" />
        </div>
      </header>
      <section class="timeline-shell"><TimelineView :tasks="tasks" @select-task="selectedTask = $event" /></section>
    </main>
    <TaskDetail :task="selectedTask" @close="selectedTask = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { TaskItem } from '../../api';
import AppSidebar from '../../components/common/AppSidebar.vue';
import UserAvatar from '../../components/common/UserAvatar.vue';
import TaskDetail from '../../components/task/TaskDetail.vue';
import TimelineView from '../../components/timeline/TimelineView.vue';
import { useAuthStore } from '../../stores/auth';
import { useProjectsStore } from '../../stores/projects';
import { useTasksStore } from '../../stores/tasks';

const props = defineProps<{ id: string }>();
const projectId = props.id;
const auth = useAuthStore();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const selectedTask = ref<TaskItem | null>(null);
onMounted(async () => { await Promise.all([projectsStore.fetchProject(projectId), tasksStore.fetchProjectTasks(projectId)]); });
const project = computed(() => projectsStore.currentProject);
const projectKey = computed(() => project.value?.key ?? projectId.slice(0, 2).toUpperCase());
const tasks = computed(() => tasksStore.tasksByProject[projectId] ?? []);
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f1f5f9; }
.page { flex: 1; padding: 1.5rem 1.75rem; min-width: 0; }
.project-header { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.25rem; }
.header-left { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.project-badge { padding: 0.3rem 0.6rem; border-radius: 6px; background: #1e40af; color: #ffffff; font-size: 0.76rem; font-weight: 800; letter-spacing: 0.05em; flex-shrink: 0; }
h1 { margin: 0; font-size: 1.15rem; font-weight: 700; }
.tab-bar { display: flex; gap: 0.15rem; }
.tab { padding: 0.55rem 1rem; border-radius: 6px; color: #64748b; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
.tab:hover { background: #e2e8f0; color: #1e293b; }
.tab-active { color: #1e40af; background: transparent; border-bottom: 2px solid #1e40af; border-radius: 0; }
.header-right { display: flex; align-items: center; gap: 0.75rem; }
.icon-btn { width: 36px; height: 36px; border: none; border-radius: 50%; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.icon-btn:hover { background: #e2e8f0; }
.timeline-shell { overflow: auto; }
@media (max-width: 1100px) { .layout { flex-direction: column; } .project-header { flex-direction: column; align-items: stretch; } }
</style>
