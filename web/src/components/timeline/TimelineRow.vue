<template>
  <div>
    <div class="row">
      <div class="task-cell" :style="{ paddingLeft: `${depth * 20 + 12}px` }">
        <button v-if="task.children?.length" type="button" class="toggle" @click="expanded = !expanded">{{ expanded ? '▾' : '▸' }}</button>
        <span v-else class="toggle placeholder"></span>
        <span class="task-name" @click="$emit('select-task', task)">{{ task.title }}</span>
      </div>
      <div class="assignee-cell"><UserAvatar :name="task.assigneeName" :src="task.assigneeAvatarUrl" :size="28" /><span>{{ task.assigneeName }}</span></div>
      <div class="timeline-cell" :style="timelineWidthStyle" @click="$emit('select-task', task)">
        <div class="grid-line" v-for="day in days" :key="day"></div>
        <TimelineBar :task="task" :days="days" />
      </div>
    </div>
    <TimelineRow v-for="child in childRows" :key="child.id" :task="child" :days="days" :depth="depth + 1" @select-task="$emit('select-task', $event)" />
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
const childRows = computed(() => (expanded.value ? props.task.children ?? [] : []));
const timelineWidthStyle = computed(() => ({ width: `${props.days.length * DAY_WIDTH}px` }));
</script>

<style scoped>
.row { display: grid; grid-template-columns: 320px 180px auto; min-height: 48px; border-bottom: 1px solid #e2e8f0; }
.task-cell, .assignee-cell { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1rem; background: #ffffff; }
.timeline-cell { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 48px; cursor: pointer; }
.grid-line { border-left: 1px solid #e2e8f0; }
.toggle { border: none; background: transparent; cursor: pointer; color: #64748b; }
.placeholder { width: 18px; }
.task-name { font-weight: 600; color: #0f172a; cursor: pointer; }
</style>
