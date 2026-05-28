export type DemoRole = "admin" | "engineer" | "read-only";
export type DemoStatus = "todo" | "in-progress" | "in-review" | "done";
export type DemoPriority = "high" | "medium" | "low";

export interface DemoUser {
  id: string;
  username: string;
  cn: string;
  mail: string;
  displayName: string;
  avatarUrl?: string;
}

export interface DemoProject {
  id: string;
  key: string;
  name: string;
  description: string;
  teamName: string;
  createdAt: string;
}

export interface DemoTask {
  id: string;
  issueId: string;
  projectId: string;
  parentId: string | null;
  title: string;
  description: string;
  type: string;
  status: DemoStatus;
  priority: DemoPriority;
  label: string;
  storyPoints: number;
  assigneeId: string;
  estimatedStart: string;
  estimatedEnd: string;
  dueDate: string;
}

export interface DemoMember {
  userId: string;
  projectId: string;
  role: DemoRole;
}

export const demoUsers: DemoUser[] = [
  {
    id: "user-alex",
    username: "alex",
    cn: "Alex Morgan",
    mail: "alex@example.com",
    displayName: "Alex Morgan",
    avatarUrl: ""
  },
  {
    id: "user-sam",
    username: "sam",
    cn: "Sam Lee",
    mail: "sam@example.com",
    displayName: "Sam Lee",
    avatarUrl: ""
  },
  {
    id: "user-jamie",
    username: "jamie",
    cn: "Jamie Chen",
    mail: "jamie@example.com",
    displayName: "Jamie Chen",
    avatarUrl: ""
  },
  {
    id: "user-maya",
    username: "maya",
    cn: "Maya Patel",
    mail: "maya@example.com",
    displayName: "Maya Patel",
    avatarUrl: ""
  },
  {
    id: "user-test-admin",
    username: "test-admin",
    cn: "Test Admin",
    mail: "test-admin@demo.local",
    displayName: "Test Admin",
    avatarUrl: ""
  },
  {
    id: "user-test-engineer",
    username: "test-engineer",
    cn: "Test Engineer",
    mail: "test-engineer@demo.local",
    displayName: "Test Engineer",
    avatarUrl: ""
  },
  {
    id: "user-test-readonly",
    username: "test-readonly",
    cn: "Test Read-Only",
    mail: "test-readonly@demo.local",
    displayName: "Test Read-Only",
    avatarUrl: ""
  }
];

export const demoProjects: DemoProject[] = [
  {
    id: "project-phoenix",
    key: "PHX",
    name: "Project Phoenix",
    description: "Core delivery board for the Engineering Team.",
    teamName: "Engineering Team",
    createdAt: "2024-10-01T09:00:00.000Z"
  },
  {
    id: "project-orbit",
    key: "ORB",
    name: "Orbit Analytics",
    description: "Telemetry and insights rollout for platform teams.",
    teamName: "Engineering Team",
    createdAt: "2024-09-15T09:00:00.000Z"
  }
];

