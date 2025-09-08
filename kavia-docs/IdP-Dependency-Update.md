# Identity Provider (IdP) — Dependency Update Guide

Purpose
- Update all dependencies in the Identity Provider (IdP) container (repo: teljira-326-1860) to the latest compatible versions, regenerate the lockfile, and handle breaking changes in main dependencies per the “upgrade_all” strategy.

Prerequisites
- Node.js: Ensure Node >= 18.18.0 (LTS). Prefer Node >= 20 if newer tooling requires it (ESLint 9+, Vite if present, etc.).
- Package manager: npm >= 9 (recommended).
- Clean git working tree.

Clone IdP locally (if not already)
- git clone https://github.com/kavia-common/teljira-326-1860.git
- cd teljira-326-1860

Quick path (recommended)
- Use the helper script to upgrade all dependencies and refresh the lock file in one go:
  curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-idp.sh -o update-deps-idp.sh
  chmod +x update-deps-idp.sh
  ./update-deps-idp.sh

Manual path
1) Create a branch
   - git checkout -b chore/deps-update-YYYYMMDD

2) Baseline install and tests
   - npm ci || npm install --no-audit --no-fund
   - CI=true npm test || true

3) Upgrade all dependency ranges (upgrade_all)
   - npx npm-check-updates -u

4) Regenerate lockfile and install
   - npm install --no-audit --no-fund

5) Security, lint, tests (best-effort)
   - npm audit fix || true
   - npm run lint || true
   - CI=true npm test || true

6) Commit the changes
   - git add package.json package-lock.json
   - git commit -m "chore: update dependencies and refresh lock file"

Breaking changes to check (main dependencies)
- express-rate-limit >= 7/8:
  - Uses limit instead of max; recommended: { windowMs, limit, standardHeaders: true, legacyHeaders: false }.
- Helmet >= 7/8:
  - CSP often disabled in dev; provide explicit directives in production if required.
- jsonwebtoken >= 9:
  - Ensure subject is a string on sign; handle TokenExpiredError and JsonWebTokenError when verifying.
- csurf:
  - Verify cookie options shape and any Authorization-based CSRF bypass logic.
- argon2:
  - Ensure Node version compatibility for prebuilt binaries.
- ESLint >= 9:
  - Flat config (eslint.config.js) replaces .eslintrc; ensure scripts and plugins updated.
- Swagger (swagger-jsdoc/swagger-ui-express):
  - Ensure require vs default import usage remains correct after updates.

Engines alignment
- If updated dependencies require newer Node, bump package.json engines, e.g.:
  "engines": { "node": ">=18.18.0" }
- Prefer Node >= 20 for newer tooling if feasible.

Reproducibility
- Commit both package.json and package-lock.json.
- Do not mix npm and yarn in the same repo.

Validation
- Run application locally and validate OIDC/OAuth2/SAML flows as applicable.
- Run npm run lint and CI=true npm test.

Rollback
- Revert package.json and package-lock.json if regressions appear.
- Alternatively, pin specific packages to last known-good versions and re-run install.

Commit message
- chore: update dependencies and refresh lock file

Note
- The IdP repository is not present in this workspace. Use this guide and helper script in the external repo (teljira-326-1860) to complete the update.
