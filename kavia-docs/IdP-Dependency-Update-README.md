# Identity Provider (IdP) Dependency Update — Quick Instructions

The IdP codebase is external to this workspace:
- Repository: https://github.com/kavia-common/teljira-326-1860.git

Use the documented helper scripts in this repo to update IdP dependencies to latest safe versions, refresh the lockfile, and validate builds/tests.

Option A: One-liner meta-script (recommended)
1) In your local terminal:
   git clone https://github.com/kavia-common/teljira-326-1860.git
   cd teljira-326-1860
   curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-idp-meta.sh -o update-deps-idp.sh
   chmod +x update-deps-idp.sh
   ./update-deps-idp.sh

Option B: Use the canonical script directly
1) Clone and enter the repo:
   git clone https://github.com/kavia-common/teljira-326-1860.git
   cd teljira-326-1860
2) Fetch and run the canonical script:
   curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-idp.sh -o update-deps-idp.sh
   chmod +x update-deps-idp.sh
   ./update-deps-idp.sh

What the script does:
- Ensures Node/npm are available
- Creates/uses a branch: chore/deps-update-YYYYMMDD
- Baseline install (npm ci || npm install)
- Bumps dependency ranges via npm-check-updates (ncu) and reinstalls to regenerate package-lock.json
- Runs npm audit fix (best-effort)
- Runs lint/tests if available (best-effort)
- Commits package.json + package-lock.json with the required message:
  chore: update dependencies and refresh lock file

After running:
- Push your branch and open a PR:
  git push -u origin HEAD

Breaking changes and notes:
- See kavia-docs/IdP-Dependency-Update.md and kavia-docs/IdP-Contributing-Dependency-Update.md in this repository for detailed compatibility notes (express-rate-limit, helmet, jsonwebtoken, csurf, eslint flat config, swagger-jsdoc/ui), and validation steps.
