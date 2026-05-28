<template>
  <div class="timeline-view">
    <!-- Month header row -->
    <div class="month-header">
      <div class="col-task-name"></div>
      <div class="col-assignee"></div>
      <div class="months" :style="timelineWidthStyle">
        <div v-for="month in months" :key="month.label" class="month-cell" :style="{ width: `${month.days * DAY_WIDTH}px` }">
          {{ month.label }}
        </div>
      </div>
    </div>
    <!-- Column labels + day numbers -->
    <div class="col-header">
      <div class="col-task-name">TASK NAME</div>
      <div class="col-assignee">ASSIGNEE</div>
      <div class="days-header" :style="timelineWidthStyle">
        <div v-for="day in days" :key="day" class="day-cell" :class="{ today: day === todayStr, weekend: isWeekend(day) }">
          {{ dayNum(day) }}
        </div>
        <div class="today-marker" :style="todayStyle"></div>
      </div>
    </div>
    <!-- Body rows -->
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
function toDate(value: string): Date { return new Date(`${value}T00:00:00`); }

const days = computed(() => {
  const allTasks = flatten(props.tasks);
  if (!allTasks.length) {
    // default: show 30 days from today
    const s = new Date(); s.setDate(s.getDate() - 5);
    const range: string[] = [];
    for (let i = 0; i < 30; i++) { const d = new Date(s); d.setDate(d.getDate() + i); range.push(d.toISOString().slice(0, 10)); }
    return range;
  }
  const start = toDate(allTasks.reduce((min, t) => (t.estimatedStart < min ? t.estimatedStart : min), allTasks[0].estimatedStart));
  const end = toDate(allTasks.reduce((max, t) => (t.estimatedEnd > max ? t.estimatedEnd : max), allTasks[0].estimatedEnd));
  start.setDate(start.getDate() - 2);
  end.setDate(end.getDate() + 4);
  const range: string[] = [];
  const cur = new Date(start);
  while (cur <= end) { range.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1); }
  return range;
});

const timelineWidthStyle = computed(() => ({ width: `${days.value.length * DAY_WIDTH}px` }));
const todayStr = new Date().toISOString().slice(0, 10);

function dayNum(value: string): string { return String(new Date(`${value}T00:00:00`).getDate()); }
function isWeekend(value: string): boolean { const d = new Date(`${value}T00:00:00`); return d.getDay() === 0 || d.getDay() === 6; }

const todayStyle = computed(() => {
  const index = days.value.findIndex((d) => d === todayStr);
  return index >= 0 ? { left: `${index * DAY_WIDTH + DAY_WIDTH / 2}px` } : { display: 'none' };
});

const months = computed(() => {
  const result: { label: string; days: number }[] = [];
  let cur = '';
  let count = 0;
  days.value.forEach((d) => {
    const label = new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (label !== cur) { if (cur) result.push({ label: cur, days: count }); cur = label; count = 1; }
    else count++;
  });
  if (cur) result.push({ label: cur, days: count });
  return result;
});
</script>

<style scoped>
.timeline-view { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff; }
.month-header, .col-header { display: flex; position: sticky; background: #f8fafc; z-index: 2; }
.month-header { border-bottom: 1px solid #e9eef4; top: 0; }
.col-header { border-bottom: 2px solid #e2e8f0; top: 0; }
.col-task-name { width: 320px; min-width: 320px; padding: 0.65rem 1rem; font-size: 0.72rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em; border-right: 1px solid #e9eef4; }
.col-assignee { width: 80px; min-width: 80px; padding: 0.65rem 0.5rem; font-size: 0.72rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em; border-right: 1px solid #e9eef4; text-align: center; }
.months { display: flex; flex-shrink: 0; }
.month-cell { border-left: 1px solid #e9eef4; padding: 0.5rem 0.75rem; font-size: 0.8rem; font-weight: 700; color: #1e293b; }
.days-header { position: relative; display: flex; flex-shrink: 0; }
.day-cell { width: 48px; min-width: 48px; padding: 0.55rem 0; border-left: 1px solid #e9eef4; font-size: 0.75rem; color: #64748b; text-align: center; font-weight: 600; }
.day-cell.today { color: #2563eb; font-weight: 800; }
.day-cell.weekend { background: #fafbfc; color: #94a3b8; }
.today-marker { position: absolute; top: 0; bottom: 0; width: 2px; background: #2563eb; z-index: 1; }
</style>
