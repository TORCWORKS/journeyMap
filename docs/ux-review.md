# UX review — JourneyMap for fundraising leads (D-019 prep · 2026-10-11)

Audience: fundraising leads and staff — domain experts, **not tech-savvy**.
They know donor journeys; they must never have to learn "software". Goals in
priority order: **confidence (nothing is lost), learnability (know what to do
next), plain language, forgiveness.**

Framework: Nielsen's ten heuristics as applied to complex applications (NN/g),
novice-vs-expert guidance (NN/g, Jakob's law), training-wheels/progressive
disclosure (Carroll & Carrithers), low-digital-literacy UI guidance
(plain language, visible affordances, confirmation before irreversible
actions, minimal simultaneous choices), and in-app onboarding practice
(contextual hints at the first workflow, no information overload).

## What's already strong (keep)
- **Autosave + per-map library**: the single biggest lay-user fear (losing
  work) is already solved — it just is not *said*.
- **Click-any-card-to-edit**, dblclick/Enter aliases, editor on `+ card`.
- Guiding questions on every lane; landing tiles with plain blurbs; `?` help.
- Toasts for feedback ("Loaded:…", "Opened:…"), undo/redo present.
- Method page = honest onboarding; board-ready Export with plain labels.

## Findings (evidence from a live walk-through)

| # | Finding | Principle (NN/g) | Severity |
|---|---|---|---|
| F1 | **Autosave is invisible.** "Save file" downloads a JSON — sounds like *saving is manual*. Fear: "did it save?" Nothing ever says "saved". | System status | **P0** |
| F2 | **Undo/Redo are icon-only** (↶ ↷). Non-tech users scan for words. | Recognition over recall | **P0** |
| F3 | **Metric editor fields are referenced by placeholder, not label** — a lead can't tell which box is current/benchmark/target. | Match real world | **P0** |
| F4 | **Destructive actions lack a safety net the lay user can see**: delete stage (hover-×) removes its cards silently; delete map is instant; delete card is instant. Undo exists but is undiscoverable to this audience. | Error prevention / user control | **P0** |
| F5 | **First run = blank territory.** D-018 fixed the default, but a lead staring at 20 empty "+ card" cells has no "what do I do first". | Training wheels / Learnability | **P0** |
| F6 | **Toolbar holds 11 controls** incl. secondary items (Save/Load/Method/Help) with a mix of words and icons. Information overdose on first sight. | Minimalist design | P1 |
| F7 | **"Method" is internal jargon** for the methodology explainer; "Fit width" is zoom vocabulary. | Match real world | P1 |
| F8 | Empty canvas has no in-canvas pointer to Templates ("start from a portfolio") once the landing is closed. | Help & documentation | P1 |
| P2 | Focus rings/keyboard nav polish; lane-rename feature (documented limitation); touch targets on small screens. | a11y / flex | P2 |

## Proposed package

### P0 — quick wins (small, safe, high value)
1. **"Saved ✓" indicator** — subtle text in the status area updating after
   autosave ("Saved just now", no movement while idle). Confidence win #1.
2. **Word labels on undo/redo** — "↶ Undo" / "↷ Redo" (text + icon).
3. **Metric editor gets real labels** — Current (today) / Benchmark (suggested)
   / Target (goal) shown above the inputs; placeholders become examples only.
4. **Undo on destructive edits**: delete card/stage/map → toast "Deleted —
   Undo" with an actionable Undo button (in addition to keyboard/menu undo);
   delete-map/stage also get a plain-language confirm.
5. **First-run hint strip**: on a brand-new blank map, one dismissible line
   under the toolbar: "Your work saves automatically. Click ➕ card to add,
   any card to edit. Start from a portfolio under Templates." (Shown once;
   dismissed by closing or first card edit.)
6. **Rename**: "Save file" → "Download a copy…" ("Your work saves
   automatically. Download to move it to another computer."); "Load" →
   "Open a saved copy…".

### P1 — flow (next)
7. Declutter: group Save/Load (+Method, or move behind ⋯ menu); keep Export
   + Templates + My maps + Stage as the visible core.
8. "Method" → "How it works" (or "The method, in plain words") label; keep
   page name Method internally.
9. Empty-canvas pointer to Templates when a map has zero cards (one line).

### P2 — structural (later)
Focus rings, keyboard nav, custom-lane-rename, touch targets.

All P0 changes are verifiable with the existing gate + a vision pass; none
changes the data model.