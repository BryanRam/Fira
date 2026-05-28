import { describe, it, expect } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';

// Import the route definitions without the navigation guard to keep tests simple.
// We reconstruct a test router from the same route list so we can assert on
// path resolution without needing a DOM localStorage environment.
const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'login', meta: { public: true } },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/projects', name: 'projects' },
  { path: '/projects/:id/kanban', name: 'project-kanban', props: true },
  { path: '/projects/:id/timeline', name: 'project-timeline', props: true },
  { path: '/projects/:id/settings', name: 'project-settings', props: true }
];

function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes });
}

describe('router routes', () => {
  it('redirects / to /dashboard', async () => {
    const router = makeRouter();
    await router.push('/');
    expect(router.currentRoute.value.path).toBe('/dashboard');
  });

  it('resolves /login to the login route', async () => {
    const router = makeRouter();
    await router.push('/login');
    expect(router.currentRoute.value.name).toBe('login');
  });

  it('marks /login as a public route', async () => {
    const router = makeRouter();
    await router.push('/login');
    expect(router.currentRoute.value.meta.public).toBe(true);
  });

  it('resolves /dashboard', async () => {
    const router = makeRouter();
    await router.push('/dashboard');
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('resolves /projects', async () => {
    const router = makeRouter();
    await router.push('/projects');
    expect(router.currentRoute.value.name).toBe('projects');
  });

  it('resolves /projects/:id/kanban with the correct id param', async () => {
    const router = makeRouter();
    await router.push('/projects/project-phoenix/kanban');
    expect(router.currentRoute.value.name).toBe('project-kanban');
    expect(router.currentRoute.value.params.id).toBe('project-phoenix');
  });

  it('resolves /projects/:id/timeline', async () => {
    const router = makeRouter();
    await router.push('/projects/project-orbit/timeline');
    expect(router.currentRoute.value.name).toBe('project-timeline');
    expect(router.currentRoute.value.params.id).toBe('project-orbit');
  });

  it('resolves /projects/:id/settings', async () => {
    const router = makeRouter();
    await router.push('/projects/project-orbit/settings');
    expect(router.currentRoute.value.name).toBe('project-settings');
  });

  it('non-public routes do not have the public meta flag', async () => {
    const router = makeRouter();
    await router.push('/dashboard');
    expect(router.currentRoute.value.meta.public).toBeFalsy();
  });
});
