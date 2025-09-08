# Identity Provider (IdP) — Dependency Update Guide

Purpose
- This guide describes how to update all dependencies in the Identity Provider (IdP) container (repo: teljira-326-1860) to the latest compatible versions, resolve conflicts, and document major changes.
- Use this after cloning the IdP repository locally. The IdP repository is not present in this workspace; this document enables a future step to complete the update quickly and safely.

Prerequisites
- Node.js: Ensure Node >= 18.18.0 (LTS) is installed. Prefer using nvm to match engines set in package.json.
- Package manager: npm >= 9 (recommended) or yarn (v1 or v3/berry, depending on repo setting).
- A clean git working tree for easy reverts.

Clone IdP locally (if not already)
- git clone https://github.com/kavia-common/teljira-326-1860.git
- cd teljira-326-1860

Audit current dependencies
- Open package.json and note:
  - dependencies
  - devDependencies
  - engines.node (respect this; adjust versions accordingly)
  - scripts (for build, lint, test)
- If using yarn, check .yarnrc.yml or yarn policies for version constraints.

Recommended update strategy
1) Create a new branch
   - git checkout -b chore/deps-update-YYYYMMDD

2) Baseline install and tests
   - npm ci (or yarn install --frozen-lockfile)
   - npm test (or CI=true npm test) to establish a baseline

3) Update production dependencies
   - Use npm-check-updates (ncu) or manual selective updates.
   - npx npm-check-updates -u
   - npm install
   - If yarn: npx npm-check-updates -u && yarn install
   - Alternatively, update packages selectively (e.g., express, jsonwebtoken, passport, oidc-client, samlify, joi/zod, pg/redis if present).

4) Update devDependencies
   - Include eslint, jest, ts-jest/babel, nodemon, typescript (if present), supertest, @types/*.
   - Re-run install.

5) Resolve breaking changes
   - Express 4.x minor updates are safe; Express 5 introduces promise-based handlers and changes in router/err handling (only update to 5 if ready to refactor).
   - Helmet >= 7: CSP disabled by default in some setups; verify helmet options shape.
   - express-rate-limit >= 7 uses `limit` instead of `max` and ESM default export behavior; ensure correct import/require usage.
   - jsonwebtoken >=9: verify jwt.sign/verify options; subject should be string; ensure expiresIn and algorithms are valid.
   - csurf: Verify cookie options shape and usage with Authorization bypass logic.
   - argon2: Node runtime and build toolchain requirements; prefer prebuilt binaries; ensure Node matches supported matrix.
   - socket.io: If used for IdP admin console, client/server compatibility must be aligned (same major).
   - eslint >=9: Flat config (eslint.config.js) replaces .eslintrc; ensure parser/config adapted.
   - jest 29: Requires Node >= 14.15; if TypeScript, ensure ts-jest or babel-jest config aligns.
   - swagger-jsdoc/ui: Verify OpenAPI generation APIs; d.ts typing may shift default export vs. named.

6) Re-run tests and lint
   - npm run lint
   - npm test
   - Fix type/ESLint errors introduced by upgrades.

7) Node engine alignment
   - If upgraded packages require newer Node (e.g., argon2, eslint 9), bump "engines.node" in package.json to ">=18.18.0" (or applicable).
   - Document the change in CHANGELOG (see template below).

8) Lockfile and reproducibility
   - Commit package.json and package-lock.json (or yarn.lock).
   - Avoid mixing npm and yarn in the same repo.

Configuration and code adjustments commonly required
- express-rate-limit:
  Before:
    const rateLimit = require('express-rate-limit');
    const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
  After (v7+):
    const rateLimit = require('express-rate-limit');
    const limiter = rateLimit({ windowMs: 15*60*1000, limit: 100, standardHeaders: true, legacyHeaders: false });

- Helmet:
  Ensure the options pass-through remains valid; if CSP is needed, configure explicitly.

- jsonwebtoken:
  Ensure subject is a string and error handling catches TokenExpiredError and JsonWebTokenError for robust responses.

- ESLint:
  If the repo migrates to flat config, create eslint.config.js and update npm scripts to run `eslint .`.
  Install necessary plugins: @eslint/js, globals, etc., if using modern config.

- Jest:
  If tests use ESM, consider setting "type": "module" or using Babel/jest config.
  For TS, add ts-jest and update jest.config.js accordingly.

- TypeScript (if present):
  Update types to latest @types/node, @types/express, @types/jsonwebtoken, etc.

Security checks
- Run npm audit --production and review high/critical issues.
- For runtime dependencies with advisories, consider pinning to fixed versions if latest introduces breaking changes.

Example commit message
- chore(idp): update dependencies to latest compatible, align configs
- Includes:
  - express-rate-limit v7 config change (limit field)
  - eslint 9 flat config
  - jsonwebtoken 9 minor adjustments
  - engines.node >= 18.18.0

CHANGELOG entry template
## [Unreleased]
### Changed
- Bumped all runtime and dev dependencies to latest compatible versions.
- Updated rate limiting config to use `limit` (express-rate-limit v7).
- Ensured JWT subject is string and standardized error handling for token verification.
- Aligned ESLint to flat config (eslint 9).
- Set Node engine to >= 18.18.0.

Validation
- Local: npm test, npm run lint, run dev server and validate OIDC/SAML flows in a test environment.
- CI: Ensure pipelines cache updated and Node version matches engines.

Rollback plan
- Revert to previous lockfile and package.json if any critical runtime regression appears.
- Incrementally step forward package-by-package if broad update causes instability.

Notes
- This guide is provided because the IdP codebase (teljira-326-1860) is not present in this workspace. Once the repository is available locally, follow the steps above to perform the update.
