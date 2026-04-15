# Back-Test Report: BlueOne Yacht Website
**Date:** 2026-04-15  
**Production:** https://www.blueoneyacht.com  
**Preview branch:** https://concept-sailing-1bmxu18so-okamouns-projects.vercel.app

---

## Executive Summary

This preview introduces **three meaningful new features** — electric catamaran branding on the home hero, a new Testimonials section, and an entirely new `/reviews` page with a "Reviews" nav item. All other pages (`/experiences`, `/destinations`, `/about`, `/contact`, all tested `/themes/` pages) are content-identical to production.

One **critical pre-existing bug** was confirmed on the `/blueone` page: a garbled Hebrew character string (`לֹשרנםמ םר`) and three typos in the yacht description paragraph. This bug exists in **both** production and preview — it is not introduced by this branch and is not resolved by it either. **This should be fixed before or alongside any merge.**

Performance is broadly equivalent between the two versions.

---

## Pages Tested

| Page | Production | Preview | Diff? |
|------|-----------|---------|-------|
| `/` (Home) | ✅ | ✅ | ⚠️ Content changes |
| `/experiences` | ✅ | ✅ | ✅ Identical |
| `/destinations` | ✅ | ✅ | ✅ Identical |
| `/blueone` | ✅ | ✅ | 🔴 Bug on both |
| `/about` | ✅ | ✅ | ✅ Identical |
| `/contact` | ✅ | ✅ | ✅ Identical |
| `/themes/2` (Family Sailing School) | ✅ | ✅ | ✅ Identical |
| `/themes/9` (Sephardic Heritage) | ✅ | ✅ | ✅ Identical |
| `/reviews` | ❌ Does not exist | ✅ New page | 🆕 New |

---

## 1. Navigation

**Production:** Experiences · Destinations · The Yacht · About · Contact *(5 items)*

**Preview:** Experiences · Destinations · The Yacht · About · **Reviews** · Contact *(6 items)*

A new **Reviews** nav item has been added between About and Contact, linking to the new `/reviews` page.

---

## 2. Content Changes

### Home Page (`/`)

**Hero description — updated copy:**

| Version | Text |
|---------|------|
| Production | "…sailing experiences aboard the **BlueOne catamaran**. …premium comfort and service." |
| Preview | "…sailing experiences aboard the **BlueOne electric catamaran**. …premium comfort and service **and silence of electric engines**." |

Two additions: "electric" qualifier on the catamaran name, and a new phrase emphasizing the electric engines.

**New Testimonials section (preview only):**

The preview home page includes a new "What Our Guests Say" section with two review cards, absent from production entirely:

- **Carine L** (Apr 2026) — *"Unforgettable crossing of the corinth canal"* — describes a week-long trip from Corfu to Athens via the Corinth Canal.
- **Dimitri** (Apr 2026) — *"A Michelin star experience with sails"* — describes the onboard dining experience.

A "See All Reviews" CTA links to the new `/reviews` page.

### New `/reviews` Page (preview only)

A dedicated guest reviews page accessible at `/reviews`. It displays individual review cards (author, date, star rating, title, body) and includes a "Share Your Experience" button. This page does not exist at all on production — navigating to `/reviews` on production would result in a 404.

### `/blueone` Page — Pre-existing Bug (both versions)

The yacht description paragraph contains the same errors on **both** production and preview:

> "BlueOne is the First **Hybride** commercial catamaran operating in the Greek water, it provides you a unique **oppotunity** to visit the most protected sites in total **confort** without **לֹשרנםמ םר** noise pollution."

Issues: misspelling of "Hybride" (should be "Hybrid"), "oppotunity" (opportunity), "confort" (comfort), and a garbled Hebrew character string that replaces what should likely be "any" or similar text. **This bug is not introduced by this branch but must be corrected independently.**

### Other Pages

`/experiences`, `/destinations`, `/about`, `/contact` — all content **word-for-word identical** to production.

---

## 3. Image Audit

