# Architecture

```
┌──────────────┐  /api (same-origin via proxy / reverse proxy)  ┌──────────────────────────────┐
│  apps/web    │ ─────────────────────────────────────────────▶ │  apps/api (Express 5)        │
│  React 19    │   httpOnly session cookie                      │  ├─ modules/auth             │
│  TanStack Q. │                                                │  ├─ modules/destinations     │
│  Tailwind 4  │                                                │  ├─ modules/search           │
└──────┬───────┘                                                │  ├─ modules/planner          │
       │ imports                                                │  │   └─ generators/ (sample, │
       ▼                                                        │  │       gemini — pluggable) │
┌──────────────────────────────┐        imports                 │  ├─ modules/trips            │
│ packages/shared              │ ◀───────────────────────────── │  ├─ providers/ (contracts)   │
│  cost-engine · transport     │                                │  └─ Prisma ─▶ PostgreSQL     │
│  scenarios · feasibility     │                                │        (Redis: Milestone 3)  │
│  schemas (zod) · types       │                                └──────────────────────────────┘
└──────────────────────────────┘
```

## Request flow: `POST /api/planner/plan`

1. Validate the body with `plannerRequestSchema`. The web form uses the same schema.
2. Resolve the destination: either the given slug or `chooseDestination`, which scores season fit, interest overlap and budget fit.
3. Get transport options from the distance model (`estimateTransportOptions`) and pick a primary mode per tier.
4. Build the itinerary with the configured `ItineraryGenerator`, then run `checkItineraryFeasibility`.
5. Price the trip with `calculateTripCost` for the chosen tier, and also for all three tiers. Rank them with `rankScenarios`.
6. Price up to four alternative destinations with the same inputs.
7. Return a `PlanResult` with warnings, seasonality, accommodation guidance and a data notice.

## Provider strategy

Every external dependency sits behind an interface (`apps/api/src/providers/types.ts`, `generators/types.ts`) and is selected by an environment variable. Adapters must:
- never invent fares, availability or ratings;
- mark a price `verified` only inside its freshness window;
- log observations to `PriceObservation`;
- keep credentials server-side.

## Database overview

| Domain | Models |
| --- | --- |
| Identity | `User`, `UserPreferences` |
| Catalogue | `Country`, `Destination` (cost profile JSON, climate, time zone), `Attraction` |
| Planning | `Trip` (immutable plan snapshot + request), `TripMember`, `Itinerary` (versioned), `ItineraryActivity` |
| Prices | `TravelProvider`, `FlightOption`, `HotelOption`, `PriceObservation`, `PriceAlert` |
| Money | `TripExpense` (planned vs actual, FX), `SharedExpense` |
| Bookings & docs | `Booking` (never CONFIRMED without the provider), `Document` (private storage key, last-4 only) |
| Engagement | `Notification`, `TripVote`, `ChecklistItem`, `AIConversation` |
| Monetisation | `SubscriptionPlan`, `UserSubscription`, `isSponsored` flags, affiliate fields on providers |

Conventions:
- Money is stored as `Decimal(14,2)` with an ISO-4217 currency column.
- Timestamps are UTC. Wall-clock context comes from IANA `timeZone` columns.
- Enums cover status fields so invalid states can't be stored.

## Security notes

- Passwords are hashed with bcrypt (cost 12). Login compares against a dummy hash for unknown emails, so timing doesn't reveal which accounts exist.
- The JWT lives in an httpOnly, SameSite=Lax cookie, `secure` in production. Auth and planner endpoints are rate-limited.
- Helmet headers, a 100 KB JSON body limit, and an explicit CORS allow-list with credentials.
- All input is validated with zod at the boundary. Errors use the shape `{ error: { code, message, details } }`.
- Trip access is checked against the owner or an accepted membership. Deletes are owner-only.
