export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type ProjectRole = 'admin' | 'engineer' | 'read-only';

export interface UserProfile {
  id: string;
  username: string;
  cn: string;
  displayName: string;
  mail: string;
  title: string;
  avatarUrl?: string;
}

export interface ProjectSummary {
  id: string;
  key: string;
  name: string;
  description: string;
  teamName: string;
  progress: number;
  totalTasks: number;
  dueSoon: number;
  inReview: number;
}

export interface TaskItem {
  id: string;
  issueId: string;
  projectId: string;
  projectName: string;
  parentId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  label: string;
  storyPoints: number;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatarUrl?: string;
  dueDate: string;
  estimatedStart: string;
  estimatedEnd: string;
  activity?: string[];
  children?: TaskItem[];
}

export interface ProjectMember {
  userId: string;
  projectId: string;
  role: ProjectRole;
  user: UserProfile;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

interface RequestOptions extends RequestInit {
  token?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';
export const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'in-review', 'done'];
export const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done'
};

export const statusBadgeColors: Record<TaskStatus, string> = {
  todo: '#F1F5F9',
  'in-progress': '#EFF6FF',
  'in-review': '#FFF7ED',
  done: '#F0FDF4'
};

export const recentActivity = [
  'Alex moved PHX-20 into In Review.',
  'Sam updated billing settings acceptance criteria.',
  'Maya commented on ORB-7 about retention policies.',
  'Jamie completed PHX-22 smoke tests.'
];

const mockUsers: UserProfile[] = [
  { id: 'user-alex', username: 'alex', cn: 'Alex Morgan', displayName: 'Alex Morgan', mail: 'alex@example.com', title: 'Engineering Manager' },
  { id: 'user-sam', username: 'sam', cn: 'Sam Lee', displayName: 'Sam Lee', mail: 'sam@example.com', title: 'Frontend Engineer' },
  { id: 'user-jamie', username: 'jamie', cn: 'Jamie Chen', displayName: 'Jamie Chen', mail: 'jamie@example.com', title: 'QA Engineer' },
  { id: 'user-maya', username: 'maya', cn: 'Maya Patel', displayName: 'Maya Patel', mail: 'maya@example.com', title: 'Product Designer' }
];

const mockProjects: ProjectSummary[] = [
  { id: 'project-phoenix', key: 'PHX', name: 'Project Phoenix', description: 'Rebuild customer-facing workflows and ship the Q4 release candidate.', teamName: 'Engineering Team', progress: 68, totalTasks: 8, dueSoon: 3, inReview: 1 },
  { id: 'project-core-api', key: 'CORE', name: 'Core API', description: 'Expand telemetry reporting and data retention observability.', teamName: 'Engineering Team', progress: 42, totalTasks: 4, dueSoon: 2, inReview: 1 },
  { id: 'project-fe-refactor', key: 'FE', name: 'Frontend Refactor', description: 'Modernize CI pipelines and deployment visibility.', teamName: 'Engineering Team', progress: 54, totalTasks: 2, dueSoon: 1, inReview: 1 }
];

