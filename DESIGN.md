# Fire — Application Design Document

## 1. Overview

A project management application with hierarchical task tracking, multiple view modes (Kanban, Timeline), LDAP-backed authentication, and a graph-database core. The stack is fully containerised.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 (Composition API, TypeScript) |
| Backend API | TypeScript on Bun.js |
| Database | Neo4j (Graph Database) |
| Auth | LDAP (read) + local profile overrides |
| Container | Docker / Docker Compose |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser Client                   │
│                  Vue 3 SPA (HTTPS)                  │
└──────────────────────┬──────────────────────────────┘
                       │ REST / WebSocket
┌──────────────────────▼──────────────────────────────┐
│               Bun.js API Server                     │
│   Auth · Projects · Tasks · Users · Permissions     │
└──────────────────────┬──────────────────────────────┘
          ┌────────────┴──────────────┐
          │                           │
┌─────────▼──────────┐     ┌─────────▼──────────┐
│   Neo4j Database   │     │   LDAP Directory   │
│  (Graph Store)     │     │  (Identity Source) │
└────────────────────┘     └────────────────────┘
```

All three application components (frontend, backend, Neo4j) are defined as individual Docker images and composed together via Docker Compose.

---

## 4. Data Model (Neo4j Graph)

### Node Types

| Label | Key Properties |
|---|---|
| `User` | `id`, `ldapDn`, `email`, `displayName` (override), `avatarUrl` (override) |
| `Project` | `id`, `name`, `description`, `createdAt` |
| `Task` | `id`, `title`, `description`, `type`, `status`, `estimatedStart`, `estimatedEnd`, `storyPoints` |
| `Role` | `name` (`admin`, `engineer`, `read-only`) |
| `Status` | `name` (`todo`, `in-progress`, `done`, …) |
| `Transition` | `fromStatus`, `toStatus`, `command` |

### Relationship Types

| Relationship | From → To | Properties |
|---|---|---|
| `MEMBER_OF` | `User → Project` | `role` |
| `ASSIGNED_TO` | `User → Task` | `assignedAt` |
| `CHILD_OF` | `Task → Task` | — |
| `BLOCKS` | `Task → Task` | — |
| `DEPENDS_ON` | `Task → Task` | — |
| `BELONGS_TO` | `Task → Project` | — |
| `HAS_STATUS` | `Task → Status` | `updatedAt` |
| `TRANSITION` | `Status → Status` | `command`, `requiredRole` |

### Hierarchy

Tasks are self-referential via `CHILD_OF`, allowing unlimited nesting depth. Queries traverse the graph to retrieve subtrees efficiently.

---

## 5. API Server (Bun.js / TypeScript)

### Responsibilities

- Serve all REST API routes (JSON)
- Authenticate requests via JWT (issued after LDAP bind)
- Enforce role-based access control per project
- Execute transition commands on status changes
- Serve the compiled Vue SPA static assets (production)

### Module Structure

```
src/
├── auth/
│   ├── ldap.ts          # LDAP bind & search
│   ├── jwt.ts           # Token issue & verify
│   └── middleware.ts    # Route auth guard
├── routes/
│   ├── auth.ts          # POST /auth/login, POST /auth/refresh
│   ├── users.ts         # GET/PATCH /users/:id (profile override)
│   ├── projects.ts      # CRUD /projects
│   ├── tasks.ts         # CRUD /projects/:id/tasks, GET /tasks/:id
│   ├── members.ts       # /projects/:id/members — role assignment
│   └── dashboard.ts     # GET /me/tasks — cross-project task list
├── services/
│   ├── neo4j.ts         # Driver singleton & query helpers
│   ├── tasks.ts         # Task graph queries & hierarchy traversal
│   ├── transitions.ts   # Status transition validation & command dispatch
│   └── permissions.ts   # Role capability checks
└── index.ts             # Server entry point, route registration
```

### Key API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | LDAP bind → issue JWT |
| `GET` | `/me/tasks` | Dashboard: all tasks assigned to current user |
| `GET` | `/projects` | List projects visible to current user |
| `POST` | `/projects` | Create project (admin) |
| `GET` | `/projects/:id/tasks` | Task tree for a project |
| `POST` | `/projects/:id/tasks` | Create task (engineer, admin) |
| `PATCH` | `/tasks/:id` | Update task fields |
| `PATCH` | `/tasks/:id/status` | Transition task status (runs command hook) |
| `POST` | `/tasks/:id/children` | Add child task |
| `GET` | `/projects/:id/members` | List members and roles |
| `PUT` | `/projects/:id/members/:userId` | Set member role |
| `PATCH` | `/users/:id/profile` | Override display name / avatar |

---

## 6. Frontend (Vue 3)

### Module Structure

```
src/
├── api/                  # Typed API client (fetch wrappers)
├── stores/               # Pinia stores (auth, projects, tasks, users)
├── router/               # Vue Router — route definitions & guards
├── views/
│   ├── Login.vue
│   ├── Dashboard.vue     # Personal task dashboard
│   ├── ProjectList.vue
│   └── project/
│       ├── Kanban.vue
│       ├── Timeline.vue
│       └── Settings.vue  # Members & roles
├── components/
│   ├── task/
│   │   ├── TaskCard.vue
│   │   ├── TaskDetail.vue
│   │   └── TaskTree.vue  # Recursive child display
│   ├── kanban/
│   │   ├── KanbanBoard.vue
│   │   └── KanbanColumn.vue
│   ├── timeline/
│   │   ├── TimelineView.vue
│   │   ├── TimelineRow.vue   # Expandable row per task
│   │   └── TimelineBar.vue   # Positioned date bar
│   └── common/
│       ├── UserAvatar.vue
│       └── RoleBadge.vue
└── main.ts
```

### View Modes

Each project supports multiple display modes selectable from a tab bar.

#### 6.1 Kanban Board

- Columns represent workflow statuses (e.g. **Todo**, **In Progress**, **Done**). Columns are configurable per project.
- Tasks are rendered as draggable cards (`TaskCard`).
- Drag-and-drop (via a library such as `vue-draggable-plus`) moves a task between columns, triggering a `PATCH /tasks/:id/status` call.
- On valid status transitions, the backend may dispatch a configured command (e.g. send notification, trigger webhook).
- Only users with the `engineer` or `admin` role may drag cards.

#### 6.2 Timeline View

- A horizontal time axis spans the top of the view. Scale (days / weeks / months) is user-selectable.
- Top-level tasks for the project are listed as rows beneath the axis.
- Each task renders a `TimelineBar` positioned and sized according to `estimatedStart` / `estimatedEnd`.
- Rows are collapsible/expandable to reveal child tasks in an indented sub-row, recursively.
- Bars are colour-coded by task status.
- Clicking a bar opens the `TaskDetail` side-panel.

#### 6.3 Personal Dashboard

- Aggregates all tasks assigned to the logged-in user across every project they are a member of.
- Groups by project, then by status.
- Links directly into the relevant project view.

---

## 7. Authentication & Permissions

### Authentication Flow

1. User submits credentials in the login form.
2. API server performs an LDAP bind with those credentials.
3. On success, a JWT (short-lived access token + refresh token) is issued and returned.
4. LDAP attributes (`cn`, `mail`) populate the `User` node on first login; subsequent logins refresh stale attributes.
5. Users may override `displayName` and `avatarUrl` in their local profile — these values take precedence over LDAP in the UI.

### Roles & Capabilities

| Capability | Read-Only | Engineer | Admin |
|---|:---:|:---:|:---:|
| View project & tasks | ✓ | ✓ | ✓ |
| Create tasks | | ✓ | ✓ |
| Edit task details | | ✓ | ✓ |
| Move tasks (Kanban drag) | | ✓ | ✓ |
| Assign users to tasks | | ✓ | ✓ |
| Manage project members | | | ✓ |
| Create / delete project | | | ✓ |
| Configure workflow & columns | | | ✓ |

Roles are stored as a property on the `MEMBER_OF` relationship between a `User` and a `Project`. Permission checks are enforced server-side on every mutating request.

---

## 8. Task Lifecycle & Transition Commands

Status transitions are defined per project as a directed graph. Each edge may carry an optional `command` string that the backend executes when the transition occurs.

Example workflow: `todo → in-progress → in-review → done`

A command can be any of:
- **Webhook** — HTTP POST to a configured URL with task context.
- **Notification** — In-app notification to assignee / watchers.
- **Field update** — Automatically set a field (e.g. `startedAt` when moving to `in-progress`).

The transition validator checks that the requesting user holds a role permitted to perform that specific transition before applying it.

---

## 9. Docker Setup

### Images

| Service | Base Image | Exposed Port |
|---|---|---|
| `api` | `oven/bun:latest` | `3000` |
| `web` | `node:lts-alpine` (build) → `nginx:alpine` (serve) | `80` |
| `neo4j` | `neo4j:5` | `7474`, `7687` |

### `docker-compose.yml` (outline)

```yaml
services:
  neo4j:
    image: neo4j:5
    environment:
      NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}
    volumes:
      - neo4j_data:/data
    ports:
      - "7474:7474"
      - "7687:7687"

  api:
    build: ./api
    environment:
      NEO4J_URI: bolt://neo4j:7687
      NEO4J_USER: neo4j
      NEO4J_PASSWORD: ${NEO4J_PASSWORD}
      LDAP_URL: ${LDAP_URL}
      LDAP_BIND_DN: ${LDAP_BIND_DN}
      LDAP_BIND_PASSWORD: ${LDAP_BIND_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - neo4j

  web:
    build: ./web
    environment:
      VITE_API_BASE_URL: ${API_BASE_URL}
    ports:
      - "8080:80"
    depends_on:
      - api

volumes:
  neo4j_data:
```

### Dockerfiles

**`api/Dockerfile`**
```dockerfile
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:latest
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["bun", "dist/index.js"]
```

**`web/Dockerfile`**
```dockerfile
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 10. Project Directory Structure

```
Fire/
├── api/
│   ├── src/
│   │   ├── auth/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── views/
│   │   └── main.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── DESIGN.md
```

---

## 11. Environment Variables

| Variable | Description |
|---|---|
| `NEO4J_PASSWORD` | Neo4j admin password |
| `LDAP_URL` | LDAP server URL (e.g. `ldap://ldap.example.com:389`) |
| `LDAP_BIND_DN` | Service account DN for LDAP searches |
| `LDAP_BIND_PASSWORD` | Service account password |
| `LDAP_BASE_DN` | Base DN for user searches |
| `JWT_SECRET` | Secret used to sign JWTs |
| `API_BASE_URL` | Public URL of the API (used by the Vue build) |

---

## 12. Key Design Decisions

- **Graph database**: Neo4j is chosen because the data is inherently relational — tasks reference other tasks (parent/child, blockers, dependencies), and users are linked to projects and tasks. Cypher queries make traversing these relationships natural and efficient compared to relational joins.
- **Bun.js**: Fast startup, built-in TypeScript support, and a batteries-included runtime reduce boilerplate in the API layer.
- **JWT over session cookies**: Stateless auth fits a containerised, potentially horizontally-scaled deployment. Refresh tokens allow short-lived access tokens without frequent re-authentication.
- **LDAP with local override**: Organisations typically own identity in LDAP. Allowing display name and avatar overrides lets users personalise without polluting the directory.
- **Recursive task hierarchy**: Storing the parent reference as a `CHILD_OF` graph edge allows variable-depth hierarchies to be retrieved with a single variable-length Cypher path query (`MATCH (t)-[:CHILD_OF*]->(root)`).
