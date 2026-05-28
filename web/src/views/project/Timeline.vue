<template>
  <div class="layout">
    <AppSidebar :current-project-id="projectId" />
    <main class="page">
      <header class="project-header">
        <div><p class="eyebrow">Project planning</p><h1>{{ project?.name }}</h1></div>
        <div class="tabs">
          <RouterLink :to="`/projects/${projectId}/kanban`" class="tab">Kanban</RouterLink>
          <RouterLink :to="`/projects/${projectId}/timeline`" class="tab active">Timeline</RouterLink>
          <RouterLink :to="`/projects/${projectId}/settings`" class="tab">List</RouterLink>
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
import TaskDetail from '../../components/task/TaskDetail.vue';
import TimelineView from '../../components/timeline/TimelineView.vue';
import { useProjectsStore } from '../../stores/projects';
import { useTasksStore } from '../../stores/tasks';

const props = defineProps<{ id: string }>();
const projectId = props.id;
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const selectedTask = ref<TaskItem | null>(null);
onMounted(async () => { await Promise.all([projectsStore.fetchProject(projectId), tasksStore.fetchProjectTasks(projectId)]); });
const project = computed(() => projectsStore.currentProject);
const tasks = computed(() => tasksStore.tasksByProject[projectId] ?? []);
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8f9fa; }
.page { flex: 1; padding: 1.75rem; }
.project-header { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1.25rem; }
.eyebrow { margin: 0; color: #64748b; text-transform: uppercase; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; }
h1 { margin: 0.35rem 0 0; }
.tabs { display: flex; gap: 0.75rem; }
.tab { padding: 0.7rem 1rem; border-radius: 999px; text-decoration: none; color: #475569; font-weight: 700; }
.tab.active, .tab.router-link-active { background: #dbeafe; color: #1e40af; }
.timeline-shell { overflow: auto; }
@media (max-width: 1100px) { .layout { flex-direction: column; } .project-header { flex-direction: column; align-items: stretch; } }
</style>
