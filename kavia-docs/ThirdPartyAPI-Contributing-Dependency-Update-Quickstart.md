# Third-Party API — Dependency Update Quickstart

Goal
- Upgrade all dependencies to the latest compatible versions, regenerate the lockfile, and handle breaking changes.

Repository
- teljira-326-1862 (https://github.com/kavia-common/teljira-326-1862)

Prereqs
- Node.js >= 18.18.0 (prefer >= 20 if feasible)
- npm >= 9
- Clean working tree

Steps (copy/paste)

1) Clone and enter the repo
   git clone https://github.com/kavia-common/teljira-326-1862.git
   cd teljira-326-1862

2) Create a branch
   git checkout -b chore/deps-update-$(date +%Y%m%d)

3) Run the helper script
   curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-third-party-api.sh -o update-deps-third-party-api.sh
   chmod +x update-deps-third-party-api.sh
   ./update-deps-third-party-api.sh

4) Validate build/run (typical)
   # Install if not already done by the script
   npm install
   # Lint and tests if available (non-blocking)
   npm run lint || true
   CI=true npm test || true
   # Start the app (adjust to the repo's scripts)
   npm start || npm run dev

5) Push and open a PR
   git push -u origin HEAD

Breaking changes to review
- express-rate-limit: use `limit` (not `max`); set standardHeaders/legacyHeaders
- helmet: CSP handling varies; explicitly set CSP in production if needed
- jsonwebtoken: ensure `subject` is string; handle TokenExpiredError/JsonWebTokenError
- csurf: verify cookie options and Authorization-based bypass (if used)
- node-fetch v3 is ESM; prefer axios for CJS projects or convert to ESM
- eslint 9: flat config (eslint.config.js)
- swagger-jsdoc/ui: verify require vs default import usage

Lockfile
- Always commit package.json and package-lock.json together.

Commit message
- chore: update dependencies and refresh lock file
