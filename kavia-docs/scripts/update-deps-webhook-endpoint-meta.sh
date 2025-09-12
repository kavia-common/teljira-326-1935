#!/usr/bin/env bash
set -euo pipefail

# Convenience meta-script: fetch and execute the canonical Webhook Endpoint dependency update script.
# Usage (run inside the Webhook Endpoint repository root: teljira-326-1863):
#   curl -sSL https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-webhook-endpoint-meta.sh -o update-deps-webhook-endpoint.sh
#   chmod +x update-deps-webhook-endpoint.sh
#   ./update-deps-webhook-endpoint.sh
#
# This script simply downloads and executes the canonical script stored in this repo:
# kavia-docs/scripts/update-deps-webhook-endpoint.sh

SCRIPT_URL="https://raw.githubusercontent.com/kavia-common/teljira-326-1935/main/kavia-docs/scripts/update-deps-webhook-endpoint.sh"

if [ ! -f package.json ]; then
  echo "package.json not found. Run this script from the Webhook Endpoint repository root (teljira-326-1863)."
  exit 1
fi

tmp_script="$(mktemp)"
trap 'rm -f "$tmp_script"' EXIT

echo "Downloading Webhook Endpoint dependency update script..."
curl -fsSL "$SCRIPT_URL" -o "$tmp_script"

echo "Executing update script..."
bash "$tmp_script"

echo "Webhook Endpoint dependency update procedure completed."
