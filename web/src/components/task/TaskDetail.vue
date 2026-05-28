<template>
  <aside class="detail" v-if="task">
    <div class="detail-header">
      <div>
        <p class="issue-id">{{ task.issueId }}</p>
        <h3>{{ task.title }}</h3>
      </div>
      <button type="button" @click="$emit('close')">✕</button>
    </div>
    <div class="detail-grid">
      <div><span class="label">Status</span><strong>{{ statusLabel }}</strong></div>
      <div><span class="label">Priority</span><strong>{{ task.priority }}</strong></div>
      <div><span class="label">Label</span><strong>{{ task.label }}</strong></div>
      <div><span class="label">Story Points</span><strong>{{ task.storyPoints }}</strong></div>
      <div><span class="label">Assignee</span><strong>{{ task.assigneeName }}</strong></div>
      <div><span class="label">Due</span><strong>{{ task.dueDate }}</strong></div>
    </div>
    <section><span class="label">Description</span><p class="description">{{ task.description }}</p></section>
    <section v-if="task.activity?.length"><span class="label">Recent Updates</span><ul><li v-for="item in task.activity" :key="item">{{ item }}</li></ul></section>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { statusLabels, type TaskItem } from '../../api';

const props = defineProps<{ task: TaskItem | null }>();
defineEmits<{ (event: 'close'): void }>();
const statusLabel = computed(() => (props.task ? statusLabels[props.task.status] : ''));
</script>

<style scoped>
.detail { width: 320px; padding: 1.35rem; border-left: 1px solid #e2e8f0; background: #ffffff; overflow-y: auto; }
.detail-header { display: flex; justify-content: space-between; gap: 1rem; }
button { width: 32px; height: 32px; border: none; border-radius: 999px; background: #f1f5f9; cursor: pointer; }
.issue-id, .label { margin: 0; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
h3 { margin: 0.4rem 0 0; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.description { color: #334155; line-height: 1.6; }
ul { padding-left: 1rem; color: #334155; }
</style>
