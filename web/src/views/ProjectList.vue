<template>
  <div class="layout">
    <AppSidebar />
    <main class="page">
      <div class="header-row">
        <div><h1>Projects</h1><p>Browse active delivery spaces for the engineering organization.</p></div>
        <button type="button" @click="createDemoProject">+ New Project</button>
      </div>
      <section class="grid">
        <RouterLink v-for="project in store.projects" :key="project.id" :to="`/projects/${project.id}/kanban`" class="project-card">
          <span class="project-key">{{ project.key }}</span>
          <h2>{{ project.name }}</h2>
          <p>{{ project.description }}</p>
          <div class="project-stats"><span>{{ project.totalTasks }} tasks</span><span>{{ project.progress }}% progress</span></div>
        </RouterLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import AppSidebar from '../components/common/AppSidebar.vue';
import { useProjectsStore } from '../stores/projects';

const store = useProjectsStore();
onMounted(() => { void store.fetchProjects(); });
async function createDemoProject(): Promise<void> {
  await store.createProject({ key: 'NXT', name: 'Next Release Planning', description: 'Coordinate the next sprint planning and release readiness.' });
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8f9fa; }
.page { flex: 1; padding: 2rem; }
.header-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
h1, h2 { margin: 0; }
p { color: #64748b; }
button { padding: 0.9rem 1rem; border: none; border-radius: 0.95rem; background: #1e40af; color: #ffffff; font-weight: 700; cursor: pointer; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.project-card { padding: 1.4rem; border-radius: 1.2rem; background: #ffffff; border: 1px solid #e2e8f0; text-decoration: none; color: inherit; }
.project-key { display: inline-flex; margin-bottom: 0.75rem; padding: 0.35rem 0.7rem; border-radius: 999px; background: #dbeafe; color: #1e40af; font-size: 0.75rem; font-weight: 800; }
.project-stats { display: flex; justify-content: space-between; margin-top: 1rem; color: #475569; font-weight: 600; }
@media (max-width: 1024px) { .layout { flex-direction: column; } }
</style>
