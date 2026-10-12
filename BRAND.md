# Brand — Torc Works

The publisher identity for JourneyMap and whatever follows it. Decided 2026-10-11 (D-013).

## The name

**Torc Works** — a torc is the twisted-metal neck-ring of Iron Age Britain; the finest ever found is the Great Torc from Snettisham, in the territory of the Iceni, Boudica's people.

Why the object and not the queen:

- **A torc is a ring twisted shut around a gap.** It is, structurally, the product: gaps and opportunities closed one twist at a time. "The gap" is even a lane on every map.
- **A torc was a gift object.** Torcs marked rank and were given by a patron to a client — the oldest form of donor recognition. A house named after a gift object that admits it has an opening is honest about the work.
- **A torc is one strand.** Twisted from a single piece, like the app: one file, no build, no dependencies.

**Why Boudica at all — the thesis the name carries.** Her experience was left out of the record: everything known about her comes from Tacitus and Dio, her enemies' accounts. Prasutagus was a loyal Roman client-king — a major donor to an institution that then ignored his will and humiliated his family. A donor journey map exists to put the supporter's experience into the written record *before* the broken relationship becomes expensive.

**What the name must never do:** no warrior, queen, chariot, flame, or "burn London" imagery. Boudica is the *argument*; the torc is the *mark*. The register is a small press that publishes working documents, not a rebellion.

## The mark

An open ring, monoline, round caps, opening at the top.

```svg
<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
  <path d="M4.80,2.29 A5.2,5.2 0 1 0 9.20,2.29"
        fill="none" stroke="#8b8374" stroke-width="1.7" stroke-linecap="round"/>
</svg>
```

- Centre 7,7 · r 5.2 · terminals at −115° and −65° → a **50° opening** at the top, drawn the long way (large-arc 1, sweep 0). 70° read as a horseshoe; 50° reads as a torc.
- Colour: `--muted` `#8b8374` on paper, or `currentColor` when inherited.
- Open refinement (not blocking): twist hatching on the two terminals so it reads as worked metal rather than a letter C.

## The wordmark

`TORC WORKS` in **letter-spaced small caps**, `letter-spacing:1.7px` at `10.5px`, weight 700, ink `#6f6859`, system UI stack — the app ships no webfonts and the wordmark must never require one.

- **Horizontal lockup (default):** mark left, 12px gap, wordmark baseline aligned to the mark's centre.
- **Square lockup:** mark above wordmark, centred — for the landing tile / future favicon.
- Never set it as one word (`Torcworks`) and never lowercase the wordmark.

## Byline strings (exact — use these, don't improvise)

| Where | String |
|---|---|
| Export PNG footer (left) | `TORC WORKS` |
| Export PNG footer (right) | `JourneyMap · no install · no accounts · donor data never leaves this machine` |
| Method sheet footer | `Torc Works · JourneyMap — no install, no accounts, donor data never leaves this machine` |
| Help sheet footer | `TORC WORKS · a single file — nothing leaves this machine` (one line, in a pinned `.modal-foot` with the *Got it* button) |
| README | *JourneyMap is published by **Torc Works**.* |
| Browser tab / `<title>` | **not used** — the publisher lives in the colophon, not the title |

The publisher's placement is deliberate and follows publishing convention: **a colophon at the foot of the artifact, plus this record.** No byline in the toolbar.

**Sheet rule:** while a sheet (Method or Help) is open, `body.sheet-open` hides the toast and dismisses any in-flight one — a modal owns the screen, so transient background messages must not compete with it. The Help sheet is a flex column (`#modalHelp .modal`), so its `.modal-foot` colophon and *Got it* button are pinned outside the scrolling `.modal-body` rather than floating over it.

## Voice

Plain, bookish, specific. Names sources, labels its own adaptations, states its caveats, never sells. The Method page is the house style in action — it cites Kalbach, Burk, Burnett, Shostack and Dunlop, and marks its own inventions as inventions. Anything published under this name should be able to survive that standard.

## Collisions — read before printing

- **Torc Robotics** (`torc.ai`, Daimler Trucks) holds the strong mark in autonomous vehicles. Mitigations: always the two-word form, always the identifying surname, stay in the fundraising/nonprofit category, never shorten to "Torc" as a company name in public.
- "torc" also means *torque* in engineering and a jewellery form elsewhere — the surname does the disambiguating work.
- Avoided on purpose: `Victrix` (historical-miniatures company), `Iceni` (a common company word), `Venta` (retail/HVAC).

## Domains & handles — checked 2026-10-11

| Name | Status | Source |
|---|---|---|
| **torcworks.ca** | **available** | registry: "Domain not found" |
| **torcworks.org** | **available** | RDAP not found |
| **torcworks.studio** | **available** | RDAP not found |
| torcworks.io / .co | likely available — no NS records; RDAP lookup unsupported, confirm at registrar | DNS |
| torcworks.com | **registered** — parked Fasthosts page; would need a broker | registry |
| torc.works | registered (a live site) | registry |
| torc.ai | Torc Robotics | DNS |
| github.com/torcworks | **available** (404) | GitHub |

**Buy now:** `torcworks.ca` (home market — Ontario, Canadian NFPs) and the `@torcworks` GitHub handle. `torcworks.org` second, if the method papers ever get published as a sector-facing series.

## Open threads

- Mark refinement (twisted terminals) + favicon.
- Whether an editorial imprint ever appears alongside it — the publishing-industry move is `Torc Press, an imprint of Torc Works`, if the Method line grows into papers. Nothing to do now.
- Export filename still `slug(title).png` — no brand in the filename, intentionally.
