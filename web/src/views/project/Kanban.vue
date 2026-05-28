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
          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#94a3b8" stroke-width="1.5"/><path d="M11 11l3 3" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></svg>
            <input v-model="globalSearch" type="search" placeholder="Search" class="header-search" />
          </div>
          <button class="icon-btn" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 0 0-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 0 0-5-5z" stroke="#475569" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 14.5a2 2 0 0 0 4 0" stroke="#475569" stroke-width="1.5"/></svg>
          </button>
          <button class="icon-btn" title="Help">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#475569" stroke-width="1.5"/><path d="M6.5 7a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="13.5" r="0.75" fill="#475569"/></svg>
          </button>
          <UserAvatar :name="auth.user?.displayName ?? 'Alex Morgan'" :src="auth.user?.avatarUrl" :size="36" />
        </div>
      </header>

      <section class="toolbar">
        <div class="toolbar-left">
          <div class="search-wrap">
            <svg class="search-icon" width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#94a3b8" stroke-width="1.5"/><path d="M11 11l3 3" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></svg>
            <input v-model="search" type="search" placeholder="Search tasks..." class="toolbar-search" />
          </div>
          <button class="filter-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="2" stroke="#475569" stroke-width="1.3"/><circle cx="9" cy="9" r="2" stroke="#475569" stroke-width="1.3"/></svg>
            Assignee
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="#475569" stroke-width="1.3" stroke-linecap="round"/></svg>
          </button>
          <button class="filter-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="4" width="10" height="1.5" rx="0.75" fill="#475569"/><rect x="4" y="7" width="6" height="1.5" rx="0.75" fill="#475569"/><rect x="6" y="10" width="2" height="1.5" rx="0.75" fill="#475569"/></svg>
            Label
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="#475569" stroke-width="1.3" stroke-linecap="round"/></svg>
          </button>
        </div>
        <button type="button" class="create-button" @click="createIssue">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
          Create Issue
        </button>
      </section>

      <KanbanBoard :tasks="filteredTasks" :statuses="statusOrder" @move-task="handleMoveTask" @select-task="selectTask" />
    </main>
    <TaskDetail :task="tasksStore.selectedTask" @close="tasksStore.selectedTask = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getProjectMembers, statusOrder, type ProjectMember, type TaskItem, type TaskStatus } from '../../api';
import AppSidebar from '../../components/common/AppSidebar.vue';
import UserAvatar from '../../components/common/UserAvatar.vue';
import KanbanBoard from '../../components/kanban/KanbanBoard.vue';
import TaskDetail from '../../components/task/TaskDetail.vue';
import { useAuthStore } from '../../stores/auth';
import { useProjectsStore } from '../../stores/projects';
import { useTasksStore } from '../../stores/tasks';

const props = defineProps<{ id: string }>();
const projectId = props.id;
const auth = useAuthStore();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const search = ref('');
const globalSearch = ref('');
const members = ref<ProjectMember[]>([]);
onMounted(async () => {
  await Promise.all([projectsStore.fetchProject(projectId), tasksStore.fetchProjectTasks(projectId)]);
  members.value = await getProjectMembers(projectId, auth.accessToken);
});
const project = computed(() => projectsStore.currentProject);
const projectKey = computed(() => project.value?.key ?? projectId.slice(0, 2).toUpperCase());
const flatTasks = computed(() => tasksStore.getFlatTasks(projectId));
const filteredTasks = computed(() => {
  const query = `${search.value} ${globalSearch.value}`.trim().toLowerCase();
  return flatTasks.value.filter((task) => {
    return !query || `${task.issueId} ${task.title}`.toLowerCase().includes(query);
  });
});
function selectTask(task: TaskItem): void { tasksStore.selectedTask = task; }
async function handleMoveTask(payload: { taskId: string; status: TaskStatus }): Promise<void> { await tasksStore.moveTask(payload.taskId, payload.status, projectId); }
async function createIssue(): Promise<void> { await tasksStore.createTask(projectId, { title: 'New task', description: '', label: 'Design', priority: 'medium', status: 'todo' }); }
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f1f5f9; }
.page { flex: 1; padding: 1.5rem 1.75rem; overflow: auto; min-width: 0; }

/* Header */
.project-header { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding-bottom: 0; }
.header-left { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.project-badge { padding: 0.3rem 0.6rem; border-radius: 6px; background: #1e40af; color: #ffffff; font-size: 0.76rem; font-weight: 800; letter-spacing: 0.05em; flex-shrink: 0; }
h1 { margin: 0; font-size: 1.15rem; font-weight: 700; }
.tab-bar { display: flex; gap: 0.15rem; background: transparent; }
.tab { padding: 0.55rem 1rem; border-radius: 6px; color: #64748b; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
.tab:hover { background: #e2e8f0; color: #1e293b; }
.tab-active { color: #1e40af; background: transparent; border-bottom: 2px solid #1e40af; border-radius: 0; }
.header-right { display: flex; align-items: center; gap: 0.75rem; }
.search-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 10px; pointer-events: none; }
.header-search { padding: 0.6rem 1rem 0.6rem 2.25rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; font: inherit; font-size: 0.88rem; width: 240px; outline: none; }
.header-search:focus { border-color: #93c5fd; }
.icon-btn { width: 36px; height: 36px; border: none; border-radius: 50%; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.icon-btn:hover { background: #e2e8f0; }

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1.25rem 0 1.25rem; }
.toolbar-left { display: flex; gap: 0.65rem; align-items: center; }
.toolbar-search { padding: 0.65rem 1rem 0.65rem 2.25rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; font: inherit; font-size: 0.88rem; width: 200px; outline: none; }
.toolbar-search:focus { border-color: #93c5fd; }
.filter-btn { display: flex; align-items: center; gap: 0.45rem; padding: 0.6rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; color: #475569; font: inherit; font-size: 0.88rem; font-weight: 600; cursor: pointer; }
.filter-btn:hover { background: #f8fafc; }
.create-button { display: flex; align-items: center; gap: 0.45rem; padding: 0.65rem 1.1rem; border: none; border-radius: 8px; background: #1e40af; color: #ffffff; font: inherit; font-weight: 700; font-size: 0.88rem; cursor: pointer; white-space: nowrap; }
.create-button:hover { background: #1d3a9e; }

@media (max-width: 1200px) { .layout { flex-direction: column; } .project-header, .toolbar { flex-direction: column; align-items: stretch; } }
</style>
