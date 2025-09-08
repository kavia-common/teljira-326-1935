# Webhook Endpoint — Contributing: Dependency Update Procedure

Repository:
- GitHub: https://github.com/kavia-common/teljira-326-1863.git
- Name: teljira-326-1863

Prerequisites
- Node.js >= 18.18.0
- npm >= 9 (recommended)
- Clean working tree (commit or stash your changes)
- Git access to push a branch and open PR

1) Clone and bootstrap
- git clone https://github.com/kavia-common/teljira-326-1863.git
- cd teljira-326-1863
- nvm use || echo "Ensure Node >= 18.18.0"
- npm ci || npm install --no-audit --no-fund

2) Create a branch
- git checkout -b chore/deps-update-$(date +%Y%m%d)

3) Update dependencies and lock file

Option A: Use the helper script (recommended)
- curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-webhook-endpoint.sh -o update-deps-webhook-endpoint.sh
- chmod +x update-deps-webhook-endpoint.sh
- ./update-deps-webhook-endpoint.sh

Option B: Manual steps
- npx npm-check-updates -u
- npm install --no-audit --no-fund
- npm audit fix || true
- npm run lint || true
- CI=true npm test || true

4) Validate local dev (if applicable)
- npm start or npm run dev (whatever the repository uses)
- Ensure webhook route(s) start correctly
- POST a sample JSON payload at /webhook (or documented path) to verify parsing and signature validation if configured

5) Commit with the required message
- git add package.json package-lock.json || true
- git commit -m "chore: update dependencies and refresh lock file"

6) Push and open PR
- git push -u origin HEAD
- Open a PR and request review

Notes on common breaking changes to watch for
- express-rate-limit >= 7
  - Use `limit` instead of `max`
  - Recommended: { windowMs, limit, standardHeaders: true, legacyHeaders: false }
- helmet >= 7
  - Consider explicit CSP only in production; disable in dev as needed:
    app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? { /* directives */ } : false }));
- jsonwebtoken >= 9 (if used)
  - Ensure `subject` is a string; handle TokenExpiredError and JsonWebTokenError
- node-fetch v3 is ESM (if used)
  - Prefer axios for CJS projects, or convert to ESM
- eslint >= 9
  - Flat config via eslint.config.js; update scripts to `eslint .`

Environment configuration
- Do not hardcode secrets or config.
- Ensure .env or environment variables are used:
  - PORT, HOST
  - WEBHOOK_SECRET
  - SITE_URL (if applicable)
  - NODE_ENV

Security checks
- Run `npm audit --production` and address high/critical issues where feasible.

Commit message policy
- Use exactly:
  chore: update dependencies and refresh lock file

Rollback
- Revert package.json and package-lock.json if issues occur.
- Update selectively if a broad update introduces instability.
