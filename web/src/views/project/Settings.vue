<template>
  <div class="layout">
    <AppSidebar :current-project-id="projectId" />
    <main class="page">
      <header class="page-header">
        <div><p class="eyebrow">Project Settings</p><h1>{{ project?.name }}</h1></div>
        <RouterLink :to="`/projects/${projectId}/kanban`" class="back-link">Back to board</RouterLink>
      </header>
      <section class="members-card">
        <div class="members-header">
          <div><h2>Project Members</h2><p>Adjust project-level roles for collaboration and approvals.</p></div>
        </div>
        <div class="member-list">
          <div v-for="member in members" :key="member.userId" class="member-row">
            <div class="member-meta">
              <UserAvatar :name="member.user.displayName" :src="member.user.avatarUrl" :size="42" />
              <div><strong>{{ member.user.displayName }}</strong><p>{{ member.user.title }}</p></div>
            </div>
            <div class="member-actions">
              <RoleBadge :role="member.role" />
              <select :value="member.role" @change="changeRole(member.userId, ($event.target as HTMLSelectElement).value as ProjectRole)">
                <option value="admin">Admin</option>
                <option value="engineer">Engineer</option>
                <option value="read-only">Read-only</option>
              </select>
              <button class="btn-remove" title="Remove member" @click="removeMember(member.userId)">Remove</button>
            </div>
          </div>
        </div>

        <div class="add-member">
          <h3>Add Member</h3>
          <div class="add-member-form">
            <select v-model="addUserId" class="add-select">
              <option value="" disabled>Select a user…</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">{{ user.displayName }}</option>
            </select>
            <select v-model="addRole" class="add-select">
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
              <option value="read-only">Read-only</option>
            </select>
            <button class="btn-add" :disabled="!addUserId" @click="addMember">Add to project</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { addProjectMember, getProjectMembers, listUsers, removeProjectMember, setMemberRole, type ProjectMember, type ProjectRole, type UserProfile } from '../../api';
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
const allUsers = ref<UserProfile[]>([]);
const addUserId = ref('');
const addRole = ref<ProjectRole>('engineer');

onMounted(async () => {
  await projectsStore.fetchProject(projectId);
  [members.value, allUsers.value] = await Promise.all([
    getProjectMembers(projectId, auth.accessToken),
    listUsers(auth.accessToken)
  ]);
});

const project = computed(() => projectsStore.currentProject);

const availableUsers = computed(() =>
  allUsers.value.filter((user) => !members.value.some((member) => member.userId === user.id))
);

async function changeRole(userId: string, role: ProjectRole): Promise<void> {
  members.value = await setMemberRole(projectId, userId, role, auth.accessToken);
}

async function removeMember(userId: string): Promise<void> {
  members.value = await removeProjectMember(projectId, userId, auth.accessToken);
}

async function addMember(): Promise<void> {
  if (!addUserId.value) return;
  members.value = await addProjectMember(projectId, addUserId.value, addRole.value, auth.accessToken);
  addUserId.value = '';
  addRole.value = 'engineer';
}
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8f9fa; }
.page { flex: 1; padding: 2rem; }
.page-header, .member-row, .member-meta, .member-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.eyebrow { margin: 0; color: #64748b; text-transform: uppercase; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; }
h1, h2, h3 { margin: 0; }
.back-link { color: #1e40af; text-decoration: none; font-weight: 700; }
.members-card { margin-top: 1.5rem; padding: 1.4rem; border-radius: 1.2rem; border: 1px solid #e2e8f0; background: #ffffff; }
.members-header p, .member-meta p { margin: 0.35rem 0 0; color: #64748b; }
.member-list { display: grid; gap: 1rem; margin-top: 1.2rem; }
.member-row { padding: 1rem; border-radius: 1rem; background: #f8fafc; }
select { padding: 0.75rem 0.9rem; border: 1px solid #cbd5e1; border-radius: 0.9rem; font: inherit; background: #ffffff; }
.btn-remove { padding: 0.5rem 1rem; border: 1px solid #fca5a5; border-radius: 0.75rem; background: #fff1f2; color: #b91c1c; font: inherit; font-weight: 600; cursor: pointer; }
.btn-remove:hover { background: #fee2e2; }
.add-member { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; }
.add-member h3 { margin-bottom: 0.85rem; font-size: 0.95rem; color: #334155; }
.add-member-form { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.add-select { padding: 0.75rem 0.9rem; border: 1px solid #cbd5e1; border-radius: 0.9rem; font: inherit; background: #ffffff; }
.btn-add { padding: 0.75rem 1.25rem; border: none; border-radius: 0.9rem; background: #1e40af; color: #ffffff; font: inherit; font-weight: 700; cursor: pointer; }
.btn-add:hover:not(:disabled) { background: #1d3fa0; }
.btn-add:disabled { opacity: 0.45; cursor: not-allowed; }
@media (max-width: 1024px) { .layout, .page-header, .member-row { flex-direction: column; align-items: stretch; } .add-member-form { flex-direction: column; align-items: stretch; } }
</style>
