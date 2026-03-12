# CinemaScope

CinemaScope is a Zurich-first cinema discovery platform focused on one practical decision:

**Which movie, in which cinema, at what time fits me best?**

It combines cinema venues, movie intelligence, app-owned showtimes, personal ratings, watchlists, favourites, and explainable recommendations in one premium web application.

## Problem Statement

Cinema users usually split their workflow across disconnected apps: venue websites, movie databases, and personal notes. CinemaScope unifies these flows and personalises recommendations based on actual user behavior, not generic popularity.

## Why Zurich-First MVP

Zurich gives a dense, realistic cinema market with diverse venue types (arthouse + mainstream) and strong language/showtime variability. Starting with one region keeps the MVP reliable while preserving expansion paths for all Switzerland.

## Data Sources

- **Google Places API**: Zurich cinema discovery + details.
- **TMDb API**: movie metadata (title, overview, genres, runtime, release date, posters).
- **Internal showtime database**: app-owned MVP showtimes (manual/admin + dev seed).

No external live showtime API is used for MVP.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Postgres (Vercel/Neon compatible)
- Zod runtime validation
- Own authentication system (bcrypt password hashing + DB-backed sessions + HttpOnly cookie)
- Vitest + React Testing Library

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env.local
```

3. Generate and apply database migrations

```bash
npm run db:generate
npm run db:migrate
```

4. Seed development data (optional but recommended)

```bash
npm run db:seed
```

5. Start the app

```bash
npm run dev
```

## Environment Variables

- `DATABASE_URL`: Postgres connection string.
- `GOOGLE_PLACES_API_KEY`: enables Google cinema sync.
- `TMDB_API_KEY`: enables TMDb sync/discovery.
- `INTERNAL_SYNC_SECRET`: header guard for internal sync endpoints (`x-internal-sync-secret`).

## Architecture Overview

```
src/
  app/          # Next routes, layouts, API handlers
  components/   # UI and interactive client components
  domain/       # Types, schemas, pure business logic
  features/     # Product orchestration per area
  services/     # Side-effect boundaries (DB, auth, external APIs)
  lib/          # App constants, env handling, utilities, seed data
  tests/        # Unit/component tests
```

### Side-Effect Boundary Map

- `services/db/*`: persistence I/O.
- `services/external/*`: Google Places/TMDb HTTP I/O.
- `services/auth/*` + `services/session/*`: hashing, cookies, session persistence.
- `app/api/*`: request/response boundaries.

Everything under `domain/logic` is pure and side-effect free.

## Functional Programming (M323 Alignment)

### Pure Functions

Core business logic lives in `src/domain/logic/*`:

- cinema/movie/showtime filtering and sorting
- rating aggregation
- taste profile derivation
- recommendation scoring + reason generation
- dashboard stats derivation

### Immutability

Collections are updated immutably in `domain/logic/collections.ts` (`toggleId`, `upsertRating`, etc.) and recommendation/filter pipelines avoid mutation.

### Higher-Order Functions

Used extensively with `map`, `filter`, `reduce`, and custom HOF closures:

- `createCityFilter`
- `createGenreFilter`
- `createDateRangeFilter`
- `createTimeWindowFilter`
- `createRecommendationScorer`
- `createRatingSorter`

### Function Composition

Feature flows follow composed pipelines such as:

`load -> validate -> normalize -> filter -> score -> rank -> explain`

### Closures

Configurable predicates/scorers are closure-based and reused across pages/APIs.

### Type Safety

- TypeScript domain models in `domain/types.ts`
- Zod validation in `domain/schemas.ts`
- Typed repository/service contracts

## Core Product Flows

- Browse cinemas, movies, and showtimes for Zurich.
- Register/login/logout with secure own-auth.
- Manage watchlist, seen movies, ratings, notes, favourite cinemas, preferences.
- Receive private personalised recommendations with reasons.
- Admin-only internal showtime CRUD for MVP operations.

## Testing Strategy

Primary focus is pure domain logic reliability:

- cinema filtering
- movie filtering
- showtime filtering/sorting
- recommendation ranking/reasons
- taste profile derivation
- immutable collection operations
- rating aggregation
- Zod schema validation

Boundary tests also cover auth primitives (password/session token handling) and a representative UI form test.

Run tests:

```bash
npm run test
```

## Validation Commands

```bash
npm run lint
npm run test
npm run build
```

## Known Limitations (MVP)

- Recommendation quality depends on early user rating density.
- External sync cadence is manual/triggered, not scheduled by default.
- Admin tools are intentionally minimal and focused on showtime ownership.
- Fallback mode uses curated dev catalog when API keys are absent.

## Future Expansion

- Extend region model from Zurich (`ZH`) to all Swiss cantons.
- Add production scheduler for periodic Google/TMDb refresh.
- Integrate live showtime feeds once data quality/reliability is acceptable.
- Add richer map intelligence (distance/time-to-cinema).
- Expand recommendation features with collaborative signals.