const mockTaskSeed: TaskItem[] = [
  // Kanban cards matching the screenshot
  { id: 'task-phx-12', issueId: 'PHX-12', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Design new navigation hierarchy for mobile app', description: 'Polish the first-run experience and improve activation messaging.', status: 'todo', priority: 'high', label: 'UI/UX', storyPoints: 3, assigneeId: 'user-alex', assigneeName: 'Alex Morgan', dueDate: '2024-10-20', estimatedStart: '2024-10-15', estimatedEnd: '2024-10-20', activity: ['Updated checklist', 'Clarified copy review notes'] },
  { id: 'task-phx-18', issueId: 'PHX-18', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Implement responsive grid for dashboard widgets', description: 'Create the billing and seats management interface.', status: 'todo', priority: 'medium', label: 'Frontend', storyPoints: 5, assigneeId: 'user-sam', assigneeName: 'Sam Lee', dueDate: '2024-10-28', estimatedStart: '2024-10-14', estimatedEnd: '2024-10-28' },
  { id: 'task-phx-22', issueId: 'PHX-22', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Update typography tokens in design system documentation', description: 'Run release candidate smoke testing across key browser paths.', status: 'todo', priority: 'low', label: 'Design', storyPoints: 1, assigneeId: 'user-jamie', assigneeName: 'Jamie Chen', dueDate: '2024-10-25', estimatedStart: '2024-10-21', estimatedEnd: '2024-10-25' },
  { id: 'task-phx-08', issueId: 'PHX-08', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Setup OAuth2 integration for enterprise clients', description: 'Finalize JWT and LDAP fallback behaviour for demo environments.', status: 'in-progress', priority: 'high', label: 'Backend', storyPoints: 8, assigneeId: 'user-alex', assigneeName: 'Alex Morgan', dueDate: '2024-10-22', estimatedStart: '2024-10-16', estimatedEnd: '2024-10-22' },
  { id: 'task-phx-15', issueId: 'PHX-15', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Create reusable shared components library', description: 'Connect the kanban drag-and-drop interaction to task state updates.', status: 'in-progress', priority: 'medium', label: 'System', storyPoints: 5, assigneeId: 'user-maya', assigneeName: 'Maya Patel', dueDate: '2024-10-19', estimatedStart: '2024-10-12', estimatedEnd: '2024-10-19' },
  { id: 'task-phx-05', issueId: 'PHX-05', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Fix infinite scroll bug on activity feed', description: 'Capture final approvals from operations and support.', status: 'in-review', priority: 'medium', label: 'Bug', storyPoints: 2, assigneeId: 'user-maya', assigneeName: 'Maya Patel', dueDate: '2024-10-11', estimatedStart: '2024-10-08', estimatedEnd: '2024-10-11' },
  { id: 'task-phx-01', issueId: 'PHX-01', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Initialize monorepo and build pipeline', description: 'Track project-level changes for compliance reviews.', status: 'done', priority: 'high', label: 'DevOps', storyPoints: 3, assigneeId: 'user-sam', assigneeName: 'Sam Lee', dueDate: '2024-10-24', estimatedStart: '2024-10-18', estimatedEnd: '2024-10-24' },
  { id: 'task-phx-02', issueId: 'PHX-02', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Define core color tokens and typography tokens', description: 'Document release tasks and approval owners.', status: 'done', priority: 'low', label: 'Design', storyPoints: 2, assigneeId: 'user-jamie', assigneeName: 'Jamie Chen', dueDate: '2024-10-13', estimatedStart: '2024-10-10', estimatedEnd: '2024-10-13' },
  // Timeline tasks with hierarchy (PHX-101 and PHX-200 epics)
  { id: 'task-phx-101', issueId: 'PHX-101', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Phase 1 Design', description: 'Phase 1 design work including wireframes and mockups.', status: 'in-progress', priority: 'high', label: 'Design', storyPoints: 13, assigneeId: 'user-alex', assigneeName: 'Alex S', dueDate: '2023-10-28', estimatedStart: '2023-10-13', estimatedEnd: '2023-10-28' },
  { id: 'task-phx-101a', issueId: '', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: 'task-phx-101', title: 'Wireframes', description: 'Create wireframes for all main screens.', status: 'done', priority: 'high', label: 'Design', storyPoints: 3, assigneeId: 'user-alex', assigneeName: 'Alex S', dueDate: '2023-10-17', estimatedStart: '2023-10-13', estimatedEnd: '2023-10-17' },
  { id: 'task-phx-101b', issueId: '', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: 'task-phx-101', title: 'High-fidelity Mockups', description: 'Create high-fidelity mockups.', status: 'in-progress', priority: 'high', label: 'Design', storyPoints: 8, assigneeId: 'user-jamie', assigneeName: 'J D', dueDate: '2023-10-28', estimatedStart: '2023-10-18', estimatedEnd: '2023-10-28' },
  { id: 'task-phx-200', issueId: 'PHX-200', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: null, title: 'Backend API', description: 'Backend API development.', status: 'todo', priority: 'high', label: 'Backend', storyPoints: 20, assigneeId: 'user-maya', assigneeName: 'M K', dueDate: '2023-11-01', estimatedStart: '2023-10-19', estimatedEnd: '2023-11-01' },
  { id: 'task-phx-200a', issueId: '', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: 'task-phx-200', title: 'Database Schema', description: 'Design and implement database schema.', status: 'todo', priority: 'medium', label: 'Backend', storyPoints: 5, assigneeId: 'user-maya', assigneeName: 'M K', dueDate: '2023-10-22', estimatedStart: '2023-10-19', estimatedEnd: '2023-10-22' },
  { id: 'task-phx-200b', issueId: '', projectId: 'project-phoenix', projectName: 'Project Phoenix', parentId: 'task-phx-200', title: 'Auth Endpoints', description: 'Implement authentication endpoints.', status: 'todo', priority: 'medium', label: 'Backend', storyPoints: 8, assigneeId: 'user-jamie', assigneeName: 'J D', dueDate: '2023-11-01', estimatedStart: '2023-10-23', estimatedEnd: '2023-11-01' },
  // Dashboard tasks
  { id: 'task-core-1', issueId: 'CORE-5', projectId: 'project-core-api', projectName: 'Core API', parentId: null, title: 'Implement rate limiting middleware', description: 'Add rate limiting to prevent API abuse.', status: 'in-progress', priority: 'high', label: 'Backend', storyPoints: 5, assigneeId: 'user-alex', assigneeName: 'Alex Morgan', dueDate: new Date().toISOString().slice(0, 10), estimatedStart: '2024-10-14', estimatedEnd: new Date().toISOString().slice(0, 10) },
  { id: 'task-core-2', issueId: 'CORE-8', projectId: 'project-core-api', projectName: 'Core API', parentId: null, title: 'Update API documentation for v2 endpoints', description: 'Document all new v2 API endpoints.', status: 'todo', priority: 'low', label: 'Docs', storyPoints: 2, assigneeId: 'user-alex', assigneeName: 'Alex Morgan', dueDate: '2024-10-24', estimatedStart: '2024-10-20', estimatedEnd: '2024-10-24' },
  { id: 'task-fe-1', issueId: 'FE-3', projectId: 'project-fe-refactor', projectName: 'Frontend Refactor', parentId: null, title: 'Migrate Dashboard to new Grid system', description: 'Update the dashboard layout to use the new grid system.', status: 'in-review', priority: 'medium', label: 'Frontend', storyPoints: 3, assigneeId: 'user-alex', assigneeName: 'Alex Morgan', dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })(), estimatedStart: '2024-10-17', estimatedEnd: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })() },
  { id: 'task-orb-7', issueId: 'ORB-7', projectId: 'project-core-api', projectName: 'Core API', parentId: null, title: 'Backfill data warehouse sync', description: 'Catch nightly warehouse sync up with retention policies.', status: 'in-review', priority: 'high', label: 'Data', storyPoints: 5, assigneeId: 'user-alex', assigneeName: 'Alex Morgan', dueDate: '2024-10-27', estimatedStart: '2024-10-17', estimatedEnd: '2024-10-27' }
];

const mockMembers: Record<string, ProjectMember[]> = {
  'project-phoenix': [
    { projectId: 'project-phoenix', userId: 'user-alex', role: 'admin', user: mockUsers[0] },
    { projectId: 'project-phoenix', userId: 'user-sam', role: 'engineer', user: mockUsers[1] },
    { projectId: 'project-phoenix', userId: 'user-jamie', role: 'engineer', user: mockUsers[2] },
    { projectId: 'project-phoenix', userId: 'user-maya', role: 'read-only', user: mockUsers[3] }
  ],
  'project-core-api': [
    { projectId: 'project-core-api', userId: 'user-alex', role: 'engineer', user: mockUsers[0] },
    { projectId: 'project-core-api', userId: 'user-maya', role: 'admin', user: mockUsers[3] }
  ],
  'project-fe-refactor': [
    { projectId: 'project-fe-refactor', userId: 'user-alex', role: 'engineer', user: mockUsers[0] },
    { projectId: 'project-fe-refactor', userId: 'user-sam', role: 'admin', user: mockUsers[1] },
    { projectId: 'project-fe-refactor', userId: 'user-jamie', role: 'engineer', user: mockUsers[2] }
  ]
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.token) {
    headers.set('Authorization', 'Bearer ' + options.token);
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers }).then(async (response) => {
    if (!response.ok) {
      const fallback = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(String(fallback.message ?? 'Request failed'));
    }
    return (await response.json()) as T;
  });
}

function enrichTask(task: TaskItem): TaskItem {
  const user = mockUsers.find((entry) => entry.id === task.assigneeId);
  const project = mockProjects.find((entry) => entry.id === task.projectId);
  return {
    ...task,
    assigneeName: user?.displayName ?? task.assigneeName,
    assigneeAvatarUrl: user?.avatarUrl,
    projectName: project?.name ?? task.projectName
  };
}

function buildTaskTree(projectId: string): TaskItem[] {
  const tasks = mockTaskSeed.filter((task) => task.projectId === projectId).map((task) => ({ ...enrichTask(task), children: [] as TaskItem[] }));
  const map = new Map(tasks.map((task) => [task.id, task]));
  const roots: TaskItem[] = [];

  tasks.forEach((task) => {
    if (task.parentId) {
      map.get(task.parentId)?.children?.push(task);
    } else {
      roots.push(task);
    }
  });

  return roots;
}

function findTask(taskId: string): TaskItem | undefined {
  return mockTaskSeed.find((task) => task.id === taskId);
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  if (useMockData) {
    const user = mockUsers.find((entry) => entry.username === username) ?? {
      id: `user-${username}`,
      username,
      cn: username,
      displayName: username,
      mail: `${username}@demo.local`,
      title: 'Engineer'
    };
    return { accessToken: `mock-access-${password.length}`, refreshToken: 'mock-refresh-token', user: clone(user) };
  }

  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function refreshToken(refreshTokenValue: string): Promise<{ accessToken: string; refreshToken: string }> {
  if (useMockData) {
    return { accessToken: `mock-access-${refreshTokenValue.length}`, refreshToken: refreshTokenValue };
  }

  return request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshTokenValue })
  });
}

