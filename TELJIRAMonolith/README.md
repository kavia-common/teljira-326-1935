# TELJIRA Monolith - SprintFlow

SprintFlow is a monolithic, Jira-like work management application for projects, sprints, issues, and workflows. This codebase provides:
- Backend: Node.js (Express), PostgreSQL (Knex/Objection), JWT Auth, MFA (TOTP-ready), RBAC, audit logging, automation hooks, webhooks, plugin points, OpenAPI docs.
- Frontend: React (Vite), React Router, accessible components, boards, backlog, sprints, issue views, reports.
- Extensibility: REST API, webhook subscriptions, plugin registration.

Quick start
1) Copy .env.example to .env and fill in values (DB, JWT, etc.)
2) Install deps:
   cd TELJIRAMonolith
   npm install
   npm run setup (installs frontend and runs DB migrations/seed)
3) Run dev:
   npm run dev
   Backend: http://localhost:3001 ; Frontend: http://localhost:5173
4) API docs:
   Backend Swagger: http://localhost:3001/docs

Production
- Build frontend: npm run build:web
- Serve frontend via Express static: npm run start (serves API and static build)

Security/Compliance
- Do not commit .env (secrets). See .env.example for required variables.
- JWT signing using HS256; rotate keys periodically.
- Optional MFA TOTP support; enforce via policy.
- RBAC enforced via middleware and per-route permissions.
- Audit trail recorded for every mutating action.

License
- For demo/POC use. Extend as needed.
