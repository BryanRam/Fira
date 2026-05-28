<template>
  <article class="task-card" draggable="true" @dragstart="handleDragStart" @click="$emit('select', task)">
    <div class="card-top">
      <span class="issue-id">{{ task.issueId }}</span>
      <span class="priority-icon" :class="task.priority" v-html="priorityIcon"></span>
    </div>
    <h4>{{ task.title }}</h4>
    <div class="card-footer">
      <span class="label-chip">{{ task.label }}</span>
      <div class="meta-right">
        <span class="story-points">{{ task.storyPoints }}</span>
        <UserAvatar :name="task.assigneeName" :src="task.assigneeAvatarUrl" :size="26" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskItem } from '../../api';
import UserAvatar from '../common/UserAvatar.vue';

const props = defineProps<{ task: TaskItem }>();
const emit = defineEmits<{
  (event: 'dragstart', taskId: string, dragEvent: DragEvent): void;
  (event: 'select', task: TaskItem): void;
}>();

const priorityIcon = computed(() => {
  if (props.task.priority === 'high') {
    return `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3L3 8h8L7 3z" fill="#ef4444"/><path d="M7 7L3 12h8L7 7z" fill="#ef4444" opacity="0.4"/></svg>`;
  }
  if (props.task.priority === 'medium') {
    return `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="4" width="10" height="2.5" rx="1.25" fill="#f97316"/><rect x="2" y="7.5" width="10" height="2.5" rx="1.25" fill="#f97316" opacity="0.4"/></svg>`;
  }
  return `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 11L3 6h8L7 11z" fill="#22c55e"/><path d="M7 7L3 2h8L7 7z" fill="#22c55e" opacity="0.4"/></svg>`;
});

function handleDragStart(event: DragEvent): void {
  emit('dragstart', props.task.id, event);
}
</script>

<style scoped>
.task-card {
  padding: 0.9rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.05);
  cursor: grab;
  transition: box-shadow 0.15s;
}
.task-card:hover { box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1); }
.task-card:active { cursor: grabbing; }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; }
.issue-id { color: #64748b; font-size: 0.74rem; font-weight: 700; }
.priority-icon { display: flex; align-items: center; }
h4 { margin: 0 0 0.75rem; font-size: 0.9rem; font-weight: 500; color: #0f172a; line-height: 1.4; }
.card-footer { display: flex; align-items: center; justify-content: space-between; }
.label-chip { background: #eff6ff; color: #1e40af; border-radius: 6px; padding: 0.25rem 0.6rem; font-size: 0.72rem; font-weight: 700; }
.meta-right { display: flex; align-items: center; gap: 0.5rem; }
.story-points {
  width: 26px; height: 26px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
}
</style>
