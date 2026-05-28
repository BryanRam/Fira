<template>
  <aside class="sidebar">
    <div>
      <div class="brand">
        <div class="brand-mark"><span></span><span></span><span></span><span></span></div>
        <div>
          <p class="brand-title">JiraClone</p>
          <p class="brand-subtitle">ENGINEERING TEAM</p>
        </div>
      </div>
      <nav class="nav">
        <RouterLink v-for="item in navItems" :key="item.label" :to="item.to" class="nav-item" :class="{ active: isActive(item.to) }">
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
    <div class="profile" v-if="auth.user">
      <UserAvatar :name="auth.user.displayName" :src="auth.user.avatarUrl" :size="42" />
      <div>
        <p class="profile-name">{{ auth.user.displayName }}</p>
        <p class="profile-role">{{ auth.user.title }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import UserAvatar from './UserAvatar.vue';

const props = defineProps<{ currentProjectId?: string }>();
const route = useRoute();
const auth = useAuthStore();
const navItems = computed(() => [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Projects', to: '/projects' },
  { label: 'My Tasks', to: '/dashboard#tasks' },
  { label: 'Settings', to: props.currentProjectId ? `/projects/${props.currentProjectId}/settings` : '/projects' }
]);

function isActive(path: string): boolean {
  return route.fullPath === path || (path !== '/projects' && route.path.startsWith(path));
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-height: 100vh;
  padding: 1.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #eef2ff;
  border-right: 1px solid #e2e8f0;
}
.brand { display: flex; align-items: center; gap: 0.9rem; margin-bottom: 2rem; }
.brand-mark { width: 42px; height: 42px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.25rem; }
.brand-mark span { border-radius: 0.55rem; background: linear-gradient(135deg, #1e40af, #6366f1); }
.brand-title { margin: 0; font-size: 1rem; font-weight: 800; }
.brand-subtitle { margin: 0.15rem 0 0; color: #64748b; font-size: 0.74rem; letter-spacing: 0.12em; }
.nav { display: grid; gap: 0.45rem; }
.nav-item { padding: 0.85rem 1rem; border-radius: 0.95rem; color: #334155; text-decoration: none; font-weight: 600; }
.nav-item.active { background: #dbeafe; color: #1e40af; }
.profile { display: flex; align-items: center; gap: 0.85rem; padding: 0.9rem; border-radius: 1rem; background: rgba(255, 255, 255, 0.7); }
.profile-name { margin: 0; font-weight: 700; }
.profile-role { margin: 0.18rem 0 0; color: #64748b; font-size: 0.82rem; }
@media (max-width: 1024px) { .sidebar { width: 100%; min-height: auto; } }
</style>
