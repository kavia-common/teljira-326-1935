# TELJIRAMonolith — Dependency Update Guide

Purpose
- Document a reproducible process to update dependencies for the SprintFlow Monolith (backend and frontend), refresh lockfiles, and commit with a standard message.
- Capture compatibility notes encountered during the latest update.

Repository Scope
- This guide applies to the repository: teljira-326-1935
- Monolith root: TELJIRAMonolith/
- Frontend app: TELJIRAMonolith/frontend

Prerequisites
- Node.js >= 18.18.0 (Current CI uses Node 18.20.x)
- npm >= 9 (10.x used at time of writing)
- Clean working tree (stash/commit your changes first)

Quick Steps (copy/paste)

1) Verify toolchain
   node -v
   npm -v

2) Bootstrap (from monolith root)
   cd TELJIRAMonolith
   # If lock is out of sync, prefer install to regenerate it
   npm ci || npm install --no-audit --no-fund

3) Update backend dependencies
   # Use npm-check-updates (ncu) to bump ranges in package.json
   npx npm-check-updates -u
   # Install to refresh package-lock.json
   npm install --no-audit --no-fund

4) Commit backend update
   git add package.json package-lock.json
   git commit -m "chore: update dependencies and refresh lock file (root)"

5) Update frontend dependencies
   cd frontend
   npx npm-check-updates -u
   npm install --no-audit --no-fund
   git add package.json package-lock.json
   git commit -m "chore: update dependencies and refresh lock file (frontend)"

6) Optional: Audit, lint, test (best-effort)
   cd ..
   npm audit --production || true
   npm run lint || true
   CI=true npm test || true

Engine and Compatibility Notes
- Node Engine:
  - Root currently specifies "engines": { "node": ">=18.18.0" }.
  - Recent frontend updates (Vite 7, @vitejs/plugin-react 5, react-router-dom 7) indicate Node >= 20 requirement in their engines fields.
  - If your environment runs Node 18, npm will warn (EBADENGINE) but may still install. Prefer Node >= 20 for local dev if using latest frontend toolchain.
  - If Node 18 must be kept, pin frontend toolchain to Node 18–compatible versions (e.g., Vite 5/6, React 18, React Router 6).

- Express 5:
  - Backend updated to express ^5.x via dependency bump. Express 5 changes some middleware/handler semantics (promise support, error handling).
  - Current codebase (CJS) continues to work because route handlers are sync/async functions already; verify custom error paths and middleware order.
  - Refer to Express 5 migration notes for advanced patterns.

- express-rate-limit >= 7/8:
  - Uses "limit" instead of "max".
  - Codebase already uses limit, standardHeaders, legacyHeaders fields align with v7+ expectations.

- Helmet >= 7/8:
  - CSP disabled in development by default; production should define CSP explicitly as needed.

- jsonwebtoken >= 9:
  - Ensure subject is a string when signing; verification errors include TokenExpiredError and JsonWebTokenError. Current utils handle subject via payload.sub.

- argon2:
  - Uses prebuilt binaries where possible; ensure Node version compatibility for your platform.

Reproducibility
- Always commit both package.json and package-lock.json (or any workspace lock files) in the same commit.
- Do not mix package managers (npm vs yarn/pnpm) within this repo.
- To reproduce:
  - Use the same Node/npm versions when possible.
  - Run: npm ci (if lockfile is in sync) or npm install to refresh after ncu changes.

Rollback
- Revert package.json and package-lock.json to previous commit if regressions appear.
- Alternatively, selectively pin problematic packages and re-install.

Standard Commit Message
- chore: update dependencies and refresh lock file (root)
- chore: update dependencies and refresh lock file (frontend)

Validation
- Start backend:
  npm run dev
- Start frontend:
  npm --prefix frontend run dev
- Visit:
  - API docs: http://localhost:3000/docs
  - Frontend: http://localhost:5173

Security
- Run npm audit --production and address high/critical advisories when feasible.
- Keep JWT_SECRET and other secrets in .env (never commit .env).
