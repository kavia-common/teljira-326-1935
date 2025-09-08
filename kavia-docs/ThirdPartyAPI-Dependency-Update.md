# Third-Party API — Dependency Update Guide

Purpose
- This guide describes how to update all dependencies in the Third-Party API container (repo: teljira-326-1862) to the latest compatible versions, resolve conflicts, and document major changes.
- Use this guide after cloning the Third-Party API repository locally. The Third-Party API repository is not present in this workspace; this document enables a future step to complete the update safely.

Prerequisites
- Node.js: Ensure Node >= 18.18.0 (LTS) is installed. Prefer using nvm to match `engines.node` in package.json.
- Package manager: npm >= 9 (recommended) or yarn (v1 or berry, depending on the repo).
- Clean git working tree for easy rollback.

Clone Third-Party API locally
- git clone https://github.com/kavia-common/teljira-326-1862.git
- cd teljira-326-1862

Audit current dependencies
- Open package.json and note:
  - dependencies (e.g., express, axios/node-fetch, nodegit/simple-git, jsonwebtoken, swagger-jsdoc/ui, cors, helmet, morgan, express-rate-limit, csurf if present)
  - devDependencies (eslint, jest/mocha, supertest, nodemon, typescript if applicable)
  - engines.node (respect minimum version)
  - scripts (build, lint, test)
- If yarn is used, review `.yarnrc.yml`/policies.

Recommended update strategy
1) Create a new branch
   - git checkout -b chore/deps-update-YYYYMMDD

2) Baseline install and tests
   - npm ci (or yarn install --frozen-lockfile)
   - CI=true npm test (or yarn test) to establish a baseline

3) Update production dependencies
   Option A: bulk update with npm-check-updates
   - npx npm-check-updates -u
   - npm install
   Option B: selective updates (safer for breaking changes)
   - Prioritize: express, axios/node-fetch, jsonwebtoken, cors, helmet, morgan,
     express-rate-limit, swagger-jsdoc, swagger-ui-express, socket.io (if present),
     nodegit/simple-git (for Git integrations), pg/redis (if present).
   - npm install <pkg>@latest --save

4) Update devDependencies
   - eslint (9+ uses flat config), jest 29+, nodemon 3+, supertest, @types/* (if TS)
   - npm install --save-dev <devpkg>@latest

5) Resolve breaking changes and compatibility notes
- Express (4.x to latest 4 minor → safe; 5.x requires handler refactors). Only update to 5 if you are ready to update route/err-handling semantics.
- Helmet >=7:
  - Options shape: `helmet({ contentSecurityPolicy: false })` is acceptable; define CSP explicitly in production.
- express-rate-limit >=7:
  - Uses `limit` instead of `max` and supports standard/legacy headers.
  - Example:
    const rateLimit = require('express-rate-limit');
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 500,
      standardHeaders: true,
      legacyHeaders: false
    });
- jsonwebtoken >=9:
  - Ensure `subject` (sub) is a string; handle TokenExpiredError and JsonWebTokenError explicitly.
- swagger-jsdoc/ui:
  - Confirm default vs named export usage; APIs remain stable in v6.
- axios / node-fetch:
  - If migrating from node-fetch v2 to v3 (ESM), ensure module type compatibility or prefer axios to avoid ESM friction.
- Git integrations (nodegit/simple-git):
  - nodegit has native binaries; ensure Node version compatibility. If friction arises, consider simple-git (pure JS) if functionality allows.
- ESLint >=9:
  - Flat config via eslint.config.js; install `@eslint/js`, `globals` if needed; update npm scripts to `eslint .`.
- CORS:
  - Validate origin allow-list logic; keep credentials and allowed headers aligned with server behavior.

6) Re-run tests and lint
   - npm run lint
   - CI=true npm test
   - Fix any ESLint/Jest errors introduced by upgrades.

7) Node engine alignment
   - If any updated dependency requires newer Node, bump engines in package.json:
     "engines": { "node": ">=18.18.0" }
   - Update Docker/CI node version accordingly.

8) Lockfile and reproducibility
   - Commit package.json and package-lock.json (or yarn.lock).
   - Avoid mixing npm and yarn.

Configuration and code adjustments commonly required (snippets)
- express-rate-limit:
  Before:
    const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
  After:
    const limiter = rateLimit({ windowMs: 15*60*1000, limit: 100, standardHeaders: true, legacyHeaders: false });

- Helmet (CSP explicit in prod):
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? { /* define directives */ } : false }));

- jsonwebtoken (token sign/verify):
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h', subject: String(payload.sub) });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    if (e.name === 'TokenExpiredError') { /* 401 with token expired */ }
    else { /* 401 invalid token */ }
  }

- Swagger UI dynamic server URL (if needed):
  // recompute servers[] based on req.protocol/host similar to Monolith approach.

Security checks
- npm audit --production (review high/critical issues)
- For runtime advisories, consider pinning to patched versions if latest major introduces breaking changes you cannot adopt immediately.

Helper script
- You can use the update helper script from this repo (copy to the Third-Party API repo root and run):
  - File: kavia-docs/scripts/update-deps-third-party-api.sh
  - Quick usage:
    curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-third-party-api.sh -o update-deps-third-party-api.sh
    chmod +x update-deps-third-party-api.sh
    ./update-deps-third-party-api.sh

Example commit message
- chore: update dependencies and refresh lock file

Validation
- npm test, npm run lint
- Run the service locally; validate:
  - Health endpoints
  - External integrations (Git operations, reporting platform calls)
  - Swagger docs rendering
  - Auth flows with JWT tokens (if used here)

Rollback plan
- Revert package.json and lockfile if runtime regressions appear.
- Update incrementally package-by-package if broad update causes instability.

Environment variables to document in .env.example
- PORT, HOST, SITE_URL (if applicable)
- JWT_SECRET, JWT_EXPIRES_IN (if JWT is used)
- GIT provider settings or tokens (if applicable)
- External API endpoints/keys for reporting integrations
- NODE_ENV
