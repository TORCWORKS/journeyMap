#!/usr/bin/env bash
# Verify the app before committing: JS syntax + end-to-end smoke test.
# Usage: bash dev/verify.sh      (exit 0 = green)
set -euo pipefail
cd "$(dirname "$0")/.."
export CHROME="${CHROME:-/home/pi-agent/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome}" # local browser for the e2e gate (this file is private)
echo "→ JS syntax check"
awk '/<script>/{f=1;next}/<\/script>/{f=0}f' index.html > /tmp/jm-verify.js
node --check /tmp/jm-verify.js
echo "→ E2E smoke test (playwright-core)"
( cd dev && node smoke.js )
echo "→ Connector geometry (D-001)"
( cd dev && node connectors.js )
echo "→ Template library (D-002)"
( cd dev && node templates.js )
echo "✓ verify passed"
