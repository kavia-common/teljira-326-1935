# Webhook Endpoint Dependency Update — How to Run (External Repo)

The Webhook Endpoint container lives in an external repository:
- GitHub: https://github.com/kavia-common/teljira-326-1863.git
- Name: teljira-326-1863

This workspace includes helper scripts and documentation to update all dependencies in that repo to the latest safe versions, regenerate the lockfile, and validate build/run.

Quick path (recommended)
1) Clone and enter the repo:
   git clone https://github.com/kavia-common/teljira-326-1863.git
   cd teljira-326-1863

2) Run the meta-script (downloads and executes the canonical updater):
   curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-webhook-endpoint-meta.sh -o update-deps-webhook-endpoint.sh
   chmod +x update-deps-webhook-endpoint.sh
   ./update-deps-webhook-endpoint.sh

This will:
- Create/switch to branch chore/deps-update-YYYYMMDD
- Perform a clean install (or fallback install)
- Use npm-check-updates (ncu) to bump to latest compatible ranges
- Regenerate package-lock.json with npm install
- Run npm audit fix (best-effort)
- Run lint/tests if scripts exist (best-effort)
- Stage and commit package.json + package-lock.json with the standard message:
  chore: update dependencies and refresh lock file

Manual path
- See: kavia-docs/WebhookEndpoint-Contributing-Dependency-Update.md
- Or run the canonical script directly:
  curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-webhook-endpoint.sh -o update-deps-webhook-endpoint.sh
  chmod +x update-deps-webhook-endpoint.sh
  ./update-deps-webhook-endpoint.sh

Post-update validation checklist
- npm start or npm run dev (as per repo scripts)
- Verify the webhook endpoint boots and accepts POST /webhook (or documented path)
- Test HMAC signature verification if WEBHOOK_SECRET is set
- Confirm any rate-limiting and helmet defaults still behave as expected
- If Swagger is present, confirm /docs still renders

Environment variables
- Ensure you have a .env file based on:
  kavia-docs/WebhookEndpoint-.env.example
- Required vars typically include:
  - PORT, HOST, SITE_URL, NODE_ENV
  - WEBHOOK_SECRET

Notes on breaking changes
- express-rate-limit >= 7/8: use `limit` (not `max`) with standardHeaders/legacyHeaders
- helmet >= 7/8: CSP varies; disable in dev or configure explicitly in prod
- jsonwebtoken >= 9 (if used): ensure `subject` is a string; handle TokenExpiredError/JsonWebTokenError
- node-fetch v3 is ESM; in CJS projects prefer axios or convert to ESM
- ESLint >= 9: flat config via eslint.config.js
- swagger-jsdoc/ui: ensure require vs default import usage remains valid

Commit message policy
- Use exactly:
  chore: update dependencies and refresh lock file

```diff
Summary of what this README enables:
+ Clear, reproducible steps to update deps for Webhook Endpoint (external repo)
+ One-liner meta-script to perform the update reliably
+ Validation checks to ensure the app still builds and runs
```
