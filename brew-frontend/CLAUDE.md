# brew-frontend

React + Vite + Tailwind frontend for BrewPalate. Consumer-facing beer discovery app and brewer-facing management dashboard.

## Run Locally

```bash
npm install
npm run dev
```

Requires `.env` with: `VITE_BACKEND_URL` (Spring Boot), `VITE_RECOMMENDATION_BASE_URL` (FastAPI recommender), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Tech Stack

- React 18, Vite, TailwindCSS
- Supabase JS client for auth (email/password + anonymous guest login)
- Axios for API calls
- React Router v6
- D3.js for analytics charts
- Heroicons for icons
- Deployed on Vercel

## Route Structure

**Public:** `/login`, `/register`, `/about`

**User routes:**
- `/user/dashboard/:userId` — Main dashboard (recommendations, taste filters, beer proximity, past reviews)
- `/user/profile/:userId` — Profile settings
- `/user/find-breweries` — Brewery discovery with PostGIS proximity
- `/user/friends/:userId` — Friend suggestions
- `/brewery/:breweryId` — Public brewery page

**Brewer routes** (wrapped in `BrewerProvider`):
- `/brewer/dashboard/:brewerId` — Beer catalog management
- `/brewer/analytics/:brewerId` — Review analytics with D3 charts
- `/brewer/profile/:brewerId` — Brewer profile settings

## Key Components

```
src/
├── pages/               Route-level page components
├── components/
│   ├── user/            User-facing components
│   │   ├── landing/     Dashboard panels (RecCards, TastePanel, StylePanel, BeerProximity)
│   │   ├── ReviewModal  5-dimension review form with flavor tags
│   │   ├── PastReviews  Paginated review history
│   │   └── Friends      Friend list + suggestions
│   └── brewer/          Brewer-facing components
│       ├── BeerCatalog  CRUD table for brewery's beers
│       ├── BreweryCard  Brewery info display/edit
│       ├── BeerModal    Add new beer form
│       └── AnalyticsWidget  D3 charts (ratings, flavor tags)
├── context/
│   ├── BreweryContext   Global brewery data cache (shared across user pages)
│   └── BrewerContext    Brewer auth state (scoped to /brewer/* routes)
└── supabaseClient.js    Supabase client instance
```

## Auth Flow

- **Registered users:** Email/password via Supabase → JWT stored in Supabase session → sent as `Authorization: Bearer` header
- **Guest users:** `supabase.auth.signInAnonymously()` → same JWT flow but with `X-BP-Guest: 1` header → gets `guest-{uuid}` username → restricted permissions (can browse + get recommendations, cannot review or edit profile)
- **Session management:** `SignedOutModal` component listens for auth state changes and session expiry globally

## Guest Restrictions

Guest state tracked via `localStorage.setItem('is_guest', 'true')` and `isGuest` state in UserDashboard. Guests can:
- Browse beers, breweries, recommendations
- Use taste/style filters and proximity search

Guests cannot:
- Submit reviews
- Update profile
- (More restrictions enforced server-side)

## Design System

- Primary brown: `#8C6F52`
- Primary blue: `#3C547A`
- Text dark: `#3F4C5F`
- Text muted: `#6E7F99`
- Borders/accents: `#E0D4C2`
- Background: white (`#FFFFFF`) with `#f2f2f2` card backgrounds
- Positive tags: green palette, Negative tags: red palette
- Rounded buttons with `rounded-full`, cards with minimal borders

## Architecture Context

- Calls brew-backend (`VITE_BACKEND_URL`) for all CRUD, auth, and analytics
- Calls brew-recommender (`VITE_RECOMMENDATION_BASE_URL`) directly for `/live-recs/{userId}`
- Supabase client handles auth state; JWTs are passed to both services

## Active Refactor

Adding pairwise comparison UI for the new recommendation engine:

- `ComparisonCard` component — two beers side by side, tap to pick a winner
- `OnboardingFlow` — wraps ComparisonCard in a progress stepper for cold-start survey (8-10 rounds of macro beer brand comparisons)
- Integration into guest flow: after `signInAnonymously()`, route to onboarding before dashboard
- Post-review comparison prompt (dismissable card after review submission)
- New API calls to `POST /api/comparisons` and `GET /api/user/onboarding-status`

## Conventions

- Functional components with hooks only (no class components)
- Axios for all HTTP, never fetch
- Supabase auth via `supabaseClient.js` singleton
- Tailwind utility classes inline, no separate CSS files except `index.css`
- UUIDs passed as route params (`:userId`, `:brewerId`, `:breweryId`)
- Loading states use `LoadingScreen` component
- Modals follow the pattern in `ReviewModal.jsx` (overlay + centered card + close button)
