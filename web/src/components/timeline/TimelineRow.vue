<template>
  <div>
    <div class="row">
      <div class="task-cell" :style="{ paddingLeft: `${depth * 20 + 12}px` }">
        <button v-if="hasChildren" type="button" class="toggle" @click="expanded = !expanded">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path :d="expanded ? 'M2 4l4 4 4-4' : 'M4 2l4 4-4 4'" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span v-else class="toggle-spacer"></span>
        <span class="task-type-icon" :class="{ parent: hasChildren }">
          <svg v-if="hasChildren" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#1e40af" stroke-width="1.3"/>
            <path d="M4 7l2 2 4-4" stroke="#1e40af" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="#64748b" stroke-width="1.3"/>
            <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="#64748b" stroke-width="1.1" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="task-name" @click="$emit('select-task', task)">{{ task.issueId ? `${task.issueId} ${task.title}` : task.title }}</span>
      </div>
      <div class="assignee-cell">
        <UserAvatar :name="task.assigneeName" :src="task.assigneeAvatarUrl" :size="26" />
      </div>
      <div class="timeline-cell" :style="timelineWidthStyle" @click="$emit('select-task', task)">
        <div v-for="day in days" :key="day" class="grid-line"></div>
        <TimelineBar v-if="task.estimatedStart && task.estimatedEnd" :task="task" :days="days" />
      </div>
    </div>
    <TimelineRow
      v-for="child in childRows"
      :key="child.id"
      :task="child"
      :days="days"
      :depth="depth + 1"
      @select-task="$emit('select-task', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TaskItem } from '../../api';
import UserAvatar from '../common/UserAvatar.vue';
import TimelineBar from './TimelineBar.vue';

const DAY_WIDTH = 48;
const props = withDefaults(defineProps<{ task: TaskItem; days: string[]; depth?: number }>(), { depth: 0 });
defineEmits<{ (event: 'select-task', task: TaskItem): void }>();
const expanded = ref(true);
const hasChildren = computed(() => Boolean(props.task.children?.length));
const childRows = computed(() => (expanded.value ? props.task.children ?? [] : []));
const timelineWidthStyle = computed(() => ({ width: `${props.days.length * DAY_WIDTH}px` }));
</script>

<style scoped>
.row { display: grid; grid-template-columns: 320px 80px auto; min-height: 44px; border-bottom: 1px solid #e9eef4; }
.task-cell {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1rem;
  background: #ffffff;
  border-right: 1px solid #e9eef4;
}
.assignee-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem;
  background: #ffffff;
  border-right: 1px solid #e9eef4;
}
.timeline-cell { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 48px; cursor: pointer; }
.grid-line { border-left: 1px solid #f0f4f8; }
.toggle {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  color: #64748b;
  flex-shrink: 0;
}
.toggle:hover { color: #1e40af; }
.toggle-spacer { width: 20px; flex-shrink: 0; }
.task-type-icon { display: flex; align-items: center; flex-shrink: 0; }
.task-name { font-size: 0.86rem; font-weight: 500; color: #1e293b; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.task-name:hover { color: #1e40af; }
</style>
