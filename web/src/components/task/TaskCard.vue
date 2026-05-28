<template>
  <article class="task-card" draggable="true" @dragstart="handleDragStart" @click="$emit('select', task)">
    <div class="card-top">
      <span class="issue-id">{{ task.issueId }}</span>
      <span class="priority" :class="task.priority">{{ prioritySymbol }}</span>
    </div>
    <h4>{{ task.title }}</h4>
    <div class="meta-row">
      <span class="label-chip">{{ task.label }}</span>
      <span class="story-points">{{ task.storyPoints }}</span>
    </div>
    <div class="card-footer">
      <span class="due-date">{{ task.dueDate }}</span>
      <UserAvatar :name="task.assigneeName" :src="task.assigneeAvatarUrl" :size="28" />
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

const prioritySymbol = computed(() => {
  if (props.task.priority === 'high') return '⬤';
  if (props.task.priority === 'medium') return '◆';
  return '△';
});

function handleDragStart(event: DragEvent): void {
  emit('dragstart', props.task.id, event);
}
</script>

<style scoped>
.task-card { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 1rem; background: #ffffff; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06); cursor: grab; }
.card-top, .meta-row, .card-footer { display: flex; align-items: center; justify-content: space-between; }
.issue-id { color: #64748b; font-size: 0.76rem; font-weight: 700; }
h4 { margin: 0.85rem 0; font-size: 0.98rem; color: #0f172a; }
.label-chip { background: #eff6ff; color: #1e40af; border-radius: 999px; padding: 0.3rem 0.65rem; font-size: 0.75rem; font-weight: 700; }
.story-points { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; background: #eff6ff; color: #1e40af; font-size: 0.82rem; font-weight: 700; }
.priority.high { color: #dc2626; }
.priority.medium { color: #f97316; }
.priority.low { color: #16a34a; }
.due-date { color: #64748b; font-size: 0.75rem; font-weight: 600; }
</style>
