# Webhook Endpoint — Dependency Update Notes (Compatibility & Checks)

Use this alongside:
- WebhookEndpoint-Dependency-Update.md
- WebhookEndpoint-Contributing-Dependency-Update-Quickstart.md
- scripts/update-deps-webhook-endpoint.sh

Node & npm
- Prefer Node >= 20 for best compatibility with modern tooling. Minimum required: Node >= 18.18.0.
- npm >= 9 recommended.

Common breaking changes to verify after updates:
1) express-rate-limit >= 7/8
   - Replace `max` with `limit`.
   - Add `{ standardHeaders: true, legacyHeaders: false }`.
   - Example:
     const apiLimiter = rateLimit({
       windowMs: 15 * 60 * 1000,
       limit: 500,
       standardHeaders: true,
       legacyHeaders: false,
     });

2) helmet >= 7/8
   - In development, you may disable CSP:
     app.use(helmet({ contentSecurityPolicy: false }));
   - In production, define a CSP explicitly to match your environment.

3) jsonwebtoken >= 9 (only if used)
   - Ensure `subject` is a string during sign:
     jwt.sign(payload, secret, { expiresIn, subject: String(payload.sub) });
   - Catch TokenExpiredError and JsonWebTokenError for verification failures.

4) node-fetch v3 (if used)
   - ESM-only; prefer axios for CJS projects or convert the project to ESM.

5) ESLint >= 9
   - Flat config via eslint.config.js.
   - Update scripts to `eslint .` and ensure plugins/configs are compatible.

6) swagger-jsdoc / swagger-ui-express
   - Verify require vs default import usage and that docs still render.

Procedure summary
- Create branch: chore/deps-update-YYYYMMDD
- Baseline install: npm ci || npm install --no-audit --no-fund
- Bulk update: npx npm-check-updates -u
- Refresh lockfile: npm install --no-audit --no-fund
- Security: npm audit fix || true
- Lint/tests (best-effort): npm run lint || true; CI=true npm test || true
- Commit: package.json + package-lock.json
- Message: "chore: update dependencies and refresh lock file"
