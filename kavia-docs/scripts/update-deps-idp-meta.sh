#!/usr/bin/env bash
set -euo pipefail

# Convenience meta-script: fetch and execute the canonical IdP dependency update script.
# Usage (run inside the IdP repository root: teljira-326-1860):
#   curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-idp-meta.sh -o update-deps-idp.sh
#   chmod +x update-deps-idp.sh
#   ./update-deps-idp.sh
#
# This script simply downloads and executes the canonical script stored in this repo:
# kavia-docs/scripts/update-deps-idp.sh

SCRIPT_URL="https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-idp.sh"

if [ ! -f package.json ]; then
  echo "package.json not found. Run this script from the IdP repository root (teljira-326-1860)."
  exit 1
fi

tmp_script="$(mktemp)"
trap 'rm -f "$tmp_script"' EXIT

echo "Downloading IdP dependency update script..."
curl -fsSL "$SCRIPT_URL" -o "$tmp_script"

echo "Executing update script..."
bash "$tmp_script"

echo "IdP dependency update procedure completed."
