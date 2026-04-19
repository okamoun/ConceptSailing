# CLAUDE.md — ConceptSailing

## Project Overview

**Concept Sailing** (package name: `windsurf-cruises`) is a luxury yacht charter booking and marketing platform for sailing experiences in the Greek islands. The brand name is **BlueOne** (Fountaine Pajot Aura 51 catamaran). The site handles:

- Marketing pages (yacht specs, destinations, chef profiles, adventure themes)
- Booking flow with email notifications and Firestore persistence
- Customer review submission and admin moderation
- Admin dashboard for managing bookings, contacts, and reviews
- AI-generated adventure imagery via OpenAI

Business contact: `contact@nj3cruises.com` — always use `app/config/contact.ts` (`CONTACT`) for any contact info rather than hardcoding.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.3.8 (App Router) |
| UI | React 19, TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + CSS variables in `app/globals.css` |
| Animation | Framer Motion 12 |
| Database | Firebase Firestore |
| File storage | Firebase Storage |
| Email | EmailJS (`@emailjs/browser`) |
| AI images | OpenAI API v4 |
| Maps | `@react-google-maps/api` |
| Testing | Jest 30 + React Testing Library 16 |
| Linting | ESLint 9 (next/core-web-vitals + next/typescript) |

---

## Development Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm test             # Run Jest tests
npm run test:watch   # Jest in watch mode
npm run test:coverage # Jest with coverage report
```

---

## Environment Variables

All secrets are in `.env.local` (gitignored). **Never hardcode any of these.**

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# EmailJS
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_BUSINESS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID=

# OpenAI (server-side only — no NEXT_PUBLIC_ prefix)
OPENAI_API_KEY=

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

---

## Directory Structure

```
ConceptSailing/
├── app/                        # Next.js App Router root
│   ├── layout.tsx              # Root layout: BlueOneProvider, analytics, fonts
│   ├── page.tsx                # Home page (server wrapper → HomeClient.tsx)
│   ├── globals.css             # Global styles + CSS custom properties
│   ├── animations.css          # Keyframe animations
│   ├── components/             # Shared UI components
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── StarRating.tsx
│   │   ├── BlueOneGallerySlideshow.tsx
│   │   └── StructuredData.tsx  # JSON-LD for SEO
│   ├── contexts/
│   │   └── BlueOneContext.tsx  # Theme context (isBlueOneMode)
│   ├── config/
│   │   └── contact.ts          # Centralized CONTACT object — always import from here
│   ├── api/
│   │   └── adventure-image/route.ts  # OpenAI image generation endpoint
│   ├── (routes)/
│   │   ├── about/
│   │   ├── experiences/
│   │   ├── rates/
│   │   ├── contact/            # ContactClient.tsx for form interactivity
│   │   ├── reviews/            # ReviewsClient.tsx + /manage sub-route
│   │   ├── booking/            # booking-client.tsx, page-content.tsx, layout.tsx
│   │   ├── booking-confirmation/
│   │   ├── destinations/       # Google Maps integration
│   │   ├── specifications/
│   │   ├── blueone/            # BlueOne yacht brand section
│   │   │   ├── booking/
│   │   │   ├── contact/
│   │   │   └── gallery/
│   │   ├── admin/              # AdminDashboardClient.tsx
│   │   │   └── reviews/
│   │   ├── chef/[slug]/        # Dynamic chef profiles
│   │   └── themes/[id]/        # Dynamic adventure theme pages
│   ├── adventures-data.ts      # Static adventure definitions + itineraries
│   ├── boats-data.ts           # Static boat specifications
│   ├── destinations-data.ts    # Static destination data with coordinates
│   ├── HomeClient.tsx
│   ├── getAdventureImageUrl.ts
│   ├── feature-icons.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── lib/                        # Shared business logic
│   ├── firebase.ts             # Firebase SDK init (db, storage exports)
│   ├── emailjs.ts              # sendBookingEmail(), sendContactEmail()
│   ├── reviews.ts              # Firestore CRUD for reviews collection
│   ├── submissions.ts          # Firestore CRUD for bookings + contacts collections
│   └── analytics.ts           # gtag event helpers
├── __tests__/                  # Jest test suites
│   ├── blueone-theme.test.tsx
│   └── booking-form.test.tsx
├── scripts/                    # Utility scripts (image generation, Unsplash download)
├── public/                     # Static assets (images, logos, favicon, manifests)
├── next.config.mjs
├── tsconfig.json
├── jest.config.js
├── jest.setup.js
└── eslint.config.mjs
```

---

## Architecture Patterns

### Server vs Client Components

Next.js App Router defaults to Server Components. The pattern used here:

- `page.tsx` files are **server components** — they do server-side data fetching (or none) and render a client component wrapper.
- Interactive components are **client components** — they use the `'use client'` directive and are named with a `Client` suffix (e.g. `HomeClient.tsx`, `booking-client.tsx`, `AdminDashboardClient.tsx`).

```tsx
// page.tsx (server component) — minimal, just imports client wrapper
import BookingPageContent from './page-content';
export default function Page() { return <BookingPageContent />; }

