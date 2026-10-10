#!/usr/bin/env bash
# Off-repo backup: bundle the full git history into ~/backups (keeps the last 10).
# Restore anywhere with:  git clone journeymap-YYYY-MM-DD.gitbundle journeymap-restored
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="${1:-$HOME/backups}"
mkdir -p "$DEST"
OUT="$DEST/journeymap-$(date +%F-%H%M).gitbundle"
git bundle create "$OUT" --all --tags -q 2>/dev/null || git bundle create "$OUT" --all --tags
ls -t "$DEST"/journeymap-*.gitbundle 2>/dev/null | tail -n +11 | xargs -r rm -f
echo "backup: $OUT ($(du -h "$OUT" | cut -f1))"
echo "total: $(ls "$DEST"/journeymap-*.gitbundle | wc -l) bundle(s) in $DEST"
