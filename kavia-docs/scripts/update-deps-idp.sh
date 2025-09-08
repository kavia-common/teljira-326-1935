#!/usr/bin/env bash
set -euo pipefail

# Identity Provider (IdP) dependency update helper
# Repository: teljira-326-1860
# Usage:
#   1) cd /path/to/your/workdir
#   2) git clone https://github.com/kavia-common/teljira-326-1860.git
#   3) cd teljira-326-1860
#   4) curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-idp.sh -o update-deps-idp.sh
#   5) chmod +x update-deps-idp.sh
#   6) ./update-deps-idp.sh

if [ ! -f package.json ]; then
  echo "package.json not found. Run this script from the IdP repository root (teljira-326-1860)."
  exit 1
fi

echo "Using Node: $(node -v)"
echo "Using npm : $(npm -v)"

branch="chore/deps-update-$(date +%Y%m%d)"
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  git checkout -b "$branch" || git checkout "$branch"
fi

# Baseline clean install (fallback to install if lock is stale)
npm ci || npm install --no-audit --no-fund

# Upgrade all dependencies to latest compatible ranges
npx npm-check-updates -u

# Regenerate lockfile
npm install --no-audit --no-fund

# Security audit (best-effort, do not fail the run)
npm audit fix || true

# Lint (best-effort)
if npm run | grep -q "lint"; then
  npm run lint || true
fi

# Tests (best-effort, non-interactive)
if npm run | grep -q "test"; then
  CI=true npm test || true
fi

# Stage and commit changes with standardized message
git add package.json package-lock.json || true

if ! git diff --cached --quiet; then
  git commit -m "chore: update dependencies and refresh lock file"
else
  echo "No dependency changes detected to commit."
fi

echo "Done. You can now push the branch:"
echo "  git push -u origin ${branch}"
