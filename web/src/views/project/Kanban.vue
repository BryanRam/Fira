<template>
  <div class="layout">
    <AppSidebar :current-project-id="projectId" />
    <main class="page">
      <header class="project-header">
        <div><p class="eyebrow">{{ project?.teamName }}</p><h1>{{ project?.name }}</h1></div>
        <div class="header-actions">
          <input v-model="globalSearch" type="search" placeholder="Search project" />
          <button type="button" class="icon-button">🔔</button>
          <UserAvatar :name="auth.user?.displayName ?? 'Alex Morgan'" :src="auth.user?.avatarUrl" :size="38" />
        </div>
      </header>
      <div class="tabs">
        <RouterLink :to="`/projects/${projectId}/kanban`" class="tab active">Kanban</RouterLink>
        <RouterLink :to="`/projects/${projectId}/timeline`" class="tab">Timeline</RouterLink>
        <RouterLink :to="`/projects/${projectId}/settings`" class="tab">List</RouterLink>
      </div>
      <section class="toolbar">
        <input v-model="search" type="search" placeholder="Search tasks" />
        <select v-model="assigneeFilter"><option value="">Assignee</option><option v-for="member in members" :key="member.userId" :value="member.userId">{{ member.user.displayName }}</option></select>
        <select v-model="labelFilter"><option value="">Label</option><option v-for="label in labels" :key="label" :value="label">{{ label }}</option></select>
        <button type="button" class="create-button" @click="createIssue">+ Create Issue</button>
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
const assigneeFilter = ref('');
const labelFilter = ref('');
const members = ref<ProjectMember[]>([]);
onMounted(async () => {
  await Promise.all([projectsStore.fetchProject(projectId), tasksStore.fetchProjectTasks(projectId)]);
  members.value = await getProjectMembers(projectId, auth.accessToken);
});
const project = computed(() => projectsStore.currentProject);
const flatTasks = computed(() => tasksStore.getFlatTasks(projectId));
const labels = computed(() => [...new Set(flatTasks.value.map((task) => task.label))]);
const filteredTasks = computed(() => {
  const query = `${search.value} ${globalSearch.value}`.trim().toLowerCase();
  return flatTasks.value.filter((task) => {
    const matchesSearch = !query || `${task.issueId} ${task.title} ${task.description}`.toLowerCase().includes(query);
    const matchesAssignee = !assigneeFilter.value || task.assigneeId === assigneeFilter.value;
    const matchesLabel = !labelFilter.value || task.label === labelFilter.value;
    return matchesSearch && matchesAssignee && matchesLabel;
  });
});
function selectTask(task: TaskItem): void { tasksStore.selectedTask = task; }
async function handleMoveTask(payload: { taskId: string; status: TaskStatus }): Promise<void> { await tasksStore.moveTask(payload.taskId, payload.status, projectId); }
async function createIssue(): Promise<void> { await tasksStore.createTask(projectId, { title: 'New dashboard polish task', description: 'Created directly from the Kanban board demo.', label: 'Design', priority: 'medium', status: 'todo' }); }
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8f9fa; }
.page { flex: 1; padding: 1.75rem; overflow: auto; }
.project-header, .toolbar, .header-actions, .tabs { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.eyebrow { margin: 0; color: #64748b; text-transform: uppercase; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; }
h1 { margin: 0.35rem 0 0; }
.tabs { justify-content: flex-start; margin: 1.4rem 0; }
.tab { padding: 0.7rem 1rem; border-radius: 999px; color: #475569; text-decoration: none; font-weight: 700; }
.tab.active, .tab.router-link-active { background: #dbeafe; color: #1e40af; }
.toolbar { margin-bottom: 1.25rem; }
input, select { padding: 0.82rem 1rem; border: 1px solid #cbd5e1; border-radius: 0.95rem; background: #ffffff; font: inherit; }
.header-actions input { min-width: 220px; }
.icon-button, .create-button { border: none; border-radius: 0.95rem; cursor: pointer; }
.icon-button { width: 42px; height: 42px; background: #ffffff; }
.create-button { padding: 0.82rem 1rem; background: #1e40af; color: #ffffff; font-weight: 700; }
@media (max-width: 1200px) { .layout { flex-direction: column; } .project-header, .toolbar { flex-direction: column; align-items: stretch; } }
</style>
