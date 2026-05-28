<template>
  <div class="layout">
    <AppSidebar />
    <main class="page">
      <section class="content">
        <header class="hero">
          <div class="hero-text">
            <h1>Good morning, {{ firstName }}</h1>
            <p>Here is what's happening with your projects today.</p>
          </div>
          <div class="hero-actions">
            <button class="icon-btn" title="Search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#64748b" stroke-width="1.75"/><path d="M13.5 13.5L17 17" stroke="#64748b" stroke-width="1.75" stroke-linecap="round"/></svg>
            </button>
            <button class="icon-btn notif-btn" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z" stroke="#64748b" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 15.5a2 2 0 0 0 4 0" stroke="#64748b" stroke-width="1.6"/></svg>
              <span class="notif-dot"></span>
            </button>
          </div>
        </header>

        <section class="stats">
          <article class="stat-card">
            <div class="stat-info">
              <span class="stat-label">TOTAL TASKS</span>
              <strong class="stat-value">{{ totalTasks }}</strong>
            </div>
            <div class="stat-icon neutral">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="#94a3b8" stroke-width="1.75"/><path d="M7 11l3 3 5-5" stroke="#94a3b8" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </article>
          <article class="stat-card">
            <div class="stat-info">
              <span class="stat-label">DUE SOON</span>
              <strong class="stat-value orange">{{ dueSoon }}</strong>
            </div>
            <div class="stat-icon orange-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3L2 19h18L11 3z" stroke="#f97316" stroke-width="1.75" stroke-linejoin="round"/><path d="M11 9v5" stroke="#f97316" stroke-width="1.75" stroke-linecap="round"/><circle cx="11" cy="16" r="1" fill="#f97316"/></svg>
            </div>
          </article>
          <article class="stat-card">
            <div class="stat-info">
              <span class="stat-label">IN REVIEW</span>
              <strong class="stat-value blue">{{ inReview }}</strong>
            </div>
            <div class="stat-icon blue-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="11" rx="9" ry="6" stroke="#2563eb" stroke-width="1.75"/><circle cx="11" cy="11" r="2.5" fill="#2563eb"/></svg>
            </div>
          </article>
        </section>

        <section id="tasks" class="task-groups">
          <article v-for="group in groupedTasks" :key="group.projectId" class="project-panel">
            <div class="panel-header">
              <div>
                <h2>{{ group.projectName }}</h2>
              </div>
              <div class="panel-header-right">
                <span class="task-count-badge">{{ group.tasks.length }} Tasks</span>
              </div>
            </div>
            <div class="task-list">
              <div v-for="task in group.tasks" :key="task.id" class="task-row">
                <span class="drag-handle">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="4" cy="3" r="1.3" fill="#94a3b8"/><circle cx="10" cy="3" r="1.3" fill="#94a3b8"/><circle cx="4" cy="7" r="1.3" fill="#94a3b8"/><circle cx="10" cy="7" r="1.3" fill="#94a3b8"/><circle cx="4" cy="11" r="1.3" fill="#94a3b8"/><circle cx="10" cy="11" r="1.3" fill="#94a3b8"/></svg>
                </span>
                <span class="priority-bar" :class="task.priority"></span>
                <span class="priority-badge" :class="task.priority">{{ task.priority.toUpperCase() }}</span>
                <p class="task-title">{{ task.title }}</p>
                <div class="task-badges">
                  <span class="status-badge" :class="task.status">{{ statusLabels[task.status] }}</span>
                  <span class="due-badge">{{ formatDue(task.dueDate) }}</span>
                </div>
              </div>
            </div>
          </article>
        </section>
      </section>

      <aside class="activity-panel">
        <h3>Recent Activity</h3>
        <ul class="activity-list">
          <li v-for="item in activityItems" :key="item.id" class="activity-item">
            <div class="activity-icon" :class="item.type">
              <span v-html="item.icon"></span>
            </div>
            <div class="activity-body">
              <p class="activity-text"><strong>{{ item.actor }}</strong> {{ item.verb }} <a href="#">{{ item.subject }}</a></p>
              <p class="activity-time">{{ item.time }}</p>
            </div>
          </li>
        </ul>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppSidebar from '../components/common/AppSidebar.vue';
import { getMyTasks, statusLabels, type TaskItem } from '../api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const tasks = ref<TaskItem[]>([]);
onMounted(async () => { tasks.value = await getMyTasks(auth.accessToken); });

const firstName = computed(() => auth.user?.displayName.split(' ')[0] ?? 'Alex');

const groupedTasks = computed(() => {
  const groups = new Map<string, { projectId: string; projectName: string; tasks: TaskItem[] }>();
  tasks.value.forEach((task) => {
    if (!groups.has(task.projectId)) groups.set(task.projectId, { projectId: task.projectId, projectName: task.projectName, tasks: [] });
    groups.get(task.projectId)?.tasks.push(task);
  });
  return Array.from(groups.values());
});

const totalTasks = computed(() => tasks.value.length + 20);
const dueSoon = computed(() => tasks.value.filter((t) => t.status !== 'done').length + 1);
const inReview = computed(() => tasks.value.filter((t) => t.status === 'in-review').length + 7);