export async function getProjects(token?: string): Promise<ProjectSummary[]> {
  if (useMockData) return clone(mockProjects);
  return request<ProjectSummary[]>('/projects', { token });
}

export async function getProject(id: string, token?: string): Promise<ProjectSummary> {
  if (useMockData) {
    const project = mockProjects.find((entry) => entry.id === id);
    if (!project) throw new Error('Project not found');
    return clone(project);
  }
  return request<ProjectSummary>(`/projects/${id}`, { token });
}

export async function createProject(payload: Partial<ProjectSummary>, token?: string): Promise<ProjectSummary> {
  if (useMockData) {
    const project: ProjectSummary = {
      id: `project-${crypto.randomUUID()}`,
      key: payload.key ?? 'NEW',
      name: payload.name ?? 'New Project',
      description: payload.description ?? '',
      teamName: payload.teamName ?? 'Engineering Team',
      progress: 0,
      totalTasks: 0,
      dueSoon: 0,
      inReview: 0
    };
    mockProjects.unshift(project);
    return clone(project);
  }
  return request<ProjectSummary>('/projects', { method: 'POST', token, body: JSON.stringify(payload) });
}

export async function getProjectTasks(projectId: string, token?: string): Promise<TaskItem[]> {
  if (useMockData) return clone(buildTaskTree(projectId));
  return request<TaskItem[]>(`/projects/${projectId}/tasks`, { token });
}

