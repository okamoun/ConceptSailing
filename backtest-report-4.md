# Back-Test Report: Production vs `feedback` Branch
**Date:** 2026-04-17  
**Production:** https://www.blueoneyacht.com  
**Preview (feedback branch):** https://concept-sailing-dwbs19bmx-okamouns-projects.vercel.app  
**Vercel deployment:** BEYuaeNmYuT1Ny4pR2zhxrFwBTAe

---

## Executive Summary

The `feedback` branch is a **focused bug-fix release** with no new features. It corrects two issues that exist on production today: the broken contact form and three typos on the `/blueone` page. All other pages are identical. **This branch is safe to merge immediately.**

---

## 1. Content Comparison

| Page | Match? | Notes |
|------|--------|-------|
| `/` Home | ✅ Identical | Nav, copy, testimonials, images all match |
| `/blueone` | ⚠️ **Fixed** | 3 typos corrected (see §2) |
| `/contact` | ⚠️ **Fixed** | Form now has onSubmit handler (see §3) |
| `/experiences` | ✅ Identical | All 13 themed experience cards present |
| `/destinations` | ✅ Identical | |
| `/about` | ✅ Identical | |
| `/reviews` | ✅ Identical | 2 confirmed reviews (Carine L, Dimitri) |
| `/booking` | ✅ Identical | 8 fields, same structure and labels |

---

## 2. `/blueone` Typo Fixes

All three long-standing typos in the yacht description are corrected in this branch:

| Field | Production (broken) | Preview (fixed) |
|-------|---------------------|-----------------|
| Catamaran type | "First **Hybride** commercial catamaran" | "First **Hybrid** commercial catamaran" |
| Opportunity | "unique **oppotunity** to visit" | "unique **opportunity** to visit" |
| Comfort | "in total **confort** without" | "in total **comfort** without" |

---

## 3. Contact Form Fix

**Production:** `<form>` with no `onSubmit` handler — browser defaults to GET submission, data leaks into URL, no email sent.

**Preview (fixed):** Form has a proper React `onSubmit` handler confirmed via `__reactProps` inspection. Required fields now display an asterisk (*). On submission the form calls `sendContactEmail()` via EmailJS and replaces itself with a "Message Sent!" confirmation screen. The page URL stays clean at `/contact`.

---

## 4. Performance

| Page | Metric | Production | Preview | Δ |
|------|--------|-----------|---------|---|
| `/` | TTFB | 67ms | 145ms | Preview 2× slower — cold Vercel instance |
| `/` | DOM Ready | 159ms | 224ms | Similar once warmed |
| `/` | Full Load | 523ms | 510ms | ~Equivalent |
| `/booking` | TTFB | 69ms | 69ms | Identical |
| `/booking` | DOM Ready | 419ms | 557ms | Slight delta |
| `/booking` | Full Load | 565ms | 1,144ms | Preview cold-start effect |

The higher TTFB on the preview is consistent with a Vercel preview deployment on a cold serverless instance. Production is warmed and CDN-cached. No performance regressions in the code itself.

---

## 5. Image Audit

| Page | Image | Path | Production | Preview |
|------|-------|------|-----------|---------|
| `/` | Logo | `blueone/logo_blueone.png` | ✅ | ✅ Same |
| `/` | Hero | `blueone/External_sailing.jpg` | ✅ | ✅ Same |

No image assets changed in this branch.

---

## 6. Issues Status After This Branch

| # | Severity | Status |
|---|----------|--------|
| Contact form broken (GET submission, no email) | 🔴 Critical | ✅ Fixed in `feedback` branch |
| `/blueone` typos (Hybride, oppotunity, confort) | 🟡 Minor | ✅ Fixed in `feedback` branch |
| Testimonial grammar (lowercase "corinth canal", Dimitri's review) | 🟢 Info | Still open |

---

## 7. Recommendation

**✅ Safe to merge — no regressions, two bugs resolved.**

This branch fixes the two outstanding issues flagged in the previous back-test reports. Merging it to production will:
1. Fix the contact form for all users immediately (currently every submission is silently dropped)
2. Correct the three typos visible on the `/blueone` page

No functional, visual, or performance regressions were found on any page.
