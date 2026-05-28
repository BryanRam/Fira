<template>
  <section class="column" @dragover.prevent @drop="emit('drop-status', status)">
    <header class="column-header">
      <div class="header-left">
        <span class="dot" :style="{ background: dotColor }"></span>
        <h3>{{ title }}</h3>
        <span class="count">{{ tasks.length }}</span>
      </div>
      <button type="button">⋯</button>
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
.column { min-width: 280px; padding: 1rem; border-radius: 1.2rem; background: #f8fafc; border: 1px solid #e2e8f0; }
.column-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.55rem; }
.dot { width: 10px; height: 10px; border-radius: 999px; }
h3 { margin: 0; font-size: 0.95rem; }
.count { color: #64748b; font-size: 0.82rem; }
button { border: none; background: transparent; color: #64748b; cursor: pointer; }
.cards { display: grid; gap: 0.9rem; }
</style>
