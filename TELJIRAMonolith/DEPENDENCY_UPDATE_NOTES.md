# TELJIRAMonolith — Dependency Update Results and Verification Notes

This document captures the procedure and verification notes for updating dependencies in the monolith (backend and frontend).

Updated via: npm-check-updates (ncu) + npm install

What to run locally (copy/paste):
1) Backend
   cd TELJIRAMonolith
   npm ci || npm install --no-audit --no-fund
   npx npm-check-updates -u
   npm install --no-audit --no-fund

2) Frontend
   cd TELJIRAMonolith/frontend
   npm ci || npm install --no-audit --no-fund
   npx npm-check-updates -u
   npm install --no-audit --no-fund

3) Validate
   # Backend
   cd ..   # to TELJIRAMonolith
   npm run lint || true
   CI=true npm test || true
   npm run dev

   # Frontend (separate terminal)
   npm --prefix frontend run dev

   # Open:
   - Frontend: http://localhost:5173
   - API docs: http://localhost:3000/docs

Breaking changes to manually verify after updates:
- express 5.x:
  - Middleware order and async error handling. Current handlers are compatible; verify error responses are consistent.
- express-rate-limit >=7/8:
  - Code already uses 'limit' and headers settings; no change needed, but ensure headers present.
- helmet >=7/8:
  - CSP disabled in dev (contentSecurityPolicy: false). In production, define CSP explicitly if needed.
- jsonwebtoken >=9:
  - Ensure 'subject' is string when signing. Current implementation uses payload.sub and passes through as subject; OK.
- csurf:
  - CSRF bypass when Authorization header present is preserved. Verify cookie options still applied.
- argon2:
  - Requires a compatible Node runtime (>=20 as per engines). If building from source on unusual platforms, ensure native build prerequisites.
- eslint 9+:
  - Flat configs already present (eslint.config.js for root and frontend). Verify lint still runs.
- swagger-jsdoc/swagger-ui-express:
  - Require usage maintained (CJS require). Confirm /docs loads and dynamic server URL logic still works.

Node.js engines alignment:
- package.json engines already set to ">=20.0.0" for both backend and frontend. Ensure your environment uses Node 20+.

Post-update quick checks:
- Register and login via /api/auth endpoints using the frontend (Login page).
- Create a workspace (requires settings.admin), a project (project.write), and an issue (issue.write) using API or UI after adjusting JWT permissions for testing.
- Confirm Socket.IO connects from frontend, and project:created alert shows when a new project is created.
- Review /docs renders and shows live server URL.

Security notes:
- Run `npm audit --production` and evaluate any high/critical advisories.
- Do not commit .env. Ensure JWT_SECRET, COOKIE_SECRET, DB vars are set in environment.

Commit guidance:
- Commit both package.json and package-lock.json for backend and frontend:
  - chore: update dependencies and refresh lock file (root)
  - chore: update dependencies and refresh lock file (frontend)
