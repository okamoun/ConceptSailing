# ConceptSailing — BlueOne Luxury Yacht Charters

A full-featured booking and marketing platform for **BlueOne**, a Fountaine Pajot Aura 51 luxury catamaran operating sailing experiences in the Greek islands.

---

## Features

- **Marketing pages** — yacht specs, destinations map, chef profiles, adventure themes
- **Booking flow** — multi-step quote/booking form with email confirmation and Firestore persistence
- **Customer reviews** — token-based review submission with photo uploads and admin moderation
- **Admin dashboard** — manage bookings, contacts, and reviews with password protection
- **AI-generated imagery** — OpenAI DALL-E generates and caches adventure images on demand
- **SEO** — JSON-LD structured data, Next.js Metadata API, auto-generated sitemap and robots.txt
- **BlueOne brand theme** — dark blue accent theme activates automatically on `/blueone/*` routes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.3.8 (App Router) |
| UI | React 19, TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | Framer Motion 12 |
| Database | Firebase Firestore |
| File storage | Firebase Storage |
| Email | EmailJS (`@emailjs/browser`) |
| AI images | OpenAI API v4 (DALL-E) |
| Maps | `@react-google-maps/api` |
| Testing | Jest 30 + React Testing Library 16 |
| Linting | ESLint 9 (next/core-web-vitals + next/typescript) |

---

## Prerequisites

- Node.js 18+
- npm
- A Firebase project (Firestore + Storage enabled)
- An EmailJS account with two templates configured
- An OpenAI API key (for adventure image generation)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/okamoun/ConceptSailing.git
cd ConceptSailing
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root (it is gitignored):

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

# OpenAI — server-side only, no NEXT_PUBLIC_ prefix
OPENAI_API_KEY=

# Admin dashboard password
NEXT_PUBLIC_ADMIN_SECRET=

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Commands

```bash
npm run dev           # Start dev server on http://localhost:3000
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint check
npm test              # Run Jest test suite
npm run test:watch    # Jest in watch mode
npm run test:coverage # Jest with coverage report
```

---

## Project Structure

```
ConceptSailing/
├── app/                        # Next.js App Router root
│   ├── layout.tsx              # Root layout — BlueOneProvider, analytics, fonts
│   ├── page.tsx                # Home page (server → HomeClient.tsx)
│   ├── globals.css             # Global styles + CSS design tokens
│   ├── animations.css          # Keyframe animation definitions
│   ├── components/             # Shared UI components
│   ├── contexts/
│   │   └── BlueOneContext.tsx  # URL-driven theme context
│   ├── config/
│   │   └── contact.ts          # Centralised CONTACT object
│   ├── api/                    # Next.js API routes (server-side)
│   ├── about/
│   ├── experiences/
│   ├── rates/
│   ├── contact/
│   ├── reviews/                # Public reviews + /manage token flow
│   ├── booking/                # Quote/booking form
│   ├── booking-confirmation/
│   ├── destinations/           # Google Maps integration
│   ├── specifications/
│   ├── blueone/                # Yacht brand section (gallery, booking, contact)
│   ├── admin/                  # Password-protected admin dashboard
│   ├── chef/[slug]/            # Dynamic chef profile pages
│   ├── themes/[id]/            # Dynamic adventure theme pages
│   ├── adventures-data.ts      # Static adventure definitions + itineraries
│   ├── boats-data.ts           # Static boat specifications
│   └── destinations-data.ts    # Static destination data with coordinates
├── lib/                        # Shared business logic
│   ├── firebase.ts             # Firebase SDK init
│   ├── emailjs.ts              # sendBookingEmail(), sendContactEmail()
│   ├── reviews.ts              # Firestore CRUD for reviews
│   ├── submissions.ts          # Firestore CRUD for bookings + contacts
│   └── analytics.ts            # gtag event helpers
├── __tests__/                  # Jest test suites
├── scripts/                    # Image generation + Unsplash download utilities
└── public/                     # Static assets — images, logos, favicons
```

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Home — hero, featured reviews, CTAs |
| `/experiences` | Adventure catalogue |
| `/themes/[id]` | Individual adventure theme page |
| `/destinations` | Interactive Google Map of sailing destinations |
| `/blueone` | BlueOne yacht overview |
| `/blueone/gallery` | Yacht photo gallery slideshow |
| `/blueone/booking` | BlueOne-branded booking form |
| `/blueone/contact` | BlueOne-branded contact form |
| `/booking` | Main quote/booking form |
| `/booking-confirmation` | Post-booking confirmation page |
| `/rates` | Pricing information |
| `/about` | About the company and crew |
| `/chef/[slug]` | Individual chef profile |
| `/specifications` | Full yacht technical specifications |
| `/contact` | General contact form |
| `/reviews` | Public confirmed reviews |
| `/reviews/manage` | Token-based review submission/edit |
| `/admin` | Admin dashboard (password protected) |
| `/admin/reviews` | Admin review moderation |

