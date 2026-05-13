# Component Reference

Shared UI components live in `app/components/`. All are imported by multiple pages and should not contain page-specific logic.

---

## Navigation

**File:** `app/components/Navigation.tsx`  
**Directive:** `'use client'`

Sticky top navigation bar with responsive mobile menu.

### Behaviour
- Renders the BlueOne logo (links to `/`)
- Desktop: horizontal link row
- Mobile: hamburger toggle revealing a dropdown menu
- Closes the mobile menu automatically on link click

### Nav links

| Label | Route | Bold |
|---|---|---|
| Experiences | `/experiences` | Yes |
| Destinations | `/destinations` | No |
| The Yacht | `/blueone` | Yes |
| About | `/about` | No |
| Reviews | `/reviews` | No |
| Contact | `/contact` | No |

---

## Footer

**File:** `app/components/Footer.tsx`  
**Directive:** `'use client'`

Site-wide footer with three columns: brand summary, quick links, and contact details.

### Details
- Imports `CONTACT` from `app/config/contact.ts` for phone and email — never hardcoded
- Quick links mirror the main nav plus `/booking` (Get a Quote)
- Copyright line and Privacy/Terms links at the bottom

---

## ReviewCard

**File:** `app/components/ReviewCard.tsx`  
**Directive:** Server component (no `'use client'`)

Displays a single customer review in a glassmorphism card.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `review` | `Review` | — | Review object from `lib/reviews.ts` |
| `compact` | `boolean` | `false` | Clamps description to 4 lines; hides photos |

### Behaviour
- Shows reviewer name, confirmation date, star rating, title, and description
- In non-compact mode, renders up to N photo thumbnails (20×20 rounded)
- Date is derived from `review.confirmedAt` Firestore timestamp

---

## StarRating

**File:** `app/components/StarRating.tsx`  
**Directive:** `'use client'`

Interactive or read-only 5-star rating widget.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | — | Current rating (1–5) |
| `onChange` | `(value: number) => void` | — | Called when a star is clicked (omit for read-only) |
| `readonly` | `boolean` | `false` | Disables click interaction |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls star dimensions |

### Sizes

| Size | Dimensions |
|---|---|
| `sm` | 16×16 px |
| `md` | 24×24 px |
| `lg` | 32×32 px |

---

## BlueOneGallerySlideshow

**File:** `app/components/BlueOneGallerySlideshow.tsx`

Full-screen image slideshow for the yacht gallery page (`/blueone/gallery`).

### Behaviour
- Cycles through yacht images with auto-play
- Supports manual prev/next navigation and dot indicators
- Images sourced from `public/images/boats/blueone/`

---

## StructuredData

**File:** `app/components/StructuredData.tsx`

Renders JSON-LD `<script>` tags for SEO. Used in `app/layout.tsx`.

### Exported components

| Component | Schema type | Usage |
|---|---|---|
| `LocalBusinessStructuredData` | `LocalBusiness` / `TouristInformationCenter` | Root layout |
| `TouristTripStructuredData` | `TouristTrip` | Adventure theme pages |
| `ProductStructuredData` | `Product` | Rates / pricing page |

No props — all data is hardcoded from the static business information and `CONTACT` config.

---

## AvailabilityCalendar

**File:** `app/components/AvailabilityCalendar.tsx`  
**Directive:** `'use client'`

Renders a monthly calendar grid showing yacht availability. Used by both the public `/availability` page and the admin `/admin/availability` page.

### Props

| Prop | Type | Description |
|---|---|---|
| `entries` | `AvailabilityEntry[]` | Availability entries from Firestore |
| `mode` | `'user' \| 'admin'` | Controls colour scheme and click behaviour |
| `month` | `Date` | Currently displayed month (controlled) |
| `onMonthChange` | `(d: Date) => void` | Called when prev/next month is clicked |
| `onDayClick` | `(dateStr: string) => void` | Admin only — called with `'YYYY-MM-DD'` when a non-past day is clicked |

### Colour scheme

**User mode:**

