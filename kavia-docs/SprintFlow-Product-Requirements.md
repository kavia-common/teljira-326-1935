# SprintFlow Product Requirements

## Introduction

### Background
SprintFlow is a configurable, Jira-like work management application designed to help teams plan, execute, and track delivery across projects, sprints, issues, and workflows. It emphasizes a fast, straightforward user experience with lower administrative overhead while delivering core enterprise capabilities such as RBAC, audit logging, accessibility, and export. The product is implemented as a monolithic web app (React frontend + Node/Express backend + PostgreSQL) and exposes REST APIs with Swagger documentation and basic real-time notifications via Socket.IO.

### Scope
This document outlines the product objectives, personas, functional and non-functional requirements, user journeys, and acceptance criteria for the MVP. It aligns with the initial implementation in this repository, focusing on features that already exist or have scaffolded endpoints.

## High-Level Functional Overview

### Vision and Objectives
SprintFlow aims to:
- Provide an intuitive, configurable alternative to Jira.
- Enable teams to manage backlog, sprints, boards, and issue workflows with minimal admin overhead.
- Offer robust search, automation, notifications, and reporting for execution and visibility.
- Deliver enterprise foundations: SSO (planned), RBAC, audit logging, accessibility (WCAG 2.2 AA), and data export.

### Key Features (MVP-Oriented)
- Authentication via email/password with JWT (SSO/OIDC planned).
- Role-based access control (permissions seed present; fine-grained mapping to be expanded).
- Projects and workspaces management.
- Issues CRUD with simple per-project key generation and updates.
- Sprints and boards scaffolding (create/list, patch state).
- Backlog listing and issue creation.
- Reports placeholder (summary counts).
- Settings placeholder (security and accessibility flags).
- Webhooks endpoint with HMAC verification.
- REST API with Swagger UI and dynamic server URL detection.
- Real-time events (project/issue/sprint) via Socket.IO.
- Audit logging for sensitive operations.

## Personas and Roles

### Personas
- Org Admin: Manages global settings, users, roles, and integrations.
- Project Admin / Product Owner: Configures project workflows, fields, boards; prioritizes backlog.
- Scrum Master: Runs sprints and ceremonies; tracks team reports.
- Developer / Engineer: Updates tasks, uses boards and filters.
- QA / Tester: Files and verifies bugs.
- Stakeholder / Viewer: Read-only dashboards and reports.
- External Client (optional): Restricted portal for intake and status.

### Roles and Permissions (Initial Seeds)
Seed roles: org_admin, project_admin, scrum_master, developer, qa, viewer.  
Seed permissions: user.read, user.write, project.read, project.write, issue.read, issue.write, sprint.read, sprint.write, board.read, board.write, settings.admin, rbac.manage.

Note: Current JWTs encode a minimal permission set. Future iterations should load permissions from DB and derive effective permissions per workspace/project membership.

## Use Cases and Flows

### Core Use Cases (MVP)
- Register and Login
  - Register via /api/auth/register; login via /api/auth/login to obtain JWT.
- Create Workspace and Project
  - Create workspace (settings.admin), then project (project.write) with key and type.
- Manage Issues
  - Create issues with title, project; list by project or sprint; update fields (status, assignee, points, etc.).
- Backlog and Sprint
  - View backlog (issues without sprint); create and update sprints; emit real-time events.
- Boards
  - Create boards (scrum/kanban) for a project; retrieve boards (placeholder logic to be expanded).
- Reports
  - Basic summary by project (count of issues).
- RBAC Administration
  - List roles and permissions (rbac.manage) for administration views.
- Settings and Webhooks
  - Retrieve admin settings (accessibility/security flags); receive and verify webhooks with optional HMAC.

### Sample Flow Narratives
- Project Setup
  - Org Admin creates a workspace; Project Admin creates a project. The system emits project:created via Socket.IO to the global room and logs the action in audit_logs.
