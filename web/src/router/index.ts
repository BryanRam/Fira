import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Login from '../views/Login.vue';
import ProjectList from '../views/ProjectList.vue';
import Kanban from '../views/project/Kanban.vue';
import Settings from '../views/project/Settings.vue';
import Timeline from '../views/project/Timeline.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'login', component: Login, meta: { public: true } },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/projects', name: 'projects', component: ProjectList },
    { path: '/projects/:id/kanban', name: 'project-kanban', component: Kanban, props: true },
    { path: '/projects/:id/timeline', name: 'project-timeline', component: Timeline, props: true },
    { path: '/projects/:id/settings', name: 'project-settings', component: Settings, props: true }
  ]
});

router.beforeEach((to) => {
  const accessToken = localStorage.getItem('fira_access_token');
  if (!to.meta.public && !accessToken) return '/login';
  if (to.path === '/login' && accessToken) return '/dashboard';
  return true;
});

export default router;
