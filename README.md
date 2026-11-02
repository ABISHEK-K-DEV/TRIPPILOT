# TripPilot

**AI-powered travel intelligence: plan smarter trips, understand the real cost of travelling, and decide with confidence.**

TripPilot plans day-by-day itineraries and prices the *whole* trip: transport, stays, hotel taxes, local transport, food, tickets, visas, insurance and booking fees. It compares comfort levels and alternative destinations, and it labels every number as **verified**, **estimate** or **sample**, so users never mistake an estimate for a quote.

> **Status: Milestone 1.** Everything runs on a clearly labelled sample dataset and a transparent, rule-based planner. No live prices, no bookings. See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the roadmap and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the design.

## What works today (Milestone 1)

| Area | Details |
| --- | --- |
| Landing page | Hero, one-click example trips, featured destinations, pricing-transparency explainer |
| Authentication | Register, sign in and sign out. bcrypt password hashes and an httpOnly JWT session cookie. Rate-limited. |
| Destination discovery | 23 destinations in 10 countries. Filters: collections, weekend getaways, region, month, weather, daily budget, trip length, accessibility. Sorting. Results are URL-addressable. |
| Search | Typeahead across destinations, countries and sights, with keyboard navigation |
| Destination pages | Climate chart, best and avoid months, sights, typical daily cost by tier, visa and accessibility notes |
| Trip planner | Origin, destination (or "suggest one"), dates, travellers, budget, comfort tier, pace, interests, insurance |
| Trip results | Day-by-day itinerary with realistic travel times and a feasibility check, a route sketch per day, and where-to-stay advice. Complete cost breakdown with ranges, sources and confidence labels. Budget meter and warnings. Budget/Comfort/Premium comparison (cheapest, best value, most convenient). Transport options. Cheaper alternative destinations. Share link. |
| Saved trips | Save (the server re-runs the plan), list, view snapshot, delete. Expenses and itinerary rows are persisted. |
| States | Loading skeletons, error states with retry, empty states, 404s |
| Responsive | Mobile-first layouts, no horizontal scroll at 390 px |

## Tech stack

- **Web:** React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7, TanStack Query 5
- **API:** Node.js 20+, Express 5, TypeScript, Prisma 6, PostgreSQL 16, zod 4
- **Shared:** `@trippilot/shared` holds the domain types, the cost engine, the transport model, scenario ranking, the itinerary feasibility checker and the validation schemas. Both apps use it.
- **Tests:** Vitest (shared engine, API with supertest, web components)

```
apps/
  api/        Express API, Prisma schema + migrations + seed, sample dataset
  web/        React app
packages/
  shared/     Domain logic used by both apps (with tests)
docs/         Architecture notes
```

## Run locally

**Prerequisites:** Node.js 20+ (22 recommended) and PostgreSQL 16. Redis is optional in Milestone 1.

1. Start Postgres and Redis. Docker is the easiest way; any local Postgres works too.

   ```bash
   docker compose up -d
   ```

2. Install dependencies. This also generates the Prisma client.

   ```bash
   npm install
   ```

3. Configure the API environment.

   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

4. Create the schema and load the sample data.

   ```bash
   npm run db:setup
   ```

5. Run the API (http://localhost:4000) and the web app (http://localhost:5173) together.

   ```bash
   npm run dev
   ```

Open **http://localhost:5173**. The seed creates a local demo account: `demo@trippilot.dev` / `TripPilot123` (not created when `NODE_ENV=production`).

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm test` | All tests: 43 shared, 219 API and 8 web |
| `npm run typecheck` | TypeScript across all workspaces |
| `npm run build` | Production builds (`apps/api/dist`, `apps/web/dist`) |
| `npm run db:seed` | Re-seed sample data (idempotent) |
| `npm run db:studio -w @trippilot/api` | Prisma Studio |

## Environment variables

### `apps/api/.env`

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | | `development` | `development`, `test` or `production` |
| `PORT` | | `4000` | API port |
| `CORS_ORIGINS` | | `http://localhost:5173` | Comma-separated browser origins allowed to call the API with credentials |
| `DATABASE_URL` | ✅ | | PostgreSQL connection string |
| `REDIS_URL` | | | Redis for caching and jobs (used from Milestone 3) |
| `JWT_SECRET` | ✅ | | At least 32 characters. The API refuses to start in production with the example value. |
| `JWT_EXPIRES_IN_DAYS` | | `7` | Session length |
| `AI_PROVIDER` | | `sample` | `sample` (rule-based) or `gemini` (Milestone 2; falls back to `sample` if no key is set) |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | | | LLM credentials (server-side only) |
| `FLIGHT_PROVIDER`, `HOTEL_PROVIDER`, `FX_PROVIDER`, `MAPS_PROVIDER`, `WEATHER_PROVIDER` and their `*_API_KEY` | | `estimate` / `sample` / `none` | Provider adapter selection (Milestones 2–3) |

### `apps/web/.env` (optional)

| Variable | Purpose |
| --- | --- |
| `VITE_API_PROXY` | Where the Vite dev server proxies `/api` (default `http://localhost:4000`) |

**Never put provider keys in `VITE_*` variables.** Everything with that prefix ships to browsers. All third-party calls go through the API.

## Data honesty rules (enforced in code)

- Prices carry a `confidence` of `verified`, `estimate` or `sample`. Milestone 1 has no verified prices, and a test asserts it.
- Transport fares come from a documented distance model (`packages/shared/src/transport.ts`). They are labelled "Not a live fare".
- Visa notes say "at last review" and point users to official sources.
- `Booking.status` can only be `CONFIRMED` after a provider confirms the booking. User-entered references are `SAVED_REFERENCE`.
- Sponsored items have an explicit `isSponsored` flag. Ranking code (`rankScenarios`) has no input for commissions.

## Known limitations (Milestone 1)

- Destination artwork is generated SVG. Licensed photography plugs in through `Destination.imageUrl`.
- The route map is a schematic sketch. Interactive provider maps arrive in Milestone 2.
- Itineraries assume a single base per destination. Multi-base stays (e.g. Port Blair → Havelock) arrive with the itinerary builder.
- `npm audit` reports advisories only in dev tooling: the Prisma CLI's config loader (`deepmerge-ts`) and esbuild's dev server on Windows. Neither ships in production bundles. Revisit when Prisma 7 is adopted.