| Page | Image | Folder | Production | Preview |
|------|-------|--------|-----------|---------|
| `/` | `External_sailing.jpg` | `blueone/` | ✅ | ✅ Same |
| `/themes/2` | `family_sailing_school.png` | `OpenAI/` | ✅ | ✅ Same |
| `/themes/9` | `sephardic_heritage_sailing.png` | `OpenAI/` | ✅ | ✅ Same |

All image filenames and folder paths are identical across both versions. No image assets have been added, removed, or renamed in this preview.

---

## 4. Performance Comparison

Measured using the Navigation Timing API (warm connections).

### Home Page (`/`)

| Metric | Production | Preview | Δ |
|--------|-----------|---------|---|
| TTFB | 65ms | 68ms | ~Equivalent |
| DOM Content Loaded | 152ms | 135ms | Preview 11% faster |
| Full Page Load | 530ms | 693ms | Production 23% faster |

### Theme Page (`/themes/2`)

| Metric | Production | Preview | Δ |
|--------|-----------|---------|---|
| TTFB | 63ms | 67ms | ~Equivalent |
| DOM Content Loaded | 375ms | 391ms | ~Equivalent |
| Full Page Load | 1,129ms | 1,178ms | ~Equivalent |

### `/blueone` (Preview only)

| Metric | Preview |
|--------|---------|
| TTFB | 152ms |
| DOM Content Loaded | 660ms |
| Full Page Load | 7,101ms |

**Key takeaway:** Performance is equivalent between the two versions across all tested pages. The high load time on `/blueone` is consistent with its large image gallery (41 images including AVIF files). No performance regressions detected.

---

## 5. Functional Testing

| Check | Production | Preview |
|-------|-----------|---------|
| Top nav — logo link | ✅ | ✅ |
| Top nav — Experiences | ✅ | ✅ |
| Top nav — Destinations | ✅ | ✅ |
| Top nav — The Yacht | ✅ | ✅ |
| Top nav — About | ✅ | ✅ |
| Top nav — Reviews | ❌ Not present | ✅ Present |
| Top nav — Contact | ✅ | ✅ |
| `/reviews` page loads | ❌ 404 expected | ✅ Loads correctly |
| Home "See All Reviews" CTA | ❌ Not present | ✅ Present |
| Home "Explore Experiences" CTA | ✅ | ✅ |
| Home "Discover The Yacht" CTA | ✅ | ✅ |

---

## 6. Issues & Observations

| # | Severity | Area | Description |
|---|----------|------|-------------|
| 1 | 🔴 **Critical** | Content | `/blueone` description contains garbled Hebrew characters `לֹשרנםמ םר` and three typos ("Hybride", "oppotunity", "confort") — present on **both** production and preview, must be fixed separately |
| 2 | 🟡 Info | Reviews | The two review cards on the home page and `/reviews` page contain minor grammar/capitalisation issues (e.g. "corinth canal" not capitalised, "The diners prepare by Andreas were a amazing experience") — worth correcting before going live |
| 3 | 🟢 Minor | Performance | `/blueone` preview full-page load is 7.1s — consistent with 41-image gallery; not a regression but `priority` prop on first visible image could improve perceived load |

---

## 7. Recommendation

**⚠️ Conditionally safe to merge — with one required fix.**

The preview branch is structurally sound and introduces well-scoped new features (Reviews section, new nav item, new page, updated electric branding). No regressions were detected in layout, navigation, content, images, or performance.

However, **the `/blueone` Hebrew characters bug should be fixed** before or in the same deployment — it exists in production today and is visible to all visitors. This is the right moment to correct it.

Secondary recommendation: proofread the two testimonial texts (capitalisation, grammar) before the review feature goes live, as they represent the brand's voice.

**Suggested merge checklist:**
- [ ] Fix `/blueone` description: remove `לֹשרנםמ םר`, correct "Hybride" → "Hybrid", "oppotunity" → "opportunity", "confort" → "comfort"
- [ ] Proofread the two testimonial texts (Carine L and Dimitri)
- [ ] Manual visual check of `/reviews` page at full resolution after deployment
- [ ] Confirm `/reviews` is excluded from any `noindex` rules if it should be publicly discoverable
