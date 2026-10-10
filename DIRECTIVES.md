# Directives — JourneyMap

Mikey's improvement directives, tracked. Workflow in `WORKFLOW.md`; verify gate is `bash dev/verify.sh`.

Status values: `open` · `in-progress` · `done` · `deferred` · `rejected` (with reason).

| ID | Directive | Status | Branch / commit | Notes |
|----|-----------|--------|-----------------|-------|
| D-001 | Polished connect/connector visuals: connections must start & end **on the card boundary** (not floating) and the arrow must append cleanly to the line | done (merged `874d4a2` → `c8e4d9e`; **tag on Mikey's acceptance**) | `fix/D-001-connector-polish` | Root cause found by measurement: the edge `<svg>` sat **outside** the zoomed `#grid` and used `getBoundingClientRect()` deltas (painted/zoomed px) → every arrow was drawn at ~55% scale from the wrong origin when Fit-width was active, i.e. genuinely floating. Fix: svg moved inside `#grid` (zooms with the cards), coordinates normalised to layout px, one shared `edgeGeometry()` for app+export (anchors on the border, curve leaves/enters perpendicular), arrowhead tip exactly on the target border (`refX=10`, `markerUnits=userSpaceOnUse`), butt line cap (no overshoot), origin nub on the source border, and connectors now **follow cards live while dragging**. New gate: `dev/connectors.js` (18 independent geometric checks at fit zoom + 100%). |
| — | Baseline: mapping slice built, E2E green, export board-deck ready | done | tag `v0.1.0-mapping-slice` | Manual authoring + 3 templates + export. **No quiz/guided generation.** |

## Resolved
- **Backup (2026-10-10):** local git bundle + daily cron (21:30 UTC) → `~/backups/`, log `~/backups/journeymap-backup.log`, keeps last 10. Off-machine remote deferred — same-disk bundles cover bad changes/corruption, not disk failure.

## Open decisions
- (none yet)

## How this works
1. Each directive gets an ID here, then a branch (`fix/D-00X-slug` or `feat/D-00X-slug`).
2. `bash dev/verify.sh` must pass before commit; commit message references the ID.
3. Status → `done (sha)`, or `deferred`/`rejected` with the reason written down.
