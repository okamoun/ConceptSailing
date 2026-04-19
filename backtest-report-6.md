# Regression Test Report: `add_prices` Branch
**Date:** 2026-04-19  
**Production:** https://www.blueoneyacht.com  
**Preview:** https://concept-sailing-git-addprices-okamouns-projects.vercel.app  
**Branch:** `add_prices`  
**Changed files:** `app/blueone/BlueOneClient.tsx`, `app/specifications/page.tsx`, `specifications-nextjs.tsx`, `specifications.html`, `BlueOne_Complete_Specifications.xlsx`

---

## Result: ✅ PASS — No regressions. Two intentional changes confirmed.

---

## Changes Detected

### 1. `/blueone` — Cabin count corrected + new CTA button

**Cabin count:**

| | Production | Preview |
|-|-----------|---------|
| Cabins | "**4** Generous Guest Cabins" | "**5** Generous Guest Cabins" |
| Description | Four spacious double-bed cabins | Four spacious double-bed cabins and one master cabin |

**New "View Specifications" button** added to the bottom CTA section between "Booking Request" and "Contact Us", linking to the new `/specifications` page.

### 2. New `/specifications` page

A brand-new technical specifications page at `/specifications` — does not exist on production. Key content:

**Quick Facts**
| Category | Details |
|----------|---------|
| Model | Fountaine Pajot Aura 51 |
| Year Built | 2025 |
| Length | 51 ft |
| Beam | 26.70 ft |
| Draft | 4.70 ft |
| Max Capacity | 10 persons |
| Cruising Speed | 7 knots |
| Max Speed | 10 knots |
| Engines | 2 × 70A |
| Generator | Kohler 32 kVA |
| Cabins | 7 total (5 guest + 2 crew) |
| Heads/Showers | 5 each |
| Power | Solar + Hybrid |
| Internet | Starlink |

The page includes a full technical specifications table organised by category (onboard systems & power, navigation, safety, galley, deck equipment, watersports, etc.).

> **Note:** Despite the branch name `add_prices`, no pricing information was added. The page is a specifications sheet only.

---

## Pages Tested — No Regressions

| Page | Production | Preview | Match |
|------|-----------|---------|-------|
| `/` Home | ✅ | ✅ | Identical |
| `/blueone` | ✅ | ⚠️ Intentional changes (see §Changes) | Expected diff |
| `/contact` | ✅ onSubmit wired | ✅ onSubmit wired | Identical |
| `/booking` | ✅ 8 fields | ✅ 8 fields | Identical |
| `/reviews` | ✅ 3 reviews | ✅ 3 reviews | Identical |
| `/experiences` | ✅ 13 themes | ✅ 13 themes | Identical |
| `/destinations` | ✅ 6 ports | ✅ 6 ports | Identical |
| `/themes/1` | ✅ | ✅ | Identical |
| `/specifications` | ❌ 404 | ✅ New page | New feature |

---

## Performance (Home `/`)

| Metric | Production | Preview |
|--------|-----------|---------|
| TTFB | 141ms | 67ms |
| DOM Ready | 199ms | 130ms |
| Full Load | 515ms | 477ms |

Preview is faster — warm Vercel instance. No performance regressions.

---

## Issues to Note Before Merging

| # | Severity | Description |
|---|----------|-------------|
| 1 | 🟡 Minor | Cabin count change (4→5) should be verified against the actual vessel configuration to ensure accuracy |
| 2 | 🟢 Info | Branch name `add_prices` is misleading — no prices were added; consider renaming or clarifying in the PR description |
| 3 | 🟢 Info | `/specifications` page title renders as the generic site title ("BlueOne Luxury Yacht Charters | Sailing Adventures in Greece") instead of a page-specific title — SEO improvement opportunity |

---

## Recommendation

**✅ Safe to merge.** No regressions across all tested pages. The two intentional changes (cabin count correction and new specs page) are working correctly. Verify the cabin count (4→5) against the actual boat before deploying if this hasn't been confirmed already.