// page-content.tsx (client component)
'use client';
export default function BookingPageContent() { /* form logic */ }
```

### Theme: BlueOneContext

`app/contexts/BlueOneContext.tsx` — provides `isBlueOneMode: boolean` derived from the current URL pathname. It's `true` for any route starting with `/blueone`. Pages use this to conditionally apply the dark blue brand theme.

```tsx
const { isBlueOneMode } = useBlueOneMode();
```

`setIsBlueOneMode` and `resetTheme` are no-ops kept for API compatibility — do not add logic to them.

### Static Data vs Firestore

- **Static content** (adventures, boats, destinations) lives in `app/*-data.ts` TypeScript files. Edit these files to change static content.
- **User-generated content** (bookings, contacts, reviews) is persisted in Firestore via `lib/submissions.ts` and `lib/reviews.ts`.

---

## Naming Conventions

| Pattern | Example |
|---|---|
| Client component files | `booking-client.tsx`, `HomeClient.tsx`, `AdminDashboardClient.tsx` |
| Data definition files | `adventures-data.ts`, `boats-data.ts` |
| API routes | `app/api/[feature]/route.ts` |
| Dynamic routes | `chef/[slug]/page.tsx`, `themes/[id]/page.tsx` |
| TypeScript path alias | `@/` maps to the repo root (e.g. `@/lib/firebase`) |

---

## Styling

- **Tailwind CSS v4** utility classes are the primary styling mechanism. No CSS modules.
- **CSS custom properties** defined in `app/globals.css` form the design system:
  - Brand colors: `--blueone-primary` (#0066cc), `--blueone-accent` (#00a8ff), `--blueone-ocean` (#003d7a)
  - Semantic tokens: `--background`, `--foreground`, `--surface`, `--border`, `--text-primary`, `--text-secondary`
  - Glass effect utilities: `--glass-bg`, `--glass-border`, `--glass-shadow`
- **Framer Motion** is used for page transitions and scroll animations.
- Animation keyframes are in `app/animations.css`.

---

## Firebase Collections

### `reviews`
Managed by `lib/reviews.ts`. Fields: `id`, `token`, `status` (`'pending' | 'confirmed'`), `name`, `email`, `title`, `description`, `rating`, `photos`, `createdAt`, `confirmedAt`, `order`.

### `bookings`
Managed by `lib/submissions.ts`. Fields: `id`, `type: 'booking'`, `name`, `email`, `phone`, `boat`, `date`, `passengers`, `embarkationPoint`, `holidayDescription?`, `selectedTheme?`, `createdAt`.

### `contacts`
Managed by `lib/submissions.ts`. Fields: `id`, `type: 'contact'`, `name`, `email`, `phone?`, `message`, `createdAt`.

---

## Key Data Flows

### Booking Submission
1. User fills `booking-client.tsx` form
2. On submit: `saveBookingSubmission()` (`lib/submissions.ts`) writes to Firestore `bookings`
3. `sendBookingEmail()` (`lib/emailjs.ts`) sends confirmation to both business and client via EmailJS
4. User is redirected to `/booking-confirmation`

### Review Flow
1. Admin invites customer → customer submits via `/reviews/manage?token=<token>`
2. `createReview()` writes to Firestore with `status: 'pending'`
3. Admin confirms at `/admin/reviews` → `confirmReview()` sets `status: 'confirmed'`
4. Public `/reviews` page shows only confirmed reviews via `getConfirmedReviews()`

---

## External Services

| Service | Purpose | Config |
|---|---|---|
| Firebase Firestore | Reviews, bookings, contacts persistence | `lib/firebase.ts` + env vars |
| EmailJS | Transactional emails for bookings and contact | `lib/emailjs.ts` + env vars |
| OpenAI API | Dynamic image generation for adventures | `app/api/adventure-image/route.ts` |
| Google Maps | Interactive destination map | `@react-google-maps/api` in destinations pages |
| Google Analytics | Page view + event tracking | `NEXT_PUBLIC_GA_ID` + `lib/analytics.ts` |
| Unsplash | Remote image source | Allowed in `next.config.mjs` remotePatterns |

---

## Testing

Tests live in `__tests__/` and use Jest + React Testing Library.

```bash
npm test                  # Run all tests
npm run test:coverage     # With coverage
```

**Mocked in `jest.setup.js`:**
- `next/navigation` — `useRouter`, `useSearchParams`, `usePathname`
- `next/image` — renders a plain `<img>`
- `localStorage`
- `window.location`

When writing tests, mock Firebase and EmailJS calls — do not make real network requests in tests.

---

## Image Handling

- Static yacht and destination images are in `public/images/`.
- Adventure images generated by OpenAI are cached to `public/adventures/OpenAI/`.
- The `app/getAdventureImageUrl.ts` helper resolves the correct image path for each adventure.
- Remote images from Unsplash are allowed via `next.config.mjs`.
- Always use the Next.js `<Image>` component from `next/image` (not `<img>`), except in test mocks.

---

## SEO

- `app/robots.ts` and `app/sitemap.ts` auto-generate crawl rules and sitemaps.
- `app/components/StructuredData.tsx` renders JSON-LD schema (`LocalBusiness`, `TouristTrip`) in the root layout.
- Page-level metadata uses the Next.js `Metadata` API (`export const metadata: Metadata = {...}` in `page.tsx`).
