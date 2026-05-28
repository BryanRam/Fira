<template>
  <ul class="task-tree">
    <li v-for="task in tasks" :key="task.id">
      <button v-if="task.children?.length" class="toggle" type="button" @click="toggle(task.id)">{{ expanded.has(task.id) ? '▾' : '▸' }}</button>
      <span v-else class="spacer"></span>
      <span class="title" @click="$emit('select', task)">{{ task.title }}</span>
      <TaskTree v-if="task.children?.length && expanded.has(task.id)" :tasks="task.children" @select="$emit('select', $event)" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TaskItem } from '../../api';

const props = defineProps<{ tasks: TaskItem[] }>();
defineEmits<{ (event: 'select', task: TaskItem): void }>();
const expanded = ref(new Set(props.tasks.filter((task) => task.children?.length).map((task) => task.id)));
function toggle(taskId: string): void {
  const next = new Set(expanded.value);
  if (next.has(taskId)) next.delete(taskId);
  else next.add(taskId);
  expanded.value = next;
}
</script>

<style scoped>
.task-tree { list-style: none; padding-left: 0.85rem; margin: 0.4rem 0 0; }
li { margin: 0.35rem 0; }
.toggle, .spacer { width: 1.2rem; display: inline-flex; justify-content: center; margin-right: 0.25rem; }
.toggle { border: none; background: transparent; cursor: pointer; }
.title { cursor: pointer; color: #1e293b; }
</style>
