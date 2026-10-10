# Directives — JourneyMap

Mikey's improvement directives, tracked. Workflow in `WORKFLOW.md`; verify gate is `bash dev/verify.sh`.

Status values: `open` · `in-progress` · `done` · `deferred` · `rejected` (with reason).

| ID | Directive | Status | Branch / commit | Notes |
|----|-----------|--------|-----------------|-------|
| — | Baseline: mapping slice built, E2E green, export board-deck ready | done | tag `v0.1.0-mapping-slice` | Manual authoring + 3 templates + export. **No quiz/guided generation.** |

## Resolved
- **Backup (2026-10-10):** local git bundle + daily cron (21:30 UTC) → `~/backups/`, log `~/backups/journeymap-backup.log`, keeps last 10. Off-machine remote deferred — same-disk bundles cover bad changes/corruption, not disk failure.

## Open decisions
- (none yet)

## How this works
1. Each directive gets an ID here, then a branch (`fix/D-00X-slug` or `feat/D-00X-slug`).
2. `bash dev/verify.sh` must pass before commit; commit message references the ID.
3. Status → `done (sha)`, or `deferred`/`rejected` with the reason written down.
