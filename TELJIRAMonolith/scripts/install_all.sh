#!/usr/bin/env bash
set -euo pipefail
# Ensures backend and frontend dependencies are installed (used by CI if postinstall is skipped)
cd "$(dirname "$0")/.."
echo "Installing backend deps..."
cd backend && npm ci || npm install
cd ..
echo "Installing frontend deps..."
cd frontend && npm ci || npm install
echo "Done."
