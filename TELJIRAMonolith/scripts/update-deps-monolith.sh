#!/usr/bin/env bash
set -euo pipefail

# TELJIRAMonolith dependency update helper (backend + frontend)
# Usage:
#   cd TELJIRAMonolith
#   bash ./scripts/update-deps-monolith.sh
#
# What it does:
# - Verifies Node and npm versions
# - Baseline install (ci or fallback install)
# - Uses npm-check-updates (ncu) to bump ranges
# - Regenerates lockfiles
# - Best-effort audit/lint/test
# - Prints next steps and commit suggestions

echo "Using Node: $(node -v)"
echo "Using npm : $(npm -v)"

if [ ! -f package.json ]; then
  echo "Run this script from TELJIRAMonolith directory."
  exit 1
fi

# Backend
echo "=== Updating backend dependencies ==="
npm ci || npm install --no-audit --no-fund
npx npm-check-updates -u
npm install --no-audit --no-fund

# Best-effort checks
npm audit fix || true
if npm run | grep -q "lint"; then npm run lint || true; fi
if npm run | grep -q "test"; then CI=true npm test || true; fi

# Frontend
if [ -f frontend/package.json ]; then
  echo "=== Updating frontend dependencies ==="
  pushd frontend >/dev/null
  npm ci || npm install --no-audit --no-fund
  npx npm-check-updates -u
  npm install --no-audit --no-fund

  npm audit fix || true
  if npm run | grep -q "lint"; then npm run lint || true; fi
  if npm run | grep -q "test"; then CI=true npm test || true; fi

  popd >/dev/null
fi

cat <<'EOF'

Dependency update completed.

Next steps:
1) Review changes in:
   - TELJIRAMonolith/package.json
   - TELJIRAMonolith/package-lock.json
   - TELJIRAMonolith/frontend/package.json
   - TELJIRAMonolith/frontend/package-lock.json

2) Validate running services:
   - Backend: npm run dev
   - Frontend: npm --prefix frontend run dev
   - Docs: http://localhost:3000/docs
   - UI:   http://localhost:5173

3) Commit (example messages):
   - chore: update dependencies and refresh lock file (root)
   - chore: update dependencies and refresh lock file (frontend)

Refer to DEPENDENCY_UPDATE_NOTES.md for breaking-change checks.

EOF
