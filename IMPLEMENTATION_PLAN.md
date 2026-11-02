# TripPilot — Implementation Plan

Mission: *Help travellers plan better trips, understand the real cost of travelling and make confident travel decisions.* Launch market: India. Long-term: global.

Legend: ✅ done · 🟡 partial / scaffolded · ⬜ not started

## Milestone 1 — Foundations & planning preview ✅

| Item | Status | Notes |
| --- | --- | --- |
| Monorepo (web, api, shared) and TypeScript strict | ✅ | npm workspaces |
| Complete database schema (19 required entities + supporting tables) | ✅ | `apps/api/prisma/schema.prisma`, migrations committed |
| Sample dataset: 10 countries, 23 destinations, 141 attractions | ✅ | `apps/api/src/data/sample-destinations.ts`, labelled SAMPLE |
| Authentication (register, login, logout, me) | ✅ | bcrypt(12), httpOnly JWT cookie, rate limits, enumeration-safe login |
| Landing page | ✅ | |
| Destination discovery and filters | ✅ | Collections, weekend getaways, month, climate, budget, length, accessibility |
| Search interface | ✅ | Typeahead combobox |
| Trip planner UI | ✅ | Client and server validation share one zod schema |
| Sample itinerary generation | ✅ | Rule-based generator behind the `ItineraryGenerator` interface |
| Itinerary feasibility checks | ✅ | Overlaps, long legs, overloaded days, late finishes |
| Complete cost breakdown with confidence labels | ✅ | `calculateTripCost` with ranges, sources and budget assessment |
| Scenario comparison (cheapest, best value, most convenient) | ✅ | `rankScenarios`; ranking ignores commissions |
| Alternative destinations | ✅ | |
| Save, list, view and delete trips | ✅ | The server re-generates the plan; client snapshots are never trusted |
| Responsive design, loading/error/empty states | ✅ | Checked at 390 px and 1440 px |
| Tests for important calculations | ✅ | 262 tests |
| README, environment docs and architecture doc | ✅ | |
| Admin dashboard | ⬜ | Moved to Milestone 4 (role and guard already exist: `requireAdmin`) |
| User profile page | ⬜ | Milestone 4 (the `UserPreferences` model exists) |

## Milestone 2 — AI planner and editable itineraries

- **Gemini planner.** Implement `GeminiItineraryGenerator`:
  - Send the destination catalogue and constraints, and request JSON output.
  - Validate the response with zod and re-run `checkItineraryFeasibility`.
  - Prices always come from TripPilot data, never from the model.
  - Store prompts and responses in `AIConversation`.
- **AI travel assistant** (chat), with structured answers that state uncertainty and cite their data source.
- **Itinerary builder.** Drag to reorder, add and remove stops, change dates, live travel-time and feasibility checks. Multi-base stays. Persist through `Itinerary` / `ItineraryActivity` versions.
- **Expense management.** Edit planned expenses and log actual spend (`TripExpense.isPlanned`).
- **Currency conversion.** `FxProvider` adapter, a display-currency switcher, and `amountInTripCurrency` + `fxRate` on expenses.
- **Maps.** A `MapsProvider` adapter (Google, Mapbox or similar) replaces `RouteSketch`. Use real routing times where available.
- **User profile and preferences** page.

## Milestone 3 — Real flight & hotel data

- Implement `FlightProvider` / `HotelProvider` adapters (`apps/api/src/providers/types.ts`) for authorised providers only.
- Flight comparison screen: airlines, times, layovers, baggage, cancellation, seat fees, total payable.
- Hotel comparison screen: location and distance to the plan's stops, sourced ratings, facilities, breakfast, cancellation, taxes, total payable.
- Freshness tracking: write every price to `PriceObservation`. A price is `verified` only within `TravelProvider.freshnessMinutes`, and the UI shows "checked X min ago".
- Redis cache plus BullMQ workers for provider polling.
- Price alerts (`PriceAlert`) sent as notifications.
- Move the catalogue to SQL filtering and a search index.

## Milestone 4 — Groups, notifications, dashboard

- Trip members and invites (`TripMember`), roles, and share tokens (`Trip.shareToken`).
- Voting (`TripVote`), shared checklists (`ChecklistItem`), split expenses and settle-up (`SharedExpense`).
- Documents vault: private object storage, signed URLs, ownership checks, and passport/visa expiry reminders (`Document`).
- Notifications: in-app, email and push (`Notification`) through a queue.
- User dashboard and an admin dashboard (catalogue management, provider health, data freshness).

## Milestone 5 — Monetisation & production

- Affiliate deep links with disclosure, insurance referrals, and activity and hotel referrals.
- Premium plans (`SubscriptionPlan`, `UserSubscription`) through a payment provider.
- Sponsored placements are always labelled and kept in a separate slot. They never reorder organic results.
- Production: containerised API, managed Postgres and Redis, CDN for the web app, observability (OpenTelemetry), backups, a security review and a privacy policy (DPDP Act 2023 compliance for India).

## Decisions log

| Decision | Why |
| --- | --- |
| Shared domain package | The UI and API compute and validate identically; calculations are tested once |
| Money as `Decimal(14,2)` + currency column in the DB; whole units in the engine | Multi-currency safe storage; estimates don't need paise precision |
| Ranges + `confidence` on every line item | The core product promise: never fake precision or certainty |
| Plans addressed by URL query | Shareable, refreshable results; cacheable by TanStack Query |
| Saving re-runs the planner server-side | Clients cannot forge prices into stored trips |
| Rule-based generator first | Deterministic and testable; it sets the contract the LLM planner must satisfy |
| Cookie sessions over localStorage tokens | Not readable by injected scripts; SameSite=Lax |
