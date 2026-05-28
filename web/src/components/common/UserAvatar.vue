<template>
  <div class="avatar" :style="sizeStyle">
    <img v-if="src" :src="src" :alt="name" />
    <span v-else>{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ name: string; src?: string; size?: number }>();

const initials = computed(() => props.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase());
const sizeStyle = computed(() => ({ width: `${props.size ?? 36}px`, height: `${props.size ?? 36}px` }));
</script>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #1e40af, #6366f1);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
