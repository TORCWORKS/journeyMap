# Directives — JourneyMap

Mikey's improvement directives, tracked. Workflow in `WORKFLOW.md`; verify gate is `bash dev/verify.sh`.

Status values: `open` · `in-progress` · `done` · `deferred` · `rejected` (with reason).

| ID | Directive | Status | Branch / commit | Notes |
|----|-----------|--------|-----------------|-------|
| — | Baseline: mapping slice built, E2E green, export board-deck ready | done | tag `v0.1.0-mapping-slice` | Manual authoring + 3 templates + export. **No quiz/guided generation.** |

## Open decisions
- **Remote backup:** local git + `~/backups` bundle vs. a private remote (GitHub/etc.). No `gh` CLI or credentials on this machine yet — needs Mikey's input.

## How this works
1. Each directive gets an ID here, then a branch (`fix/D-00X-slug` or `feat/D-00X-slug`).
2. `bash dev/verify.sh` must pass before commit; commit message references the ID.
3. Status → `done (sha)`, or `deferred`/`rejected` with the reason written down.
