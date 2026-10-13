# Release plan — public v0.0.1 (first push to GitHub)

Status: **PLAN — awaiting Mikey's confirm.** Nothing below has been executed.
Remote verified empty (`git ls-remote origin` → no refs), so the first push is a clean fast-forward onto a fresh default branch.

## What ships (tracked tree today)
`index.html` (the whole app) · `README.md` · `METHOD.md` · `BRAND.md` · `docs/*` (template-review, ux-review, enduser-review, alpha-guide) · `dev/*` (test harness: smoke/connectors/templates + verify + shots) · `.nojekyll` · `.gitignore`

`DIRECTIVES.md`, `WORKFLOW.md`, `AGENTS.md` are house ops docs (directive history, workflow, agent rules) — **see decision 3**.

## What must be created/changed before push

1. **Version identity (decision 1).** Tag `v0.0.1` + final commit stamping `APP_VERSION='v0.0.1'` (currently `v0.1.14-alpha`). One public story; internal miniversions remain notes in DIRECTIVES.md.
2. **LICENSE file (decision 2).** None exists. Recommended: **MIT** (permissive, standard for tools others may copy; nonprofit-friendly). Without one, the repo is all-rights-reserved.
3. **House docs (decision 3).** Recommended: publish all three after ONE neutralization — `AGENTS.md` line 14 references the local credential file path (`~/.pi/credentials/github.txt` + helper); repoint that sentence to "auth handled outside the repo". Neutralized, they read as a public changelog/process and cost nothing. Alternative: `git rm --cached` + `.gitignore` them (repo diverges from local ops docs).
4. **README sanitize.** One internal path leaks into the public README ("see `~/.pi/agent/wiki/plugin-saas/…`") → repoint to `docs/` (or drop).
5. **dev harness sanitize.** `dev/*.js` hardcode a fallback CHROME path (`/home/pi-agent/.cache/…`). Make CHROME env-only (fallback: 'chromium' + hint). No personal paths ship.
6. **GitHub repo settings.** Description ("Donor journey mapping for nonprofits — single-file, offline, no accounts, donor data never leaves the browser"), homepage `https://torcworks.github.io/journeyMap/`, topics (donor-journey, fundraising, nonprofit, single-file-app).
7. **Pages enable.** Settings → Pages → Deploy from a branch: **`main` / root** (matches README; `.nojekyll` present so the file is served as-is).
8. **Optional polish (decision 4).** Create GitHub **Release v0.0.1** with the board-ready export PNG (`/tmp/jm63-export-brand.png`) attached as preview — a good "show a colleague" surface, and the release notes double as the changelog. Recommended: yes.

## Push sequence (executed only after confirm)

1. Pre-flight: `bash dev/verify.sh` green (59 smoke + 21 connectors + 53 templates), `git status` clean, backup pushed to ~/backups.
2. Sanitization commits (items 1–5 above) — separate `chore(ops): sanitize for public` + debugger `release: v0.0.1` stamp commit; gate + visual spot-check after.
3. `git tag -a v0.0.1` (annotated) on the release commit.
4. `git push -u origin main` (auth via existing PAT helper; first push).
5. `git push origin v0.0.1` **explicitly** — do NOT `--follow-tags`: the internal milestone `v0.1.0-mapping-slice` tag stays local (its commit rides along in history, untagged).
6. Enable Pages (UI click or REST API), wait for first deploy (~1 min).
7. Verify live: fetch `https://torcworks.github.io/journeyMap/` → title/`✓ v0.0.1` stamp visible, and `sha256` of the served file === local `index.html` (same bytes is the whole integrity story).
8. Repo description/homepage/topics; Release v0.0.1 + PNG asset if approved (item 8).
9. Hand Mikey a one-liner for the colleague: URL + "no account, no install, donor data never leaves your browser".

## Verified already
- No credentials/secrets in tree (scanned for ghp_, PAT, TOKEN, passwords, credentials paths, /home/pi-agent).
- Only embedded personal identifier = the feedback inbox (`FEEDBACK_TO`, anon inbox) — public by design; it's how alpha leads send feedback.
- Remote empty → no orphan-README/force-push reconciliation needed.
- Rollback is trivially safe: if Pages misbehaves, disable it; the app is a single static file and staff access is served from this URL only once it's live.