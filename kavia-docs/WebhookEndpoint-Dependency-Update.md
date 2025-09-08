# Webhook Endpoint — Dependency Update Guide

Purpose
- This guide describes how to update all dependencies in the Webhook Endpoint container (repo: teljira-326-1863) to the latest compatible versions, resolve conflicts, and document major changes.
- The Webhook Endpoint repository is not present in this workspace; use this guide after cloning the repository.

Prerequisites
- Node.js: Ensure Node >= 18.18.0 (LTS) is installed (align with package.json engines).
- Package manager: npm >= 9 (recommended) or yarn.
- Clean git working tree.

Execute now (copy/paste)
If you have the Webhook Endpoint repo locally:
- cd /path/to/your/workdir
- git clone https://github.com/kavia-common/teljira-326-1863.git
- cd teljira-326-1863
- curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-webhook-endpoint.sh -o update-deps-webhook-endpoint.sh
- chmod +x update-deps-webhook-endpoint.sh
- ./update-deps-webhook-endpoint.sh
Then push and open a PR:
- git push -u origin HEAD

Clone Webhook Endpoint locally (manual path)
- git clone https://github.com/kavia-common/teljira-326-1863.git
- cd teljira-326-1863

Audit current dependencies
- Review package.json:
  - dependencies: express, cors, helmet, morgan, express-rate-limit, body-parser/express.json, crypto (node core), axios/node-fetch (if outbound callbacks), swagger-jsdoc/swagger-ui-express (if docs)
  - devDependencies: eslint, jest/mocha, supertest, nodemon, typescript (if applicable)
  - engines.node, scripts

Recommended update strategy
1) Branch
   - git checkout -b chore/deps-update-YYYYMMDD
2) Baseline
   - npm ci (or yarn install --frozen-lockfile)
   - CI=true npm test
3) Update dependencies
   - npx npm-check-updates -u
   - npm install
   - Or selectively bump critical libs first.
4) Update devDependencies
   - eslint (9+ flat config), jest, nodemon, supertest, @types/*
5) Address breaking changes
- express-rate-limit >=7 uses `limit` instead of `max`, with standard/legacy headers options.
- Helmet >=7: define CSP explicitly for production; turn off for dev if needed.
- jsonwebtoken >=9 (if used for signing outbound webhook auth tokens): ensure subject is string and catch TokenExpiredError.
- axios/node-fetch: address ESM differences if using node-fetch v3; axios recommended for CJS projects.
- ESLint >=9: migrate to flat config (eslint.config.js) and update scripts.

Sample code adjustments
- Rate limiter:
  const rateLimit = require('express-rate-limit');
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/webhook', apiLimiter);

- Helmet:
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? { /* directives */ } : false }));

- JSON parsing security:
  app.use(express.json({ limit: '1mb' }));

- Signature verification (no change needed for crypto core):
  const sig = req.headers['x-sf-signature'];
  if (sig && process.env.WEBHOOK_SECRET) {
    const hmac = require('crypto').createHmac('sha256', process.env.WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    if (sig !== digest) return res.status(401).json({ error: 'Unauthorized', message: 'Invalid signature' });
  }

Validation
- npm run lint
- CI=true npm test
- Manual test webhook POST with/without valid signature.
- Verify Swagger docs (if present) load correctly.

engines.node
- If updated packages require it, set: "engines": { "node": ">=18.18.0" }

Security checks
- npm audit --production; address critical/high advisories.

Commit and changelog
- chore(webhook): update dependencies to latest compatible, align rate limit and helmet config
- CHANGELOG: document express-rate-limit `limit` change and Node engine alignment.

Rollback
- Revert package.json and lockfile if regressions occur.

Notes
- This guide exists because the Webhook Endpoint codebase (teljira-326-1863) is not currently in this workspace. Follow it once the repository is available.

Environment variables to document in .env.example
- PORT, HOST
- WEBHOOK_SECRET
- SITE_URL (if applicable)
- NODE_ENV
