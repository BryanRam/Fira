<template>
  <div class="board">
    <KanbanColumn v-for="status in statuses" :key="status" :title="statusLabels[status]" :status="status" :tasks="tasksByStatus[status]" :dot-color="dotColors[status]" @dragstart="handleDragStart" @drop-status="handleDrop" @select-task="$emit('select-task', $event)" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { statusLabels, type TaskItem, type TaskStatus } from '../../api';
import KanbanColumn from './KanbanColumn.vue';

const props = defineProps<{ tasks: TaskItem[]; statuses: TaskStatus[] }>();
const emit = defineEmits<{
  (event: 'move-task', payload: { taskId: string; status: TaskStatus }): void;
  (event: 'select-task', task: TaskItem): void;
}>();
const draggingId = ref('');
const tasksByStatus = computed(() => props.statuses.reduce<Record<TaskStatus, TaskItem[]>>((groups, status) => {
  groups[status] = props.tasks.filter((task) => task.status === status);
  return groups;
}, { todo: [], 'in-progress': [], 'in-review': [], done: [] }));
const dotColors: Record<TaskStatus, string> = { todo: '#94a3b8', 'in-progress': '#2563eb', 'in-review': '#f97316', done: '#16a34a' };
function handleDragStart(taskId: string, dragEvent: DragEvent): void {
  draggingId.value = taskId;
  dragEvent.dataTransfer?.setData('text/plain', taskId);
}
function handleDrop(status: TaskStatus): void {
  if (!draggingId.value) return;
  emit('move-task', { taskId: draggingId.value, status });
  draggingId.value = '';
}
</script>

<style scoped>
.board { display: grid; grid-template-columns: repeat(4, minmax(280px, 1fr)); gap: 1rem; align-items: start; }
@media (max-width: 1200px) { .board { overflow-x: auto; padding-bottom: 0.5rem; } }
</style>