- Issue Lifecycle
  - Developer creates a new issue in a project. An audit record is written; a project-scoped Socket.IO event issue:created is emitted. Issue is updated later (status/assignee). Audit recorded and issue:updated emitted.
- Sprint Management
  - Scrum Master creates a sprint and updates its state. The action is audited and broadcast to project subscribers.

## Functional Requirements

### Authentication and Sessions
- Email/password registration and login.
- JWT issuance with configurable expiry via environment variable.
- Request authentication via Bearer tokens (Authorization header).

### RBAC and Authorization
- Middleware enforcing permissions per route (requirePermissions).
- JWT may carry roles/permissions; future enhancements: derive from DB (role, role_permissions, user_teams, project scopes).

### Projects and Workspaces
- Create and list workspaces (settings.admin and project.read).
- Create and list projects within a workspace, with uniqueness of (workspace_id, key).

### Issues
- Create, list (filter by project/sprint), and patch attributes.
- Per-project incremental key generation (simple sequence).
- Audit creation and updates; emit Socket.IO events.

### Sprints
- Create sprints and patch sprint state (planned/started/completed, etc. as text).
- Audit sprint creation and state changes; emit events.

### Boards
- Create boards (scrum/kanban) with JSON config; list boards.
- Audit board creation.

### Backlog
- List issues where sprint_id is null (project backlog view).

### Reports
- Summary report placeholder for a project (issue counts).

### Settings
- Return static settings object including accessibility/security placeholders.

### Webhooks
- Accept inbound webhooks with optional HMAC signature verification.
- Return echo of payload; ensure DB layer is accessible.

## Non-Functional Requirements

### Security
- Helmet, rate limiting, CORS with allowlist, CSRF protection for browser requests without Authorization header.
- JWT signing with configurable expiry; password hashing using Argon2 with pepper.
- Audit trails for sensitive operations stored in audit_logs.

### Performance and Reliability (Targets)
- Reasonable defaults for pool size and timeouts; compression enabled; structured logging.
- Health endpoints for liveness/readiness; graceful shutdown with DB close.

### Accessibility
- Frontend uses semantic landmarks and labels; target WCAG 2.2 AA; continue adding keyboard navigation and ARIA where needed.

### Compliance and Privacy
- Audit logs retained as per policy; export/delete paths to be implemented; ensure GDPR readiness as scope grows.

## Acceptance Criteria (Illustrative)

### Create Project
- Given a logged-in user with project.write permission,
- When they POST a valid workspace_id, name, key,
- Then a project is created, audit is recorded, and project:created is broadcast.

### Create Issue
- Given a logged-in user with issue.write permission,
- When they POST project_id and title,
- Then an issue is created with a sequential key, audit is recorded, and issue:created is broadcast to project room.

### Update Issue
- Given a logged-in user with issue.write permission,
- When they PATCH fields (status, assignee_id, points, etc.),
- Then the issue is updated, audited, and issue:updated is broadcast.

## Open Questions and Future Enhancements
- Load effective permissions from DB and scopes; attach to JWT or compute per request.
- Workflow engine (statuses, transitions, validators/post-functions).
- Advanced search (JQL-like), notifications, and richer reports.
- SSO/OIDC, MFA, and API tokens.
- Attachments, comments, links, and history tables/endpoints.

## Appendix

### Core Endpoints (Illustrative, see API docs at /docs)
- Auth: POST /api/auth/register, POST /api/auth/login
- Workspaces: POST /api/workspaces, GET /api/workspaces
- Projects: POST /api/projects, GET /api/projects
- Issues: POST /api/issues, GET /api/issues, PATCH /api/issues/{id}
- Sprints: POST /api/sprints, PATCH /api/sprints/{id}/state
- Boards: POST /api/boards, GET /api/boards
- Backlog: GET /api/backlog?project_id=...
- RBAC: GET /api/rbac/roles, GET /api/rbac/permissions
- Reports: GET /api/reports/summary?project_id=...
- Settings: GET /api/settings
- Webhooks: POST /api/webhooks

