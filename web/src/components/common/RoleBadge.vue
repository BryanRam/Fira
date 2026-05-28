<template>
  <span class="role-badge" :class="roleClass">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectRole } from '../../api';

const props = defineProps<{ role: ProjectRole }>();
const label = computed(() => (props.role === 'read-only' ? 'Read-only' : props.role.charAt(0).toUpperCase() + props.role.slice(1)));
const roleClass = computed(() => props.role);
</script>

<style scoped>
.role-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.32rem 0.72rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.admin { background: #dbeafe; color: #1e40af; }
.engineer { background: #e0f2fe; color: #0369a1; }
.read-only { background: #f1f5f9; color: #475569; }
</style>
