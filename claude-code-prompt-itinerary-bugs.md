Fix bugs found while manually testing the client itinerary builder page at:
`/client-space/[token]/itinerary` (and its `/report` sub-route), on the deployed
preview `concept-sailing-idj4mnqu7-okamouns-projects.vercel.app`.

## Important — locate the feature first

This route was NOT found in the current checkout on any local or remote branch
(searched for "client-space" + "itinerary", "Day-by-Day Stops", "Itinerary
Builder" across all branches — no match). The `client-space/[token]` route
exists (`ClientSpaceClient.tsx`, `summary/`, `manifest/`) but there is no
`itinerary/` sub-route in this repo right now.

Before touching anything:
1. Confirm which branch/PR the itinerary builder actually lives on — check
   `gh pr list`, any unmerged remote branches, or ask the user which branch to
   check out. Do not guess at file paths or recreate the feature from scratch.
2. Once found, locate the component that renders "Day-by-Day Stops" (the stop
   date/title/location/description/highlights form), the day-index / day-number
   calculation, and the `/itinerary/report` summary page.

## Bug 1 — Stop date `<input type="date">` never shows the saved date

Every stop's date field renders empty (`mm/dd/yyyy` placeholder) even though
the day header right next to it shows the correct date (e.g. "DAY 0 · Sat 16
May"). The underlying date value clearly exists — it drives the day header and
the day numbering — but it isn't being passed into the `value` prop of the
date input, or it's being passed in the wrong format (native date inputs
require `value="YYYY-MM-DD"` exactly; anything else silently renders blank).

Fix: find where each stop's date input is rendered and make sure the ISO
`YYYY-MM-DD` string is set as its `value` (or `defaultValue`, if uncontrolled).
Check both the itinerary builder and any duplicate rendering on the report
page.

## Bug 2 (caused by bug 1) — Typing in the empty date field can corrupt day numbering, and it silently persists

Repro:
1. Open a stop's date field (it's empty per bug 1).
2. Click into it and type digits, e.g. `05162026`.
3. The year segment parses incorrectly (observed result: year became `0002`
   instead of `2026`).
4. Whatever computes the day index/label from `(stopDate - tripStartDate)`
   then produces a huge garbage value — observed "DAY 0" turning into
   "DAY -739251".
5. Reloading the page shows the corrupted day number persists — it was
   autosaved to Firestore immediately, with no debounce/validation gate.

This is a data-integrity risk: since the field starts blank, any real user who
clicks into it and starts typing (even accidentally) can scramble their
itinerary's day ordering permanently, with no confirmation step.

Fix, in priority order:
1. Fix bug 1 first — if the field is never blank, this failure mode mostly
   goes away.
2. Add validation before writing the date to state/Firestore: reject or clamp
   years outside a sane range (e.g. current year ± 5), and don't let a
   partially-typed/invalid date value flow into the day-index calculation.
3. Consider not writing to Firestore on every keystroke for date fields —
   debounce, or only commit on blur/valid-complete-date, so a mid-typing
   invalid state (like a 1-digit year) never gets persisted.

## Bug 3 — Report page "Trip Overview" card shows stale/wrong embarkation + dates

On `/client-space/[token]/itinerary/report`, the top "Trip Overview" summary
card shows:
- Embarkation: "Corinth Marina"
- Dates: "17 May 2026 – 24 May 2026"

But the actual day-by-day itinerary directly below it (and the builder page)
says:
- Day 0 embarkation stop is "Lavrion", dated 16 May 2026
- Trip runs Day 0 (16 May) through the last day

So the summary card's embarkation and start date don't match the real stop
data — it looks like the card is reading from a separate/stale/default field
(maybe a booking record's original embarkation marina, or a hardcoded
placeholder) instead of deriving it live from `stops[0]`.

Fix: make the Trip Overview card derive `embarkation` and the start of the
`dates` range from the actual Day 0 / first stop, the same source of truth
the day-by-day list below it uses, rather than a separate field.

## Verification

After fixing, re-test manually (or add/extend a test in `__tests__/`):
- Load the itinerary builder fresh — every stop's date input should show its
  real date, not a placeholder.
- Try typing into a date field with an incomplete/garbage year — day numbering
  should not go negative or nonsensical, and nothing invalid should get
  persisted if you navigate away mid-edit.
- Open `/itinerary/report` — Trip Overview's embarkation and date range should
  match Day 0 and the last day shown in the day-by-day list.
