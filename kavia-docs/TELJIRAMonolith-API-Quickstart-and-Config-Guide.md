# TELJIRAMonolith API Quickstart and Configuration Guide

## Introduction

### Background
This guide helps developers and integrators quickly try the TELJIRA Monolith backend APIs, explore the OpenAPI documentation, authenticate, and call protected endpoints. It also catalogs environment variables and how they influence runtime components such as database connections, authentication, notifications, and webhooks.

### Scope
- Quickstart for running the backend, opening Swagger UI, and making authenticated requests
- Example API calls for common flows (auth, issues, notifications, automation, integrations)
- Configuration reference mapped to components that consume each variable

## Quickstart

### 1) Run the stack
- Copy env:
  - cd TELJIRAMonolith
  - cp .env.example .env
  - Update JWT_SECRET and PostgreSQL settings
- Install deps: npm install
- Database: npm run migrate && npm run seed
- Start backend: npm run dev
- Start frontend: npm run --prefix frontend dev

Endpoints:
- Swagger UI: http://localhost:3000/docs
- Health: GET http://localhost:3000/
- Frontend: http://localhost:5173

### 2) Register and Login
- Register
  - POST /api/auth/register
  - Body: { "email": "dev@example.com", "name": "Dev User", "password": "changeme123" }
- Login
  - POST /api/auth/login
  - Body: { "email": "dev@example.com", "password": "changeme123" }
- Copy token from response and use in Authorization: Bearer <token> header for protected routes.

### 3) Explore APIs via Swagger UI
- Visit /docs to view grouped tags (Auth, Issues, Boards, Sprints, Automation, Reports, Settings, Notifications, Integrations, RBAC).
- Try It Out to validate schemas and understand responses.
- For changes to routes/annotations, regenerate OpenAPI locally: npm run build:openapi.

## Common API Flows (Examples)

### Issues (MVP flow)
- Create issue
  - POST /api/issues
  - Body example:
    {
      "project_id": "PROJECT-UUID",
      "title": "Initial setup task",
      "description": "Create project skeleton"
    }
- Update fields
  - PATCH /api/issues/{id}
  - Body example:
    { "fields": { "status": "in_progress", "assignee_id": "USER-UUID" } }
- Transition status (MVP)
  - POST /api/issues/{id}/transition
  - Body example:
    { "to_status": "in_review" }

### Notifications
- Dispatch notification (requires permission notifications.send)
  - POST /api/notifications/dispatch
  - Body example:
    {
      "event_type": "issue.created",
      "recipients": [{ "email": "team@example.com", "user_socket_room": "project:PROJECT-UUID" }],
      "channels": ["email","in-app"],
      "data": { "issueKey": "ENG-1", "title": "Initial task" },
      "priority": "normal"
    }

### Automation
- List rules
  - GET /api/automation/rules
- Evaluate rules for an event
  - POST /api/automation/evaluate
  - Body example:
    {
      "type": "issue.created",
      "data": { "issue": { "key": "ENG-1", "priority": "P0" }, "project_id": "PROJECT-UUID" },
      "actor": { "id": "USER-UUID", "email": "dev@example.com" }
    }

### Integrations (Git and Chat)
- Link pull request to issue
  - POST /api/integrations/git/link-pr
  - Body example:
    {
      "issue_key": "ENG-1",
      "pr_url": "https://github.com/org/repo/pull/42"
    }
- Inbound chat webhook (Teams/Slack-style)
  - POST /api/integrations/chat/inbound
  - Body example:
    {
      "provider": "teams",
      "payload": { "text": "assign ENG-1 @alice" }
    }

## Using OpenAPI in Development

### View and Interact
- /docs provides Try It Out and token input UI (Authorize button for bearerAuth).
- Tags map to route files for quick code discovery.

### Keep Spec Fresh
- Add JSDoc @openapi blocks to new/changed routes.
- Use npm run build:openapi to regenerate the spec (generate_openapi.js).
- swagger.js scans ./src/routes/**/*.js and ./src/controllers/**/*.js for annotations.

## Configuration Reference

### Server and Security
- PORT: Express server port (default 3000)
- HOST: Bind address (0.0.0.0 recommended for dev containers)
- NODE_ENV: development|production; affects logging and security defaults
- APP_NAME, SITE_URL: Metadata used in logs or templates
- JWT_SECRET: Required for issuing/verifying JWTs
- JWT_EXPIRES_IN: Token TTL (e.g., 1h)
- COOKIE_SECRET: Used for CSRF cookie signing (when CSRF is enabled)
- PASSWORD_PEPPER: Optional; concatenated before hashing for extra security
- CSRF_COOKIE_NAME: CSRF token cookie name

Consumers:
- src/controllers/auth.js + src/services/auth.js (JWT, crypto)
- src/app.js (middleware and cookies)

### Database (PostgreSQL)
- PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
- PGSSLMODE: disable|require; when require, ssl: { rejectUnauthorized: false }

Consumers:
- src/db/index.js initializes Pool with these variables

### Identity (OIDC/SSO) [Optional]
- OIDC_ISSUER_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_REDIRECT_URI

Consumers:
- Future OIDC flows (reserved in .env.example)

### Notifications and Email
- NOTIFY_PROVIDER: provider selector (e.g., console in MVP)
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: email adapter settings
- FROM_EMAIL: default sender address

Consumers:
- src/services/notifications/dispatcher.js and adapters/emailAdapter.js

### Webhooks
- WEBHOOK_SECRET: HMAC verification for inbound webhooks

Consumers:
- src/services/integrations/git/service.js (validateSignature)
- Any inbound webhook handlers

## Troubleshooting

- Swagger UI not loading:
  - Ensure backend is running on PORT from .env and /docs route is reachable.
  - Confirm swagger.js exists and app.js mounts Swagger UI.
- Database errors:
  - Verify PG* variables and that the Postgres service is reachable.
  - Run migrations and seed scripts.
- JWT Unauthorized:
  - Verify Authorization header format: Bearer <token>.
  - Check JWT_SECRET and expiry.
- Permission denied (403):
  - Ensure your user has required permissions; review middleware/rbac and seed data.
- Notification delivery issues:
  - Start with NOTIFY_PROVIDER=console to validate flow.
  - Configure SMTP_* for email and verify channel adapters.

## Conclusion

### Summary
You can get productive quickly by starting the backend, authenticating via /api/auth/login, exploring APIs in /docs, and using the examples above to exercise core flows. Keep the OpenAPI spec up to date with JSDoc annotations and manage environment configuration via .env, using this guide as a reference for which components consume each variable.
