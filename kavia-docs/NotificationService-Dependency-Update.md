# Notification Service — Dependency Update Guide

Repository:
- GitHub: https://github.com/kavia-common/teljira-326-1861.git
- Name: teljira-326-1861

Purpose
- Update all dependencies in the Notification Service to latest compatible versions, refresh the lock file, and commit changes with a standardized message.

Prerequisites
- Node.js >= 18.18.0
- npm >= 9 (recommended) or yarn (if the repo uses it)
- Clean working tree

Clone the repository
- git clone https://github.com/kavia-common/teljira-326-1861.git
- cd teljira-326-1861

Create a branch
- git checkout -b chore/deps-update-$(date +%Y%m%d)

Install baseline deps
- npm ci || npm install --no-audit --no-fund

Update dependencies and lock file (Option A: helper script)
- ./scripts/update-deps.sh

Update dependencies and lock file (Option B: manual)
- npx npm-check-updates -u
- npm install --no-audit --no-fund
- npm audit fix || true
- npm run lint || true
- CI=true npm test || true

Commit the changes
- git add package.json package-lock.json || true
- git commit -m "chore: update dependencies and refresh lock file"

Push and open PR
- git push -u origin HEAD

Notes on common breaking changes to watch for
- express-rate-limit >= 7: use `limit` instead of `max`; set standardHeaders/legacyHeaders.
- helmet >= 7: CSP configuration may need explicit directives for production; often disabled in dev.
- jsonwebtoken >= 9: ensure `subject` is a string; handle TokenExpiredError/JsonWebTokenError.
- eslint >= 9: flat config via eslint.config.js.
- node-fetch v3 is ESM; prefer axios or adjust module type.

Environment configuration
- Do not hardcode. Use .env; commit a .env.example if missing.
- Likely variables for Notification Service:
  - PORT, HOST, SITE_URL
  - SMTP_* (if email)
  - TEAMS_WEBHOOK_URL / SLACK_WEBHOOK_URL
  - SMS_* provider settings (if applicable)
  - JWT_SECRET (if verifying inbound tokens)
  - NODE_ENV

Security
- Run npm audit --production and resolve high/critical issues if feasible.

Commit message policy
- Use exactly:
  chore: update dependencies and refresh lock file