---

## Key Data Flows

### Booking
1. User fills the form at `/booking`
2. `saveBookingSubmission()` writes to Firestore `bookings` collection
3. `sendBookingEmail()` sends EmailJS templates to both business and client
4. User is redirected to `/booking-confirmation`

### Reviews
1. Admin creates a review invite link with a unique token
2. Customer submits a review at `/reviews/manage?token=<token>`
3. `createReview()` saves to Firestore with `status: 'pending'`
4. Admin confirms at `/admin/reviews` → `confirmReview()` sets `status: 'confirmed'`
5. `/reviews` page renders only confirmed reviews via `getConfirmedReviews()`

---

## Architecture Notes

### Server vs Client Components
`page.tsx` files are **server components**. Interactive logic lives in co-located `*Client.tsx` files marked with `'use client'`.

### Theme System
`BlueOneContext` reads `usePathname()` and sets `isBlueOneMode = true` for any route under `/blueone`. Components use this flag to switch to the dark blue brand palette.

### Static vs Dynamic Data
- **Static content** (adventures, boats, destinations) → edit `app/*-data.ts` files
- **User content** (bookings, contacts, reviews) → stored in Firestore via `lib/submissions.ts` and `lib/reviews.ts`

### Contact Info
Always import from `app/config/contact.ts` (`CONTACT`). Never hardcode email addresses or phone numbers.

---

## Firebase Collections

| Collection | Managed by | Key fields |
|---|---|---|
| `reviews` | `lib/reviews.ts` | `status`, `token`, `rating`, `photos`, `order` |
| `bookings` | `lib/submissions.ts` | `name`, `email`, `boat`, `date`, `passengers`, `embarkationPoint` |
| `contacts` | `lib/submissions.ts` | `name`, `email`, `message` |

---

## Testing

Tests live in `__tests__/` and use Jest + React Testing Library.

```bash
npm test                  # Run all tests
npm run test:coverage     # With coverage report
```

External dependencies (Firebase, EmailJS, `next/navigation`, `next/image`) are mocked in `jest.setup.js`. Do not make real network requests in tests.

---

## Image Handling

- Static images are in `public/images/`
- OpenAI-generated adventure images are cached to `public/adventures/OpenAI/`
- `app/getAdventureImageUrl.ts` resolves the correct image URL per adventure (checks local files before calling OpenAI)
- Always use Next.js `<Image>` from `next/image` — never raw `<img>` tags (except in test mocks)
- Remote Unsplash images are allowed via `next.config.mjs` `remotePatterns`

---

## Utility Scripts

Located in `scripts/`:

| Script | Purpose |
|---|---|
| `download_unsplash_images.js` | Batch-download Unsplash images to `public/` |
| `generate-adventure-images.py` | Generate adventure images via OpenAI |
| `generate-adventure-images.sh` | Shell wrapper for the Python script |
| `update-experience-images.js` | Refresh experience image references |

There is also an admin-only API route at `/api/generate-missing-experience-images` that generates any missing adventure images in bulk (supports `?id=`, `?prompt=`, and `?force=1` query params).

---

## Deployment

The recommended platform is [Vercel](https://vercel.com). Set all `.env.local` variables as environment variables in the Vercel project dashboard before deploying.

```bash
npm run build   # Verify the build passes locally before deploying
```
