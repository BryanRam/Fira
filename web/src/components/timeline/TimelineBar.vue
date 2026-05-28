<template>
  <div class="bar" :class="task.status" :style="barStyle">{{ task.issueId }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskItem } from '../../api';

const DAY_WIDTH = 48;
const props = defineProps<{ task: TaskItem; days: string[] }>();
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
.bar { position: absolute; top: 8px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid #cbd5e1; font-size: 0.75rem; font-weight: 700; }
.todo { background: #ffffff; color: #475569; }
.in-progress { background: #dbeafe; color: #1e40af; }
.in-review { background: #fff7ed; color: #c2410c; }
.done { background: #e2e8f0; color: #334155; }
</style>
