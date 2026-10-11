# Template library review (D-015.5 · 2026-10-11)

Grounding used: donor-lifecycle frameworks (Bloomerang: awareness → acquisition →
first gift → stewardship → repeat/upgrade → lapsing → lapsed → recapture),
moves-management canon (Dunlop/Cornell via CCS, Blackbaud, AFP guide:
identification → qualification → cultivation → solicitation → stewardship),
event/peer-to-peer cycles (charityengine, kind sight, SOFII, Virtuous), and
service-blueprint presentation lineage (Shostack). Method page citations remain
the canonical source list.

## Verdict
Writing quality is the app's strongest asset — titles are specific and honest
("Long silence after the first gift", "First-touch source is untracked"), notes
are second-person and practical. But the library has **four systematic
structure problems** and one credibility gap.

## Findings

### F1 — Over-populated and formulaic (esp. annual giving)
- Annual giving: **32 cards in a 7-stage × 5-lane grid** — exactly **one card per
  cell**, including **7 gap cards** (25% of the map is problem-naming). Reads as a
  finished solution, not a starting map; staff may not touch it. High width
  forces horizontal scroll on laptops.
- All templates follow the same uniform 1-exp + 1-ch + 1-act + 1-gap per stage
  pattern. Real maps have irregular density (hot stages, sparse ones). The
  formula is legible but cookie-cutter.
- Gap-title phrasing repeats: "No X…", "Nothing catches Y…" 7× in annual alone.
  Repetition dilutes the punch of the good ones.

### F2 — Parity gaps between the portfolios
| Template | stages | cards | ideas | metrics | episodes lane |
|---|---|---|---|---|---|
| Annual giving | 7 | 32 | 0 | 3 | ✓ Recurring episodes |
| Leadership giving | 6 | 24 | 0 | 0 | ✗ |
| Planned giving | 6 | 24 | 0 | 0 | ✗ |
| Signature events | 6 | 28 | 0 | 0 | ✓ Annual cycle |
| Community events | 5 | 20 | 0 | 0 | ✗ |
| Change Makers | 6 | 27 | 0 | 0 | ✓ Campaign calendar |
| Corporate | 6 | 24 | 0 | 0 | ✓ Renewal cycle |

- **Metrics pile up in annual only** (all 3 seeds live there). The optimizer
  flywheel starts empty for the other six portfolios.
- **Idea (💡) cards: zero anywhere** — the card-kind feature ships with no
  exemplar, so staff never see what an Idea looks like or what the filter does.
- **Episodes/rhythm lane missing** in leadership, planned, community — yet each
  has a real calendar (annual leadership touchpoints/events; legacy
  lifecycle moments; seasonal community days). Lane-guiding questions are
  customised only in some templates.

### F3 — Framework grounding is implicit, not legible
- The stage sets already trace the canons *almost verbatim*: leadership ≈ Dunlop
  Identify→Qualify→Cultivate→Ask→Steward→Expand; annual ≈ Bloomerang lifecycle
  incl. lapsing/lapsed; corporate ≈ sales funnel (Identify…Renewal). But nothing
  says so. For a board/lead audience the maps would land harder if the template
  itself announced the framework it traces.
- Public donor-journey maps are usually single-path diagrams (5–7 stages +
  touchpoint lists). Our lane/blueprint presentation is defensible and stronger
  (service-blueprint lineage, real touchpoint rows), but the *stage labels* are
  the part reviewers recognise — make the mapping explicit.

### F4 — Small writing flat spots
- Near-duplicate action cards in annual stewardship ("board thank-you call" ch
  vs "stewardship plan per segment" act overlap).
- A few ch-cards are empty-ish ("Appeal email → landing page → form" is a given;
  the *insight* is in the note).

## Proposed D-016 changes (all test-guarded)
1. **Rebalance density**: annual cut to ~24–26 cards — merge stages At risk +
   Lapsed → "Retention & win-back" (6 stages) OR keep 7 and drop the weakest
   4–5 gap/dupe cards. Rebalance 1-2 other templates to break the uniform
   1-per-cell look (leave deliberate gaps empty where the cell genuinely is
   empty).
2. **Episodes parity**: add "Annual rhythm" lane to leadership (Q1 update, gala/
   site visit, year-end gift, strategic conversation), "Lifecycle moments" to
   planned (wills week, advisor seminars, commemorative moments), "Seasonal
   cycle" to community (annual community day, festival slot, school seasons).
3. **Metrics parity**: seed 2–3 suggested metrics per portfolio using the bench
   schema (e.g. leadership: 1st-year retention / qualification→ask ratio;
   signature: attendee→donor conversion; corporate: renewal rate; community:
   attendee→subscriber; change makers: alumni re-recruit rate; planned: notice→
   recognition response). Benchmarks stay labelled *suggested*.
4. **Idea exemplars**: add 2–3 💡 cards per portfolio (flagship ideas, e.g.
   annual: "Anniversary phone call for sustainers"; leadership: "Donor-advised
   funds as a first-touch pipeline"; planned: "Free wills-week clinic"), so the
   Idea kind + priority + filter are demonstrated.
5. **Phrasing**: vary gap titles; kill the 2–3 near-duplicate cards; add timing
   hints to 2-3 stage names ("Second gift (~8 weeks)").
6. **Credibility**: Method page section "What the templates trace" — map each
   portfolio to its framework by name (Dunlop moves management, Bloomerang
   lifecycle, event/peer-to-peer/sales cycles) with the existing citations;
   reflect one line in each landing-tile blurb.
7. **Guarding**: update smoke/templates counts, `bash dev/verify.sh` green,
   regenerate template screenshots, vision review per template.