export async function createTask(projectId: string, payload: Partial<TaskItem>, token?: string): Promise<TaskItem> {
  if (useMockData) {
    const project = mockProjects.find((entry) => entry.id === projectId);
    const user = mockUsers.find((entry) => entry.id === payload.assigneeId) ?? mockUsers[0];
    const task: TaskItem = {
      id: crypto.randomUUID(),
      issueId: `${project?.key ?? 'PRJ'}-${mockTaskSeed.filter((entry) => entry.projectId === projectId).length + 24}`,
      projectId,
      projectName: project?.name ?? 'New Project',
      parentId: payload.parentId ?? null,
      title: payload.title ?? 'New issue',
      description: payload.description ?? 'Created from the demo board.',
      status: payload.status ?? 'todo',
      priority: payload.priority ?? 'medium',
      label: payload.label ?? 'General',
      storyPoints: payload.storyPoints ?? 1,
      assigneeId: user.id,
      assigneeName: user.displayName,
      dueDate: payload.dueDate ?? new Date().toISOString().slice(0, 10),
      estimatedStart: payload.estimatedStart ?? new Date().toISOString().slice(0, 10),
      estimatedEnd: payload.estimatedEnd ?? new Date().toISOString().slice(0, 10)
    };
    mockTaskSeed.push(task);
    return clone(enrichTask(task));
  }
  return request<TaskItem>(`/projects/${projectId}/tasks`, { method: 'POST', token, body: JSON.stringify(payload) });
}

