# Directives — JourneyMap

Mikey's improvement directives, tracked. Workflow in `WORKFLOW.md`; verify gate is `bash dev/verify.sh`.

Status values: `open` · `in-progress` · `done` · `deferred` · `rejected` (with reason).

| ID | Directive | Status | Branch / commit | Notes |
|----|-----------|--------|-----------------|-------|
| D-001 | Polished connect/connector visuals: connections must start & end **on the card boundary** (not floating) and the arrow must append cleanly to the line | done (merged `874d4a2` → `c8e4d9e`; **tag on Mikey's acceptance**) | `fix/D-001-connector-polish` |
| D-002 | Rebuild the starting template library **portfolio-first** (decision: portfolio journeys with recurring episodes embedded — per Mikey's pick), mirroring the org's 7 programs: Change Makers (P2P), Signature Events, Community Events, Annual Giving, Planned Giving, Corporate Sponsorship, Leadership Giving | done (merged `2049edf` → `5fdce8f`; **tag on Mikey's acceptance**) | `feat/D-002-template-library` |
| D-003 | Add a **guiding question** under each lane so staff know how to fill it (e.g. Channels & touchpoints → “How are we actively engaging them at this stage?”) | done (merged `247a58e` → `aae0b32`; **tag pending Mikey's acceptance**) | `feat/D-003-lane-guides` | Questions live on each lane (`row.q`), portfolio-tuned (corporate “Partner experience → What does the company need…?”, events, P2P, planned giving have their own); rendered in the gutter under the lane name, in the card editor as a prompt, in lane-chip hover tooltips, and in the export beneath each lane label. New checks in `dev/templates.js` (every lane has a question; legacy docs fall back to defaults). Mid-build bug caught by tests: chip bar never rendered on restore-from-autosave — fixed in `init`. | **Lanes are now per-document** (`doc.rows`) so templates speak their portfolio's language (corporate = "Partner experience", events = "Attendee experience") and can carry an embedded episodes lane; old maps migrate (default 4 lanes). New gate `dev/templates.js` (40 checks), smoke upgraded to real assertions (14). Mid-build bug caught by test: `ensureRows` reassigned `doc.rows` with copies on every call → lane chips were toggling detached objects (hide worked, re-show didn't); fixed with in-place idempotent normalization. | Root cause found by measurement: the edge `<svg>` sat **outside** the zoomed `#grid` and used `getBoundingClientRect()` deltas (painted/zoomed px) → every arrow was drawn at ~55% scale from the wrong origin when Fit-width was active, i.e. genuinely floating. Fix: svg moved inside `#grid` (zooms with the cards), coordinates normalised to layout px, one shared `edgeGeometry()` for app+export (anchors on the border, curve leaves/enters perpendicular), arrowhead tip exactly on the target border (`refX=10`, `markerUnits=userSpaceOnUse`), butt line cap (no overshoot), origin nub on the source border, and connectors now **follow cards live while dragging**. New gate: `dev/connectors.js` (18 independent geometric checks at fit zoom + 100%). |
| — | Baseline: mapping slice built, E2E green, export board-deck ready | done | tag `v0.1.0-mapping-slice` | Manual authoring + 3 templates + export. **No quiz/guided generation.** |

## Resolved
- **Backup (2026-10-10):** local git bundle + daily cron (21:30 UTC) → `~/backups/`, log `~/backups/journeymap-backup.log`, keeps last 10. Off-machine remote deferred — same-disk bundles cover bad changes/corruption, not disk failure.

## Open decisions
- (none yet)

## How this works
1. Each directive gets an ID here, then a branch (`fix/D-00X-slug` or `feat/D-00X-slug`).
2. `bash dev/verify.sh` must pass before commit; commit message references the ID.
3. Status → `done (sha)`, or `deferred`/`rejected` with the reason written down.
