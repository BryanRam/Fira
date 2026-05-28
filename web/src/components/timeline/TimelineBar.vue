<template>
  <div class="bar" :class="task.status" :style="barStyle">{{ statusLabel }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskItem } from '../../api';

const DAY_WIDTH = 48;
const props = defineProps<{ task: TaskItem; days: string[] }>();

const statusLabel = computed(() => {
  if (props.task.status === 'done') return 'Done';
  if (props.task.status === 'in-progress') return 'In Progress';
  if (props.task.status === 'in-review') return 'In Review';
  return 'To Do';
});

function dayIndex(date: string): number {
  return Math.max(props.days.findIndex((day) => day === date), 0);
}
const barStyle = computed(() => {
  const start = dayIndex(props.task.estimatedStart);
  const end = dayIndex(props.task.estimatedEnd);
  const width = Math.max((end - start + 1) * DAY_WIDTH, DAY_WIDTH);
  return { left: `${start * DAY_WIDTH}px`, width: `${width}px` };
});
</script>

<style scoped>
.bar {
  position: absolute;
  top: 8px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.todo { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; }
.in-progress { background: #2563eb; color: #ffffff; border: none; }
.in-review { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.done { background: #e2e8f0; color: #334155; border: none; }
</style>