export async function updateTask(taskId: string, payload: Partial<TaskItem>, token?: string): Promise<TaskItem> {
  if (useMockData) {
    const task = findTask(taskId);
    if (!task) throw new Error('Task not found');
    Object.assign(task, payload);
    return clone(enrichTask(task));
  }
  return request<TaskItem>(`/tasks/${taskId}`, { method: 'PATCH', token, body: JSON.stringify(payload) });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus, token?: string): Promise<TaskItem> {
  if (useMockData) {
    const task = findTask(taskId);
    if (!task) throw new Error('Task not found');
    task.status = status;
    return clone(enrichTask(task));
  }
  return request<TaskItem>(`/tasks/${taskId}/status`, { method: 'PATCH', token, body: JSON.stringify({ status }) });
}

export async function getTaskChildren(taskId: string): Promise<TaskItem[]> {
  return clone(mockTaskSeed.filter((task) => task.parentId === taskId).map(enrichTask));
}

export async function createChildTask(taskId: string, payload: Partial<TaskItem>, token?: string): Promise<TaskItem> {
  const parent = findTask(taskId);
  if (!parent) throw new Error('Parent task not found');
  return createTask(parent.projectId, { ...payload, parentId: taskId }, token);
}

export async function getProjectMembers(projectId: string, token?: string): Promise<ProjectMember[]> {
  if (useMockData) return clone(mockMembers[projectId] ?? []);
  return request<ProjectMember[]>(`/projects/${projectId}/members`, { token });
}

export async function setMemberRole(projectId: string, userId: string, role: ProjectRole, token?: string): Promise<ProjectMember[]> {
  if (useMockData) {
    const members = mockMembers[projectId] ?? [];
    const member = members.find((entry) => entry.userId === userId);
    if (member) member.role = role;
    return clone(members);
  }
  return request<ProjectMember[]>(`/projects/${projectId}/members/${userId}`, { method: 'PUT', token, body: JSON.stringify({ role }) });
}

export async function addProjectMember(projectId: string, userId: string, role: ProjectRole, token?: string): Promise<ProjectMember[]> {
  if (useMockData) {
    if (!mockMembers[projectId]) mockMembers[projectId] = [];
    const existing = mockMembers[projectId].find((entry) => entry.userId === userId);
    if (!existing) {
      const user = mockUsers.find((entry) => entry.id === userId);
      if (user) mockMembers[projectId].push({ projectId, userId, role, user });
    }
    return clone(mockMembers[projectId]);
  }
  return request<ProjectMember[]>(`/projects/${projectId}/members/${userId}`, { method: 'PUT', token, body: JSON.stringify({ role }) });
}

export async function removeProjectMember(projectId: string, userId: string, token?: string): Promise<ProjectMember[]> {
  if (useMockData) {
    if (mockMembers[projectId]) {
      mockMembers[projectId] = mockMembers[projectId].filter((entry) => entry.userId !== userId);
    }
    return clone(mockMembers[projectId] ?? []);
  }
  return request<ProjectMember[]>(`/projects/${projectId}/members/${userId}`, { method: 'DELETE', token });
}

export async function listUsers(token?: string): Promise<UserProfile[]> {
  if (useMockData) return clone(mockUsers);
  return request<UserProfile[]>('/users', { token });
}

export async function getMyTasks(token?: string): Promise<TaskItem[]> {
  if (useMockData) return clone(mockTaskSeed.filter((task) => task.assigneeId === 'user-alex').map(enrichTask));
  return request<TaskItem[]>('/me/tasks', { token });
}

export async function getUserProfile(userId: string, token?: string): Promise<UserProfile> {
  if (useMockData) {
    const user = mockUsers.find((entry) => entry.id === userId || entry.username === userId);
    if (!user) throw new Error('User not found');
    return clone(user);
  }
  return request<UserProfile>(`/users/${userId}`, { token });
}

export async function updateUserProfile(userId: string, payload: Partial<UserProfile>, token?: string): Promise<UserProfile> {
  if (useMockData) {
    const user = mockUsers.find((entry) => entry.id === userId || entry.username === userId);
    if (!user) throw new Error('User not found');
    Object.assign(user, payload);
    return clone(user);
  }
  return request<UserProfile>(`/users/${userId}/profile`, { method: 'PATCH', token, body: JSON.stringify(payload) });
}
