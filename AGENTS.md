# Project instructions — JourneyMap (donor journey mapping)

Applies whenever working in this folder. Read `WORKFLOW.md` and `DIRECTIVES.md` first.

- **`index.html` is the product.** Single self-contained file: no build step, no dependencies, no server, no network calls. Keep it that way unless Mikey explicitly asks for a stack change. Never split it into multiple files as a "refactor".
- **`dev/` is never shipped.** node_modules is gitignored; `package.json`/`package-lock.json` are committed for reproducibility only.
- **Verify before every commit:** `bash dev/verify.sh` (JS syntax + E2E). If it fails, fix or report — never commit red, never mark a directive `done` with a failing or partial check.
- **The todo board is scratch; `DIRECTIVES.md` is the source of truth.** Use todos only within a single working session, and **clear the board at the end of every directive** (and at session end) — stale tasks accumulate otherwise.
- **Work directives on branches**, named `fix/D-00X-slug` or `feat/D-00X-slug`; reference the ID in the commit message; update `DIRECTIVES.md` status in the same commit.
- **Rollback must always be possible:** keep `main` green, tag accepted milestones (`v0.X.Y-...`), never force-push or rewrite shared history, never `git reset --hard` away uncommitted user work without asking.
- **Verify visually, not just functionally:** the app's bar is "genuinely impressive to a fundraising lead". For UI/export changes, regenerate screenshots (`dev/shots.js`) and get a vision-model review of the result before declaring done.
- **Keep `README.md` current** when behaviour, shortcuts, or limitations change (including what is *not* built).
- **Donor data is sensitive:** the app must stay local-first (no upload, no telemetry, no accounts). Never add anything that sends donor data anywhere.
