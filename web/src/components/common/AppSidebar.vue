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
          <span class="nav-icon" v-html="item.icon"></span>
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
    <div v-if="auth.user" class="profile">
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

const iconDashboard = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor"/></svg>`;
const iconProjects = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="3" width="16" height="2.5" rx="1.25" fill="currentColor"/><rect x="1" y="7.75" width="16" height="2.5" rx="1.25" fill="currentColor"/><rect x="1" y="12.5" width="16" height="2.5" rx="1.25" fill="currentColor"/></svg>`;
const iconMyTasks = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 9l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const iconSettings = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.05 3.05l1.41 1.41M13.54 13.54l1.41 1.41M3.05 14.95l1.41-1.41M13.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const navItems = computed(() => [
  { label: 'Dashboard', to: '/dashboard', icon: iconDashboard },
  { label: 'Projects', to: '/projects', icon: iconProjects },
  { label: 'My Tasks', to: '/dashboard#tasks', icon: iconMyTasks },
  { label: 'Settings', to: props.currentProjectId ? `/projects/${props.currentProjectId}/settings` : '/projects', icon: iconSettings }
]);

function isActive(path: string): boolean {
  const cleanPath = path.split('#')[0];
  return route.path === cleanPath || (cleanPath !== '/projects' && route.path.startsWith(cleanPath));
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #eef2ff;
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.brand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
.brand-mark { width: 38px; height: 38px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.22rem; flex-shrink: 0; }
.brand-mark span { border-radius: 0.45rem; background: #1e40af; }
.brand-title { margin: 0; font-size: 1.05rem; font-weight: 800; color: #1e40af; }
.brand-subtitle { margin: 0.12rem 0 0; color: #64748b; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; }
.nav { display: grid; gap: 0.25rem; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-radius: 0.75rem;
  color: #475569;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: rgba(30, 64, 175, 0.07); color: #1e40af; }
.nav-item.active { background: #dbeafe; color: #1e40af; }
.nav-icon { display: flex; align-items: center; flex-shrink: 0; }
.profile { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.9rem; background: rgba(255, 255, 255, 0.75); border: 1px solid #e2e8f0; }
.profile-name { margin: 0; font-weight: 700; font-size: 0.88rem; }
.profile-role { margin: 0.1rem 0 0; color: #64748b; font-size: 0.76rem; }
@media (max-width: 1024px) { .sidebar { width: 100%; min-height: auto; flex-direction: row; flex-wrap: wrap; } }
</style>