| State | Colour |
|---|---|
| Available (no entry) | Emerald green |
| Not available (any entry) | Red |
| Past date | Muted / transparent |

**Admin mode:**

| Status | Colour |
|---|---|
| Free | White / transparent |
| `requested` | Amber |
| `blocked` | Red |
| `booked` | Emerald green |
| Past date | Muted / transparent |

When a day is covered by multiple entries, the highest-priority status wins: `booked > blocked > requested`.

### Interaction (admin mode)
- Click a free future day → `onDayClick` fires with that date string
- Click an occupied day → `onDayClick` fires; parent can identify the overlapping entry and open an edit modal
- Past days are not clickable

---

## Contexts

### BlueOneContext

**File:** `app/contexts/BlueOneContext.tsx`  
**Provider:** `BlueOneProvider` (wraps the entire app in `app/layout.tsx`)

Provides `isBlueOneMode: boolean` derived from the current pathname.

```ts
const { isBlueOneMode } = useBlueOneMode();
```

`isBlueOneMode` is `true` for any route starting with `/blueone`. Use it to conditionally apply the dark blue brand theme.

`setIsBlueOneMode` and `resetTheme` are **no-ops** kept for API compatibility — do not add logic to them.

---

## Library Modules

### `lib/firebase.ts`

Initialises the Firebase app and exports:
- `db` — Firestore database instance
- `storage` — Firebase Storage instance

Import these rather than calling `initializeApp` yourself.

---

### `lib/reviews.ts`

Firestore CRUD for the `reviews` collection.

| Export | Signature | Description |
|---|---|---|
| `Review` | interface | Full review shape |
| `createReview` | `(data) => Promise<string>` | Creates a pending review, returns doc ID |
| `getConfirmedReviews` | `() => Promise<Review[]>` | Returns confirmed reviews sorted by `order` then `confirmedAt` |
| `getAllReviews` | `() => Promise<Review[]>` | Returns all reviews (admin use) |
| `getReviewByToken` | `(token) => Promise<Review \| null>` | Looks up a review by invite token |
| `confirmReview` | `(id) => Promise<void>` | Sets `status: 'confirmed'` |
| `updateReview` | `(id, data) => Promise<void>` | Updates fields and resets to `pending` |
| `deleteReview` | `(id) => Promise<void>` | Deletes a review |
| `updateReviewOrder` | `(id, order) => Promise<void>` | Updates display order without changing status |
| `adminDeleteReview` | `(id) => Promise<void>` | Alias for `deleteReview` (admin context) |

---

### `lib/submissions.ts`

Firestore CRUD for the `bookings` and `contacts` collections.

| Export | Signature | Description |
|---|---|---|
| `BookingSubmission` | interface | Booking document shape |
| `ContactSubmission` | interface | Contact document shape |
| `saveBookingSubmission` | `(data) => Promise<void>` | Writes a new booking |
| `saveContactSubmission` | `(data) => Promise<void>` | Writes a new contact message |
| `getAllBookings` | `() => Promise<BookingSubmission[]>` | Returns all bookings, newest first |
| `getAllContacts` | `() => Promise<ContactSubmission[]>` | Returns all contacts, newest first |
| `deleteBooking` | `(id) => Promise<void>` | Deletes a booking |
| `deleteContact` | `(id) => Promise<void>` | Deletes a contact record |

---

### `lib/emailjs.ts`

Sends transactional emails via EmailJS.

| Export | Description |
|---|---|
| `sendBookingEmail(data)` | Sends booking confirmation to both the business (`NEXT_PUBLIC_EMAILJS_BUSINESS_TEMPLATE_ID`) and the client (`NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID`) |
| `sendContactEmail(data)` | Sends a contact form notification to the business |

Both functions return `Promise<EmailResponse>` and throw on failure.

---

### `lib/analytics.ts`

```ts
trackEvent(eventName: string, params?: Record<string, string | number | boolean>): void
```

Thin wrapper around `window.gtag`. Safe to call server-side (no-ops if `gtag` is not available). Common events: `booking_submitted`, `contact_submitted`.
