# Notification Service — Dependency Update Guide

Repository:
- GitHub: https://github.com/kavia-common/teljira-326-1861.git
- Name: teljira-326-1861

Purpose
- Update all dependencies in the Notification Service to latest compatible versions, refresh the lock file, and commit changes with a standardized message.

Prerequisites
- Node.js >= 18.18.0 (prefer >= 20 for newer tooling)
- npm >= 9 (recommended)
- Clean working tree

Clone the repository
- git clone https://github.com/kavia-common/teljira-326-1861.git
- cd teljira-326-1861

Create a branch
- git checkout -b chore/deps-update-$(date +%Y%m%d)

Install baseline deps
- npm ci || npm install --no-audit --no-fund

Update dependencies and lock file (Option A: helper script)
- curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-notification-service.sh -o update-deps-notification-service.sh
- chmod +x update-deps-notification-service.sh
- ./update-deps-notification-service.sh

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
- express-rate-limit >= 7:
  - use `limit` instead of `max`
  - recommended: { windowMs, limit, standardHeaders: true, legacyHeaders: false }
- helmet >= 7/8:
  - CSP may need explicit directives in production; often disabled in dev
- jsonwebtoken >= 9:
  - ensure `subject` is a string (sub)
  - handle TokenExpiredError/JsonWebTokenError in verification
- eslint >= 9:
  - flat config via eslint.config.js
- node-fetch v3:
  - ESM only; prefer axios or convert to ESM
- swagger-jsdoc/swagger-ui-express:
  - verify require vs default import usage if updated

Environment configuration (do not hardcode)
- Add or update .env.example if needed. Expected variables (adjust to repo reality):
  - PORT, HOST, SITE_URL, NODE_ENV
  - SMTP_* (email delivery)
  - TEAMS_WEBHOOK_URL or SLACK_WEBHOOK_URL
  - SMS_* provider settings (if applicable)
  - JWT_SECRET / JWT_EXPIRES_IN (if verifying inbound tokens)
  - RATE_LIMIT_* (optional)

Security
- Run `npm audit --production` and address high/critical issues where feasible.

Commit message policy
- Use exactly:
  chore: update dependencies and refresh lock file
