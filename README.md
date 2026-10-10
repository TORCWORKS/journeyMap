# JourneyMap — donor journey mapping

A single-file web app for mapping a nonprofit's donor journey visually — stages left → right, lanes for what donors experience, the channels involved, what the org does, and where the gaps are. Built for the "what tool do I use to put our donor journey down visually?" question — instead of Visio / draw.io / a flat PDF template.

**The app is `index.html`. That's the whole thing.** No install, no server, no build, no accounts. Donor data never leaves the machine.

## Using it

- **Open:** double-click `index.html` (any modern browser, works offline).
- **Share:** email the single file, drop it on a shared drive, or host it anywhere — it's one static file.
- **Start:** pick a template on the landing screen — *Annual fund*, *Sustainer program*, *Major gifts* — or a blank map.
- **Deep link a template:** open with `#annual`, `#sustainer`, `#major`, or `#blank` (e.g. `index.html#major`).

### The map
- **Stages** = columns (lifecycle phases). Click the header to rename, `×` to delete, `+ Stage` or the dashed column to add.
- **Lanes** = rows: Donor experience · Channels & touchpoints · Org actions · Gaps & opportunities. Toggle them in the bar above the canvas, or add a custom lane.
- **Cards** = the items in each stage × lane cell. Click `+ card` or empty cell space to add; `⋯` to edit; drag to move between cells.
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
