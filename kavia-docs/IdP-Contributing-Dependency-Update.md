# Identity Provider (IdP) — Dependency Update Procedure

This document provides step-by-step instructions to update dependencies in the Identity Provider (IdP) repository and commit the refreshed lockfile.

Repository:
- GitHub: https://github.com/kavia-common/teljira-326-1860.git
- Name: teljira-326-1860

Prerequisites
- Node.js >= 18.18.0
- npm >= 9 (recommended)
- A clean working tree (commit or stash your changes)
- Git access to push a branch and open PR

1. Clone and bootstrap
- git clone https://github.com/kavia-common/teljira-326-1860.git
- cd teljira-326-1860
- nvm use || echo "Ensure Node >= 18.18.0"
- npm ci

2. Create a branch
- git checkout -b chore/deps-update-$(date +%Y%m%d)

3. Update dependencies and lock file
Option A: Use the helper script (recommended)
- ./scripts/update-deps.sh

Option B: Manual steps
- npx npm-check-updates -u
- npm install --no-audit --no-fund
- npm audit fix || true
- npm run lint || true
- CI=true npm test || true

4. Validate local dev
- npm start (or appropriate dev command)
- Ensure core flows run locally
- Run any e2e/basic checks if available

5. Commit with the required message
- git add package.json package-lock.json || true
- git commit -m "chore: update dependencies and refresh lock file"

6. Push and open PR
- git push -u origin HEAD
- Open a PR and request review

Notes on common breaking changes to watch for
- express-rate-limit >= 7: use `limit` instead of `max`; add standardHeaders/legacyHeaders.
- helmet >= 7: CSP off by default in some setups; define CSP explicitly in prod.
- jsonwebtoken >= 9: ensure `subject` is string, handle TokenExpiredError and JsonWebTokenError.
- eslint >= 9: flat config (eslint.config.js).
- node-fetch v3 (ESM): prefer axios or adopt ESM if repo is CJS.

Environment configuration
- Do not hardcode. Add variables to a .env file based on .env.example.
- Ensure JWT secrets, issuer, client IDs, and OIDC/SAML configs are provided through envs.

Rollback
- Revert package.json and package-lock.json if issues occur.
- Update selectively package-by-package if a broad update is unstable.

Security
- Review npm audit (production) and address high/critical issues.
- Prefer patched versions or pinned ranges when majors introduce breaking changes.

Commit message policy
- Use the exact message requested:
  chore: update dependencies and refresh lock file

