# Directives — JourneyMap

Mikey's improvement directives, tracked. Workflow in `WORKFLOW.md`; verify gate is `bash dev/verify.sh`.

Status values: `open` · `in-progress` · `done` · `deferred` · `rejected` (with reason).

| ID | Directive | Status | Branch | Notes |
|----|-----------|--------|--------|-------|
| D-001 | Connector polish: connections must start & end **on the card boundary** (not floating) and the arrow must append cleanly to the line | done (merged `874d4a2` → `c8e4d9e`; **tag on acceptance**) | `fix/D-001-connector-polish` | Root cause (measured): the edge `<svg>` lived outside the zoomed `#grid` and used painted-px rects → arrows drew at ~55% scale from the wrong origin. Fix: svg inside the grid, layout-px normalisation (live zoom ratio), shared `edgeGeometry()` for app+export (border anchors, perpendicular tangents), arrow tip on the target border (`refX=10`, `userSpaceOnUse`), butt cap, origin nub, connectors follow drags. Gate: `dev/connectors.js` (18 checks). |
| D-002 | Rebuild the starting template library **portfolio-first** (decision: portfolio journeys with recurring episodes embedded), mirroring the org's 7 programs: Change Makers (P2P) · Signature Events · Community Events · Annual Giving · Planned Giving · Corporate Sponsorship · Leadership Giving | done (merged `2049edf` → `5fdce8f`; **tag on acceptance**) | `feat/D-002-template-library` | **Lanes are per-document** (`doc.rows`) so templates speak their portfolio's language and carry an embedded episodes lane; old maps migrate. Picker = 8 category-chipped tiles + new deep links. Two real bugs caught by tests: body wasn't `display:flex` (pickered was clipped into 110px); `ensureRows` reassigned `doc.rows` copies each call → lane chips toggled detached objects (hide worked, re-show didn't) — now idempotent in-place. Gate: `dev/templates.js`. |
| D-003 | Add a **guiding question** under each lane so staff know how to fill it (e.g. Channels & touchpoints → “How are we actively engaging them at this stage?”) | **RELOCATED on Mikey's feedback** — questions now sit *under the lane header band* (name + question spanning the journey), gutter column removed (app + export); merge pending review. First pass was merged (`247a58e` → `aae0b32`) but the gutter placement was rejected. | `feat/D-003-lane-guides` | Questions live on each lane (`row.q`), portfolio-tuned (corporate “What does the company need…?”, events, P2P, planned giving have their own); shown in the lane header band (app + export), the card editor, and lane-chip tooltips; legacy docs fall back to defaults (`rowQ`). Added an untouched-editor guard: stray clicks no longer commit junk “Untitled” cards. Tests: 14 smoke + 18 connectors + 49 templates, green. |
| — | Baseline: mapping slice built, E2E green, export board-deck ready | done | tag `v0.1.0-mapping-slice` | Manual authoring + 3 templates + export. **No quiz/guided generation.** |

## Resolved
- **Backup (2026-10-10):** local git bundle + daily cron (21:30 UTC) → `~/backups/`, log `~/backups/journeymap-backup.log`, keeps last 10. Off-machine remote deferred — same-disk bundles cover bad changes/corruption, not disk failure.

## Open decisions
- (none yet)

## How this works
1. Each directive gets an ID here, then a branch (`fix/D-00X-slug` or `feat/D-00X-slug`).
2. `bash dev/verify.sh` must pass before commit; commit message references the ID.
3. Status → `done (sha)`, or `deferred`/`rejected` with the reason written down.