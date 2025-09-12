# teljira-326-1935

SprintFlow Monolith (TELJIRAMonolith)

Getting started:
- Copy TELJIRAMonolith/.env.example to TELJIRAMonolith/.env and set variables (do not commit .env).
- Ensure PostgreSQL is running and reachable (create database and user from .env).
- Run: cd TELJIRAMonolith
- Install deps: npm install
- Run migrations: npm run migrate
- Seed defaults: npm run seed
- Start backend: npm run dev
- Start frontend: npm run --prefix frontend dev
- Open frontend at http://localhost:5173
- API docs at http://localhost:3000/docs

Default permissions to try the app:
- JWT auth. Use /api/auth/register then /api/auth/login to get token.
- Current login assigns a minimal set of permissions in the JWT (viewer-like): ['project.read', 'issue.read'].
- To use creation endpoints from the UI or API, you can either:
  1) Manually craft a token with broader permissions during development, or
  2) Temporarily update src/routes/modules/auth.js to include additional permissions in signJwt (e.g., project.write, issue.write, sprint.write, board.write, settings.admin), or
  3) Extend the auth flow to derive permissions from DB (roles/role_permissions) and include them in JWT payload.

Additional notes:
- RBAC enforcement is middleware-based; adjust JWT permissions to exercise protected endpoints.
- All sensitive actions are recorded in the audit_logs table.
- Socket.IO emits project/issue/sprint events for real-time UI updates.
- Accessibility: Semantic landmarks and labels are included; expand toward WCAG 2.2 AA across complex views.

Debugging (VS Code):
- This repository now includes .vscode/launch.json and tasks.json to enable browser debugging in supported environments.
- Use the "Monolith: Full Stack (Backend + Frontend + Browser)" compound to:
  1) Start the frontend (Vite) dev server,
  2) Start the backend with Node inspector,
  3) Launch a Chrome debug session attached to http://localhost:5173.
- Alternatively, run "Backend: Node (Nodemon + Inspector)" or "Frontend: Vite dev server" individually, and use "Browser: Debug Chrome (Attach to http://localhost:5173)" to attach.
- If using a strictly web-based IDE that cannot spawn a native browser, the Chrome debug attach will still work if the environment supports a built-in browser preview. Otherwise, open the same workspace in VS Code Desktop.

Dependency update guides (external containers):
- Webhook Endpoint: see kavia-docs/WebhookEndpoint-Contributing-Dependency-Update.md, kavia-docs/WebhookEndpoint-Contributing-Dependency-Update-Quickstart.md, kavia-docs/WebhookEndpoint-Dependency-Update.md, and kavia-docs/WebhookEndpoint-Dependency-Update-Notes.md
- Notification Service: see kavia-docs/NotificationService-Dependency-Update.md
- Third-Party API: see kavia-docs/ThirdPartyAPI-Dependency-Update.md and kavia-docs/ThirdPartyAPI-Contributing-Dependency-Update-Quickstart.md (script at kavia-docs/scripts/update-deps-third-party-api.sh)
- IdP: see kavia-docs/IdP-Contributing-Dependency-Update.md and kavia-docs/IdP-Dependency-Update.md

Monolith dependency update:
- See kavia-docs/TELJIRAMonolith-Dependency-Update.md for a reproducible procedure and compatibility notes.
