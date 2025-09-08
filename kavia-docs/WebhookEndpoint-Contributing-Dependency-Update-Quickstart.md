# Webhook Endpoint — Dependency Update Quickstart

Goal
- Upgrade all dependencies to the latest compatible versions, regenerate the lockfile, and handle breaking changes.

Repository
- teljira-326-1863 (https://github.com/kavia-common/teljira-326-1863)

Prereqs
- Node.js >= 18.18.0 (prefer >= 20 if feasible)
- npm >= 9
- Clean working tree

Steps (copy/paste)

1) Clone and enter the repo
   git clone https://github.com/kavia-common/teljira-326-1863.git
   cd teljira-326-1863

2) Create a branch
   git checkout -b chore/deps-update-$(date +%Y%m%d)

3) Run the helper script
   curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-webhook-endpoint.sh -o update-deps-webhook-endpoint.sh
   chmod +x update-deps-webhook-endpoint.sh
   ./update-deps-webhook-endpoint.sh

4) Push and open a PR
   git push -u origin HEAD

Breaking changes to review
- express-rate-limit: use `limit` (not `max`); set standardHeaders/legacyHeaders
- helmet: CSP handling varies; explicitly set CSP in production if needed
- jsonwebtoken (if used): ensure `subject` is string; handle TokenExpiredError/JsonWebTokenError
- node-fetch v3 is ESM; prefer axios in CJS projects or convert to ESM
- eslint 9+: flat config (eslint.config.js)
- swagger-jsdoc/ui: verify require vs default import usage

Lockfile
- Always commit package.json and package-lock.json together.

Commit message
- chore: update dependencies and refresh lock file
