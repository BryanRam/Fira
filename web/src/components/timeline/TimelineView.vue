<template>
  <div class="timeline-view">
    <div class="timeline-header">
      <div class="task-header">TASK NAME</div>
      <div class="assignee-header">ASSIGNEE</div>
      <div class="dates" :style="timelineWidthStyle">
        <span v-for="day in days" :key="day">{{ formatDay(day) }}</span>
        <div class="today-marker" :style="todayStyle"></div>
      </div>
    </div>
    <div class="timeline-body">
      <TimelineRow v-for="task in tasks" :key="task.id" :task="task" :days="days" @select-task="$emit('select-task', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskItem } from '../../api';
import TimelineRow from './TimelineRow.vue';

const DAY_WIDTH = 48;
const props = defineProps<{ tasks: TaskItem[] }>();
defineEmits<{ (event: 'select-task', task: TaskItem): void }>();
function flatten(tasks: TaskItem[]): TaskItem[] {
  return tasks.flatMap((task) => [task, ...(task.children ? flatten(task.children) : [])]);
}
function toDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
const days = computed(() => {
  const allTasks = flatten(props.tasks);
  const start = allTasks.length ? toDate(allTasks.reduce((min, task) => (task.estimatedStart < min ? task.estimatedStart : min), allTasks[0].estimatedStart)) : new Date();
  const end = allTasks.length ? toDate(allTasks.reduce((max, task) => (task.estimatedEnd > max ? task.estimatedEnd : max), allTasks[0].estimatedEnd)) : new Date();
  const current = new Date(start);
  const range: string[] = [];
  while (current <= end) {
    range.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return range;
});
const timelineWidthStyle = computed(() => ({ width: `${days.value.length * DAY_WIDTH}px` }));
function formatDay(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
const todayStyle = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  const index = Math.max(days.value.findIndex((day) => day === today), 0);
  return { left: `${index * DAY_WIDTH}px` };
});
</script>

<style scoped>
.timeline-view { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 1.25rem; background: #ffffff; }
.timeline-header { display: grid; grid-template-columns: 320px 180px auto; position: sticky; top: 0; background: #f8fafc; z-index: 1; border-bottom: 1px solid #e2e8f0; }
.task-header, .assignee-header { padding: 1rem; font-size: 0.74rem; font-weight: 800; color: #64748b; letter-spacing: 0.08em; }
.dates { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 48px; }
.dates span { padding: 1rem 0.3rem; border-left: 1px solid #e2e8f0; font-size: 0.72rem; color: #64748b; text-align: center; }
.today-marker { position: absolute; top: 0; bottom: 0; width: 2px; background: #2563eb; }
</style>
