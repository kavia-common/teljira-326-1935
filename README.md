# teljira-326-1935

SprintFlow Monolith (TELJIRAMonolith)

Getting started:
- Copy TELJIRAMonolith/.env.example to TELJIRAMonolith/.env and set variables.
- Run: cd TELJIRAMonolith
- Install deps: npm install
- Ensure PostgreSQL is running and reachable via .env
- Run migrations: npm run migrate
- Seed defaults: npm run seed
- Start backend: npm run dev
- Start frontend: npm run --prefix frontend dev
- Open frontend at http://localhost:5173
- API docs at http://localhost:3000/docs

Notes:
- JWT auth. Use /api/auth/register then /api/auth/login to get token.
- RBAC permissions are placeholder from seed; adjust in DB and wire to tokens.
- All actions send audit logs to audit_logs table.
- Socket.IO pushes simple events for created/updated entities.
- Accessibility: Semantic landmarks and form labels included; expand per WCAG 2.2 AA.

Debugging (VS Code):
- This repository now includes .vscode/launch.json and tasks.json to enable browser debugging in supported environments.
- Use the "Monolith: Full Stack (Backend + Frontend + Browser)" compound to:
  1) Start the frontend (Vite) dev server,
  2) Start the backend with Node inspector,
  3) Launch a Chrome debug session attached to http://localhost:5173.
- Alternatively, run "Backend: Node (Nodemon + Inspector)" or "Frontend: Vite dev server" individually, and use "Browser: Debug Chrome (Attach to http://localhost:5173)" to attach.
- If using a strictly web-based IDE that cannot spawn a native browser, the Chrome debug attach will still work if the environment supports a built-in browser preview. Otherwise, open the same workspace in VS Code Desktop.

Dependency update guides (external containers):
- Webhook Endpoint: see kavia-docs/WebhookEndpoint-Contributing-Dependency-Update.md and kavia-docs/WebhookEndpoint-Dependency-Update.md
- Notification Service: see kavia-docs/NotificationService-Dependency-Update.md
- Third-Party API: see kavia-docs/ThirdPartyAPI-Dependency-Update.md
- IdP: see kavia-docs/IdP-Contributing-Dependency-Update.md and kavia-docs/IdP-Dependency-Update.md

Monolith dependency update:
- See kavia-docs/TELJIRAMonolith-Dependency-Update.md for a reproducible procedure and compatibility notes.
