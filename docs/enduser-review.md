# End-user readiness review (D-036 prep · 2026-10-12)

Audience: the fundraising lead (alpha), then staff. Bar for handing over:
**nothing can silently lose work, nothing looks unfinished, the publisher
identity is on every artifact, and the first session succeeds.**

## Must-fix before handover (small, verifiable)

1. **Silent save failure (confirmed gap).** If the browser's storage is
   full or blocked (quota / private mode / hardened policies), all writes
   fail *silently* — the "✓ Saved" never appears and no warning does; the
   user later reloads and their work is gone. Probe confirmed zero signal.
   Fix: catch write failure once → toast "⚠ Couldn't save to this
   browser — download a copy" and pin it until acknowledged.
2. **Lane renaming (documented limitation, now material).** A lead will
   want to rename "Recurring episodes" to their calendar's name, or a
   custom lane after creation. Fix: inline rename on any lane chip (double-
   click or a small ✎ on hover, matching the My-maps rows); ids stay
   stable. Removes README limitation.
3. **Publisher identity everywhere (merging D-013).** TORC WORKS colophon
   on the exported PNG, Method sheet, and Help sheet is already built,
   reviewed, and ACCEPTED — it sits unmerged on `feat/D-013-brand-imprint`.
   A board artifact without the publisher is the unfinished look. Merge it
   (→ v0.1.14) before handing over.
4. **Print/PDF polish (copy only).** @page margins are set; browser print
   dialogs still add headers/footers by default. Add the one-line
   instruction to the Export PDF tooltip + the alpha guide ("Print → Save
   as PDF, turn off headers & footers").

## Must-decide before handover (process, needs Mikey)

5. **Deploy.** End users need a URL: push to GitHub + enable Pages
   (torcworks.github.io/journeyMap) + the FEEDBACK_TO inbox is already
   active. This is the critical path — the file is ready; the go is
   Mikey's.
6. **Alpha-guide refresh** for the new behaviours: touch-to-persist ("My
   maps shows your work — untouched templates stay hidden until you edit
   them"), lane renaming, the direct-Send feedback, print headers tip.

## Watch during the alpha (evidence)

7. Which templates/lanes they touch first, and whether they rename lanes.
8. Whether suggested benchmarks get edited or trusted (labels working?).
9. First-week feedback: version stamp + the send-feedback path make
   reports attributable.

## Deliberately deferred (documented, not built now)

10. Undo across reloads (in-memory today; low risk with autosave; note to
    tester).
11. Quiz-assisted generation, optimizer layer, multi-user sync, data
    ingestion — the post-alpha roadmap.