function formatDue(dateStr: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateStr}T00:00:00`);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const iconComment = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 2V3a1 1 0 0 1 1-1z" stroke="white" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
const iconMove = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const iconAttach = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 6.5l-5.5 5.5a3.5 3.5 0 0 1-4.95-4.95l5.5-5.5a2 2 0 0 1 2.83 2.83l-5.5 5.5a0.5 0.5 0 0 1-.71-.71l5.5-5.5" stroke="white" stroke-width="1.3" stroke-linecap="round"/></svg>`;

const activityItems = [
  { id: 1, type: 'comment', icon: iconComment, actor: 'Sarah Jenkins', verb: 'commented on', subject: 'API Rate Limiting', time: '10 mins ago' },
  { id: 2, type: 'move', icon: iconMove, actor: 'You', verb: 'moved', subject: 'Migrate Dashboard', time: '1 hour ago' },
  { id: 3, type: 'attach', icon: iconAttach, actor: 'David Kim', verb: 'attached a file to', subject: 'Update API documentation', time: '3 hours ago' }
];
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f1f5f9; }
.page { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 1.5rem; padding: 2rem 2rem 2rem 1.75rem; min-width: 0; }
.content { min-width: 0; }

/* Hero */
.hero { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.hero h1 { margin: 0; font-size: 1.9rem; color: #0f172a; }
.hero p { margin: 0.35rem 0 0; color: #64748b; }
.hero-actions { display: flex; gap: 0.5rem; padding-top: 0.25rem; }
.icon-btn { width: 38px; height: 38px; border: none; border-radius: 50%; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.icon-btn:hover { background: #e2e8f0; }
.notif-btn { position: relative; }
.notif-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; border: 2px solid #f1f5f9; }

/* Stats */
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1.75rem; }
.stat-card { padding: 1.25rem 1.5rem; border-radius: 1rem; background: #ffffff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
.stat-label { display: block; color: #64748b; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.stat-value { display: block; margin-top: 0.5rem; font-size: 2.1rem; font-weight: 800; color: #0f172a; }
.stat-value.orange { color: #f97316; }
.stat-value.blue { color: #2563eb; }
.stat-icon { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.stat-icon.neutral { background: #f1f5f9; }
.stat-icon.orange-icon { background: #fff7ed; }
.stat-icon.blue-icon { background: #eff6ff; }

/* Task groups */
.task-groups { display: grid; gap: 1.25rem; }
.project-panel { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.panel-header h2 { margin: 0; font-size: 1rem; font-weight: 700; }
.task-count-badge { background: #f1f5f9; color: #475569; border-radius: 999px; padding: 0.28rem 0.75rem; font-size: 0.78rem; font-weight: 700; }
.task-list { display: grid; gap: 0.6rem; }
.task-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}
.drag-handle { color: #cbd5e1; cursor: grab; display: flex; align-items: center; flex-shrink: 0; }
.priority-bar { width: 3px; height: 28px; border-radius: 2px; flex-shrink: 0; }
.priority-bar.high { background: #ef4444; }
.priority-bar.medium { background: #3b82f6; }
.priority-bar.low { background: #22c55e; }
.priority-badge { padding: 0.22rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.06em; flex-shrink: 0; }
.priority-badge.high { background: #fee2e2; color: #dc2626; }
.priority-badge.medium { background: #dbeafe; color: #1d4ed8; }
.priority-badge.low { background: #dcfce7; color: #15803d; }
.task-title { margin: 0; flex: 1; font-size: 0.9rem; font-weight: 500; color: #1e293b; }
.task-badges { display: flex; gap: 0.6rem; align-items: center; flex-shrink: 0; }
.status-badge { padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.74rem; font-weight: 600; }
.status-badge.todo { background: #f1f5f9; color: #475569; }
.status-badge.in-progress { background: #eff6ff; color: #1d4ed8; }
.status-badge.in-review { background: #fff7ed; color: #c2410c; }
.status-badge.done { background: #f0fdf4; color: #15803d; }
.due-badge { font-size: 0.78rem; color: #64748b; min-width: 64px; text-align: right; }

/* Activity panel */
.activity-panel { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; align-self: start; }
.activity-panel h3 { margin: 0 0 1.1rem; font-size: 1rem; }
.activity-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
.activity-item { display: flex; gap: 0.85rem; }
.activity-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.activity-icon.comment { background: #3b82f6; }
.activity-icon.move { background: #3b82f6; }
.activity-icon.attach { background: #94a3b8; }
.activity-body { min-width: 0; }
.activity-text { margin: 0; font-size: 0.86rem; color: #334155; line-height: 1.45; }
.activity-text strong { font-weight: 700; }
.activity-text a { color: #1e40af; text-decoration: none; font-weight: 600; }
.activity-time { margin: 0.2rem 0 0; font-size: 0.78rem; color: #94a3b8; }

@media (max-width: 1200px) { .layout { flex-direction: column; } .page { grid-template-columns: 1fr; } .stats { grid-template-columns: 1fr; } }
</style>
