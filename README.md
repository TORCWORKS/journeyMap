# JourneyMap — donor journey mapping

A single-file web app for mapping a nonprofit's donor journey visually — stages left → right, lanes for what donors experience, the channels involved, what the org does, and where the gaps are. Built for the "what tool do I use to put our donor journey down visually?" question — instead of Visio / draw.io / a flat PDF template.

**The app is `index.html`. That's the whole thing.** No install, no server, no build, no accounts. Donor data never leaves the machine.

## Using it

- **Open:** double-click `index.html` (any modern browser, works offline).
- **Share:** email the single file, drop it on a shared drive, or host it anywhere — it's one static file.
- **Start:** pick the portfolio your team owns on the landing screen — *Annual giving*, *Leadership giving*, *Planned giving*, *Signature events*, *Community events*, *Change Makers*, *Corporate sponsorship* — or a blank map. Each template is a standard journey for that portfolio, with the recurring episodes (appeals, event cycle) embedded as their own lane.
- **Deep link a template:** open with `#annual-giving`, `#leadership-giving`, `#planned-giving`, `#signature-events`, `#community-events`, `#change-makers`, `#corporate-sponsorship`, or `#blank` (old links `#annual` / `#sustainer` → annual giving, `#major` → leadership giving still work).

### The map
- **Stages** = columns (lifecycle phases). Click the header to rename, `×` to delete, `+ Stage` or the dashed column to add.
- **Lanes** = rows. Each map carries its own lanes — the standard four (Donor experience · Channels & touchpoints · Org actions · Gaps & opportunities) plus portfolio extras (e.g. **Recurring episodes** on Annual giving — the appeal calendar). Toggle them in the bar above the canvas, add a custom lane, or remove a custom lane with its `×`.
- **Every lane carries a guiding question** under its name (hover a lane chip, or open the card editor) — e.g. *Channels & touchpoints — “How are we actively engaging them at this stage?”* — so staff know what kind of card to write in each lane. The questions appear on the map, in the editor, and in the exported PNG.
- **Cards** = the items in each stage × lane cell. Click `+ card` or empty cell space to add; **click a card to edit it** (title, note, Current/Idea kind, priority — or press `Enter` on a selected card); drag to move between cells; `Delete` removes the selected card.
- **Current vs Ideas** — every card is either **Current** (solid border) or **💡 Idea** (dashed, with a low/med/high priority dot): an aspiration you're weighing. Switch a card's kind in its editor; filter the whole map to `All / Current / Ideas` (Ideas-only ≈ your to-do view). The exported PNG shows both, with a legend line.
- **Metrics** — any card can carry a three-number KPI: *current → target (benchmark norm)*, e.g. `First→second gift conversion · 22% → 30% (norm 35%)`. Attach one via `＋ Metric` in the card editor. The benchmark column auto-fills as a **suggested norm** when it recognises the metric name (e.g. retention, conversion, reactivation) — always editable, and confirm it before presenting. Stages with metrics show a compact summary strip under their stage header, so a leader can scan for the red ones.
- **Connect mode** = draw flow arrows between cards (click start card → target card; click again to remove).
- **Fit width / zoom** = toolbar dropdown; *Fit width* keeps the whole journey on screen (default).

### Saving & exporting
| Action | Where | Notes |
|---|---|---|
| Autosave | automatic | Saves to this browser's local storage; reloading restores your map. |
| Save file | toolbar | Downloads `.journeymap.json` — the portable copy. |
| Load | toolbar | Opens a saved `.journeymap.json`. |
| Export PNG | toolbar | Clean, board-ready image of the map (title, legend, arrows). |
| PDF | toolbar | Print dialog → save as PDF (uses the browser's print). |

**Sharing caution:** autosave is local to the browser, so edits inside a shared file don't travel to the recipient. To hand a map over, use **Save file** and send the `.json` (the recipient clicks **Load**).

### Shortcuts
`Ctrl/⌘+Z` undo · `Ctrl/⌘+Shift+Z` (or `Ctrl+Y`) redo · `Delete` removes the selected card or stage · `Esc` closes the editor / exits connect mode.

## Method & credibility
`METHOD.md` is the short, printable case for how this approach is grounded:
journey mapping & service design anatomy (Kalbach; NN/g; Shostack), donor-
centered fundraising (Burk), and relationship fundraising / moves management
(Burnett; Dunlop/Cornell) — with every *adaptation* we made (the Recurring
episodes lane, the suggested-norm benchmarks, the as-is/to-be Ideas layer)
explicitly labelled as ours rather than inherited doctrine.

## Files
```
index.html      ← the app (everything: markup, styles, logic)
README.md       ← this file
dev/            ← dev-only test harness (not needed to use or share the app)
  smoke.js      ← end-to-end smoke test: node dev/smoke.js
  shots.js      ← regenerates screenshots + the exported-PNG artifact
```
The harness needs `playwright-core` and a Chromium binary (`CHROME=/path/to/chrome node dev/smoke.js`). Default path is the Playwright cache under `~/.cache/ms-playwright/`.

## Known limitations / next up
- **No quiz / guided generation yet.** This build is manual authoring + templates only. The planned next slice is a question flow whose answers render straight onto the map (a quiz question is only valid if its answer becomes a map element). The templates are the target output shape of that flow.
- No multi-user collaboration or shared links; handover is the JSON file.
- Undo history is in-memory (not persisted across reloads).
- Row/lane renames aren't editable after creation (custom lanes only).
- Stage reordering is by deletion + re-add (no drag-to-reorder columns).
- Export PNG re-renders the map from data (clean layout) rather than screenshotting the canvas — so the export is a *designed* artifact, not pixel-identical to the screen.
- No data ingestion or analysis yet — this is deliberately just the mapping slice. The donor-journey *optimizer* concept (leak diagnosis, benchmarked opportunities) is a separate, later layer; see `~/.pi/agent/wiki/plugin-saas/notes/donor-journey-optimizer.md`.