export const demoTasks: DemoTask[] = [
  {
    id: "task-phx-12",
    issueId: "PHX-12",
    projectId: "project-phoenix",
    parentId: null,
    title: "Refine onboarding flow",
    description: "Polish first-run experience and improve activation messaging.",
    type: "story",
    status: "todo",
    priority: "high",
    label: "UX",
    storyPoints: 5,
    assigneeId: "user-alex",
    estimatedStart: "2024-10-15",
    estimatedEnd: "2024-10-20",
    dueDate: "2024-10-20"
  },
  {
    id: "task-phx-14",
    issueId: "PHX-14",
    projectId: "project-phoenix",
    parentId: null,
    title: "Implement audit logging",
    description: "Track project-level changes for compliance reviews.",
    type: "task",
    status: "todo",
    priority: "medium",
    label: "Backend",
    storyPoints: 3,
    assigneeId: "user-sam",
    estimatedStart: "2024-10-18",
    estimatedEnd: "2024-10-24",
    dueDate: "2024-10-24"
  },
  {
    id: "task-phx-16",
    issueId: "PHX-16",
    projectId: "project-phoenix",
    parentId: null,
    title: "Prepare rollout checklist",
    description: "Document release tasks and team approvals.",
    type: "task",
    status: "todo",
    priority: "low",
    label: "Ops",
    storyPoints: 2,
    assigneeId: "user-jamie",
    estimatedStart: "2024-10-21",
    estimatedEnd: "2024-10-25",
    dueDate: "2024-10-25"
  },
  {
    id: "task-phx-18",
    issueId: "PHX-18",
    projectId: "project-phoenix",
    parentId: null,
    title: "Build billing settings panel",
    description: "Create the billing and seats management interface.",
    type: "story",
    status: "in-progress",
    priority: "high",
    label: "Frontend",
    storyPoints: 8,
    assigneeId: "user-maya",
    estimatedStart: "2024-10-14",
    estimatedEnd: "2024-10-28",
    dueDate: "2024-10-28"
  },
  {
    id: "task-phx-19",
    issueId: "PHX-19",
    projectId: "project-phoenix",
    parentId: "task-phx-18",
    title: "Hook card drag interactions",
    description: "Connect kanban drag and drop interactions to the API.",
    type: "subtask",
    status: "in-progress",
    priority: "medium",
    label: "Frontend",
    storyPoints: 2,
    assigneeId: "user-alex",
    estimatedStart: "2024-10-16",
    estimatedEnd: "2024-10-22",
    dueDate: "2024-10-22"
  },
  {
    id: "task-phx-20",
    issueId: "PHX-20",
    projectId: "project-phoenix",
    parentId: null,
    title: "Security review for auth",
    description: "Finalize JWT and LDAP fallback behaviour for demo environments.",
    type: "task",
    status: "in-review",
    priority: "medium",
    label: "Security",
    storyPoints: 3,
    assigneeId: "user-sam",
    estimatedStart: "2024-10-12",
    estimatedEnd: "2024-10-19",
    dueDate: "2024-10-19"
  },
  {
    id: "task-phx-22",
    issueId: "PHX-22",
    projectId: "project-phoenix",
    parentId: null,
    title: "QA smoke tests",
    description: "Run smoke test matrix before release candidate promotion.",
    type: "task",
    status: "done",
    priority: "low",
    label: "QA",
    storyPoints: 2,
    assigneeId: "user-jamie",
    estimatedStart: "2024-10-10",
    estimatedEnd: "2024-10-13",
    dueDate: "2024-10-13"
  },
  {
    id: "task-phx-23",
    issueId: "PHX-23",
    projectId: "project-phoenix",
    parentId: null,
    title: "Stakeholder sign-off",
    description: "Capture final sign-off from operations and support.",
    type: "task",
    status: "done",
    priority: "medium",
    label: "Ops",
    storyPoints: 1,
    assigneeId: "user-maya",
    estimatedStart: "2024-10-08",
    estimatedEnd: "2024-10-11",
    dueDate: "2024-10-11"
  },
  {
    id: "task-orb-7",
    issueId: "ORB-7",
    projectId: "project-orbit",
    parentId: null,
    title: "Backfill data warehouse sync",
    description: "Catch the nightly warehouse sync up with retention policies.",
    type: "task",
    status: "in-review",
    priority: "high",
    label: "Data",
    storyPoints: 5,
    assigneeId: "user-alex",
    estimatedStart: "2024-10-17",
    estimatedEnd: "2024-10-27",
    dueDate: "2024-10-27"
  }
];

export const demoMembers: DemoMember[] = [
  { userId: "user-alex", projectId: "project-phoenix", role: "admin" },
  { userId: "user-sam", projectId: "project-phoenix", role: "engineer" },
  { userId: "user-jamie", projectId: "project-phoenix", role: "engineer" },
  { userId: "user-maya", projectId: "project-phoenix", role: "read-only" },
  { userId: "user-alex", projectId: "project-orbit", role: "engineer" },
  { userId: "user-maya", projectId: "project-orbit", role: "admin" },
  { userId: "user-test-admin", projectId: "project-phoenix", role: "admin" },
  { userId: "user-test-admin", projectId: "project-orbit", role: "admin" },
  { userId: "user-test-engineer", projectId: "project-phoenix", role: "engineer" },
  { userId: "user-test-engineer", projectId: "project-orbit", role: "engineer" },
  { userId: "user-test-readonly", projectId: "project-phoenix", role: "read-only" },
  { userId: "user-test-readonly", projectId: "project-orbit", role: "read-only" }
];

export function getDemoUser(userId: string): DemoUser | undefined {
  return demoUsers.find((user) => user.id === userId || user.username === userId);
}

export function getDemoProject(projectId: string): DemoProject | undefined {
  return demoProjects.find((project) => project.id === projectId);
}

export function getDemoTask(taskId: string): DemoTask | undefined {
  return demoTasks.find((task) => task.id === taskId);
}

export function getDemoProjectTasks(projectId: string): DemoTask[] {
  return demoTasks.filter((task) => task.projectId === projectId);
}

export function getDemoProjectMembers(projectId: string): Array<DemoMember & { user: DemoUser | undefined }> {
  return demoMembers
    .filter((member) => member.projectId === projectId)
    .map((member) => ({ ...member, user: getDemoUser(member.userId) }));
}
