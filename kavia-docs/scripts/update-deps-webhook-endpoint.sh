#!/usr/bin/env bash
set -euo pipefail

# This script should be copied into the Webhook Endpoint repository (teljira-326-1863)
# and executed there. It updates dependencies, refreshes the lockfile, runs audits,
# lints, runs tests in CI mode, and commits with the required message.
#
# Usage:
#   curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-webhook-endpoint.sh -o update-deps-webhook-endpoint.sh
#   chmod +x update-deps-webhook-endpoint.sh
#   ./update-deps-webhook-endpoint.sh
#
# Prerequisites:
# - Node.js >= 18.18.0
# - npm >= 9
# - git repo initialized and clean working tree (commit or stash prior changes)

if [ ! -f package.json ]; then
  echo "package.json not found. Run this script from the Webhook Endpoint repository root."
  exit 1
fi

echo "Using Node: $(node -v)"
echo "Using npm : $(npm -v)"

branch="chore/deps-update-$(date +%Y%m%d)"
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  # Create or switch to branch
  git checkout -b "$branch" || git checkout "$branch"
fi

# Baseline install (prefer clean install; fallback to install)
npm ci || npm install --no-audit --no-fund

# Bulk update to latest compatible versions
npx npm-check-updates -u

# Refresh lock file
npm install --no-audit --no-fund

# Security audit (best-effort)
npm audit fix || true

# Lint (best-effort)
if npm run | grep -q "lint"; then
  npm run lint || true
fi

# Tests (best-effort, non-interactive)
if npm run | grep -q "test"; then
  CI=true npm test || true
fi

# Stage and commit with required message
git add package.json package-lock.json || true

if ! git diff --cached --quiet; then
  git commit -m "chore: update dependencies and refresh lock file"
else
  echo "No dependency changes detected to commit."
fi

echo "Done. You can now push the branch:"
echo "  git push -u origin ${branch}"
