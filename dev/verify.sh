#!/usr/bin/env bash
# Verify the app before committing: JS syntax + end-to-end smoke test.
# Usage: bash dev/verify.sh      (exit 0 = green)
set -euo pipefail
cd "$(dirname "$0")/.."
echo "→ JS syntax check"
awk '/<script>/{f=1;next}/<\/script>/{f=0}f' index.html > /tmp/jm-verify.js
node --check /tmp/jm-verify.js
echo "→ E2E smoke test (playwright-core)"
( cd dev && node smoke.js )
echo "✓ verify passed"
