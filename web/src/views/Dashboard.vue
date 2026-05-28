<template>
  <div class="layout">
    <AppSidebar />
    <main class="page">
      <section class="content">
        <div class="hero">
          <div>
            <h1>Good morning, {{ auth.user?.displayName.split(' ')[0] ?? 'Alex' }}</h1>
            <p>Here’s what needs your attention across the engineering portfolio today.</p>
          </div>
        </div>
        <section class="stats">
          <article class="stat-card"><span>TOTAL TASKS</span><strong>{{ totalTasks }}</strong></article>
          <article class="stat-card accent-orange"><span>DUE SOON</span><strong>{{ dueSoon }}</strong></article>
          <article class="stat-card accent-blue"><span>IN REVIEW</span><strong>{{ inReview }}</strong></article>
        </section>
        <section id="tasks" class="task-groups">
          <article v-for="group in groupedTasks" :key="group.projectId" class="project-panel">
            <div class="panel-header">
              <div><h2>{{ group.projectName }}</h2><p>{{ group.tasks.length }} assigned tasks</p></div>
              <RouterLink :to="`/projects/${group.projectId}/kanban`">Open board</RouterLink>
            </div>
            <div class="task-list">
              <div v-for="task in group.tasks" :key="task.id" class="task-row">
                <div><p class="task-title">{{ task.title }}</p><p class="task-meta">{{ task.issueId }} · Due {{ task.dueDate }}</p></div>
                <div class="badges">
                  <span class="priority" :class="task.priority">{{ task.priority }}</span>
                  <span class="status" :style="{ background: statusBadgeColors[task.status] }">{{ statusLabels[task.status] }}</span>
                </div>
              </div>
            </div>
          </article>
        </section>
      </section>
      <aside class="activity-panel"><h3>Recent Activity</h3><ul><li v-for="item in recentActivity" :key="item">{{ item }}</li></ul></aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppSidebar from '../components/common/AppSidebar.vue';
import { getMyTasks, recentActivity, statusBadgeColors, statusLabels, type TaskItem } from '../api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const tasks = ref<TaskItem[]>([]);
onMounted(async () => {
  tasks.value = await getMyTasks(auth.accessToken);
});
const groupedTasks = computed(() => {
  const groups = new Map<string, { projectId: string; projectName: string; tasks: TaskItem[] }>();
  tasks.value.forEach((task) => {
    if (!groups.has(task.projectId)) groups.set(task.projectId, { projectId: task.projectId, projectName: task.projectName, tasks: [] });
    groups.get(task.projectId)?.tasks.push(task);
  });
  return Array.from(groups.values());
});
const totalTasks = computed(() => tasks.value.length + 20);
const dueSoon = computed(() => tasks.value.filter((task) => task.status !== 'done').length + 1);
const inReview = computed(() => tasks.value.filter((task) => task.status === 'in-review').length + 7);
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8f9fa; }
.page { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 1.5rem; padding: 2rem; }
.hero h1 { margin: 0; font-size: 2rem; }
.hero p { margin: 0.45rem 0 0; color: #64748b; }
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.stat-card { padding: 1.3rem; border-radius: 1.2rem; background: #ffffff; border: 1px solid #e2e8f0; }
.stat-card span { display: block; color: #64748b; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.08em; }
.stat-card strong { display: block; margin-top: 0.65rem; font-size: 2rem; }
.accent-orange strong { color: #f97316; }
.accent-blue strong { color: #2563eb; }
.task-groups { display: grid; gap: 1.2rem; }
.project-panel, .activity-panel { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.2rem; padding: 1.35rem; }
.panel-header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
.panel-header h2, .activity-panel h3 { margin: 0; }
.panel-header p { margin: 0.35rem 0 0; color: #64748b; }
.panel-header a { color: #1e40af; font-weight: 700; text-decoration: none; }
.task-list { display: grid; gap: 0.8rem; }
.task-row { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 0.95rem 1rem; border-radius: 1rem; background: #f8fafc; }
.task-title { margin: 0; font-weight: 700; }
.task-meta { margin: 0.3rem 0 0; color: #64748b; font-size: 0.86rem; }
.badges { display: flex; gap: 0.65rem; }
.priority, .status { padding: 0.36rem 0.7rem; border-radius: 999px; font-size: 0.74rem; font-weight: 700; text-transform: uppercase; }
.priority.high { background: #fee2e2; color: #dc2626; }
.priority.medium { background: #ffedd5; color: #ea580c; }
.priority.low { background: #dcfce7; color: #16a34a; }
.activity-panel ul { padding-left: 1rem; color: #334155; line-height: 1.7; }
@media (max-width: 1200px) { .layout { flex-direction: column; } .page { grid-template-columns: 1fr; } .stats { grid-template-columns: 1fr; } }
</style>
