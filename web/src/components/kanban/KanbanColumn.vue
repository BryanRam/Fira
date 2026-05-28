<template>
  <section class="column" @dragover.prevent @drop="emit('drop-status', status)">
    <header class="column-header">
      <div class="header-left">
        <span class="dot" :style="{ background: dotColor }"></span>
        <h3>{{ title.toUpperCase() }}</h3>
        <span class="count">{{ tasks.length }}</span>
      </div>
      <button type="button" class="menu-btn" title="Column options">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1.25" fill="#94a3b8"/><circle cx="8" cy="8" r="1.25" fill="#94a3b8"/><circle cx="8" cy="13" r="1.25" fill="#94a3b8"/></svg>
      </button>
    </header>
    <div class="cards">
      <TaskCard v-for="task in tasks" :key="task.id" :task="task" @dragstart="handleDragStart" @select="emit('select-task', $event)" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TaskItem, TaskStatus } from '../../api';
import TaskCard from '../task/TaskCard.vue';

const props = defineProps<{ title: string; status: TaskStatus; tasks: TaskItem[]; dotColor: string }>();
const emit = defineEmits<{
  (event: 'drop-status', status: TaskStatus): void;
  (event: 'dragstart', taskId: string, dragEvent: DragEvent): void;
  (event: 'select-task', task: TaskItem): void;
}>();
function handleDragStart(taskId: string, dragEvent: DragEvent): void {
  emit('dragstart', taskId, dragEvent);
}
</script>

<style scoped>
.column { min-width: 270px; padding: 0.9rem; border-radius: 10px; background: #f8fafc; border: 1px solid #e9eef4; }
.column-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
.header-left { display: flex; align-items: center; gap: 0.55rem; }
.dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
h3 { margin: 0; font-size: 0.78rem; font-weight: 800; color: #475569; letter-spacing: 0.06em; }
.count { color: #94a3b8; font-size: 0.78rem; font-weight: 700; }
.menu-btn { border: none; background: transparent; cursor: pointer; padding: 0.25rem; display: flex; align-items: center; border-radius: 4px; }
.menu-btn:hover { background: #e2e8f0; }
.cards { display: grid; gap: 0.75rem; }
</style>
