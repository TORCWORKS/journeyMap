# Development workflow

A real project now: versioned, verifiable, rollback-safe.

## Repo layout
```
index.html        ← the product. The ONLY deployable artifact. Hand this over.
README.md         ← what it is + how to use it
WORKFLOW.md       ← this file
DIRECTIVES.md     ← improvement backlog (Mikey's directives → tracked items)
AGENTS.md         ← instructions for the AI agent working in this repo
dev/              ← test harness only (never shipped, never committed to node_modules)
  verify.sh       ← the gate: syntax + E2E smoke. Run before every commit.
  smoke.js        ← end-to-end behavioural test (10 checks)
  shots.js        ← regenerates screenshots + the exported-PNG artifact
```

## The gate
```bash
bash dev/verify.sh     # exit 0 = green
```
Nothing is committed unless this passes. `main` is always green.

## Branches & commits
- `main` — always verified, always shippable.
- One branch per directive or directive group: `fix/<id>-<slug>`, `feat/<id>-<slug>`.
- Commit messages: `type(scope): summary` — types: `feat`, `fix`, `polish`, `docs`, `test`, `chore`.
  Example: `fix(export): wrap card titles instead of truncating (D-003)`.
- Reference the directive ID (`D-00N`) in commits that implement a directive.
- Small commits; one concern each. The whole app is one file, so keep diffs readable.

## Milestones & rollback
- Tag accepted milestones: `git tag -a v0.1.0-mapping-slice -m "..."`. Current baseline is tagged.
- **Rollback recipes** (all safe, history-preserving):
  - Undo one bad commit: `git revert <sha>` (makes a new commit that reverses it)
  - Inspect/return to a tagged state: `git switch --detach v0.1.0-mapping-slice`, then `git switch main`
  - Discard uncommitted edits to the app: `git restore index.html`
  - Compare current work against the last good tag: `git diff v0.1.0-mapping-slice -- index.html`
- Guarantee: any change can be undone; no directive can leave us stuck.

## Directives (how Mikey's improvements flow)
1. Mikey gives directives → each becomes a row in `DIRECTIVES.md` with an ID (`D-001`, `D-002`, …) and status `open`.
2. Work happens on a branch named for the directive; status moves `open → in-progress`.
3. On completion: `dev/verify.sh` green → commit → status `done (sha)`. Anything not verifiable is stated explicitly.
4. Rejected/deferred directives are recorded with the reason — never silently dropped.

## Backup (beyond the local repo)
The repo is local. Git protects against *change*, not *machine loss*, so a backup copy is taken off-repo:
`git bundle` into `~/backups/` (single self-contained file; restores the entire history with `git clone <file> <dir>`).
Run manually or on a schedule — see `DIRECTIVES.md` for the open decision on a remote.
