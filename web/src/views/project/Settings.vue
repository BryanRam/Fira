<template>
  <div class="layout">
    <AppSidebar :current-project-id="projectId" />
    <main class="page">
      <header class="page-header">
        <div><p class="eyebrow">Project Settings</p><h1>{{ project?.name }}</h1></div>
        <RouterLink :to="`/projects/${projectId}/kanban`" class="back-link">Back to board</RouterLink>
      </header>
      <section class="members-card">
        <div class="members-header"><div><h2>Project Members</h2><p>Adjust project-level roles for collaboration and approvals.</p></div></div>
        <div class="member-list">
          <div v-for="member in members" :key="member.userId" class="member-row">
            <div class="member-meta"><UserAvatar :name="member.user.displayName" :src="member.user.avatarUrl" :size="42" /><div><strong>{{ member.user.displayName }}</strong><p>{{ member.user.title }}</p></div></div>
            <div class="member-actions"><RoleBadge :role="member.role" /><select :value="member.role" @change="changeRole(member.userId, ($event.target as HTMLSelectElement).value as ProjectRole)"><option value="admin">Admin</option><option value="engineer">Engineer</option><option value="read-only">Read-only</option></select></div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getProjectMembers, setMemberRole, type ProjectMember, type ProjectRole } from '../../api';
import AppSidebar from '../../components/common/AppSidebar.vue';
import RoleBadge from '../../components/common/RoleBadge.vue';
import UserAvatar from '../../components/common/UserAvatar.vue';
import { useAuthStore } from '../../stores/auth';
import { useProjectsStore } from '../../stores/projects';

const props = defineProps<{ id: string }>();
const projectId = props.id;
const auth = useAuthStore();
const projectsStore = useProjectsStore();
const members = ref<ProjectMember[]>([]);
onMounted(async () => {
  await projectsStore.fetchProject(projectId);
  members.value = await getProjectMembers(projectId, auth.accessToken);
});
const project = computed(() => projectsStore.currentProject);
async function changeRole(userId: string, role: ProjectRole): Promise<void> {
  members.value = await setMemberRole(projectId, userId, role, auth.accessToken);
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8f9fa; }
.page { flex: 1; padding: 2rem; }
.page-header, .member-row, .member-meta, .member-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.eyebrow { margin: 0; color: #64748b; text-transform: uppercase; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; }
h1, h2 { margin: 0; }
.back-link { color: #1e40af; text-decoration: none; font-weight: 700; }
.members-card { margin-top: 1.5rem; padding: 1.4rem; border-radius: 1.2rem; border: 1px solid #e2e8f0; background: #ffffff; }
.members-header p, .member-meta p { margin: 0.35rem 0 0; color: #64748b; }
.member-list { display: grid; gap: 1rem; margin-top: 1.2rem; }
.member-row { padding: 1rem; border-radius: 1rem; background: #f8fafc; }
select { padding: 0.75rem 0.9rem; border: 1px solid #cbd5e1; border-radius: 0.9rem; font: inherit; background: #ffffff; }
@media (max-width: 1024px) { .layout, .page-header, .member-row { flex-direction: column; align-items: stretch; } }
</style>
