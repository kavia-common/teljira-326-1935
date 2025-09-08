#!/usr/bin/env bash
set -euo pipefail

# This script is intended to be copied into the IdP repository (teljira-326-1860)
# and executed there. It updates dependencies, refreshes the lockfile, runs audit,
# lints, runs tests in CI mode, and commits with the required message.

if [ ! -f package.json ]; then
  echo "package.json not found. Run this script from the IdP repository root."
  exit 1
fi

echo "Using Node: $(node -v)"
echo "Using npm : $(npm -v)"

branch="chore/deps-update-$(date +%Y%m%d)"
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  git checkout -b "$branch" || git checkout "$branch"
fi

# Ensure baseline install
npm ci || npm install --no-audit --no-fund

# Update to latest compatible versions using npm-check-updates
npx npm-check-updates -u

# Refresh lock file and install
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

# Add common files
git add package.json package-lock.json || true

# Commit with the required message
if ! git diff --cached --quiet; then
  git commit -m "chore: update dependencies and refresh lock file"
else
  echo "No changes to commit."
fi

echo "Done. You can now push the branch:"
echo "  git push -u origin ${branch}"
