import { Link, useNavigate } from 'react-router-dom';
import { addDays } from '@trippilot/shared';
import { useDestinations } from '../lib/queries';
import { defaultDates, planToSearchParams } from '../lib/plan-params';
import { DestinationCard } from '../components/DestinationCard';
import { Postcard } from '../components/Postcard';
import { SearchBox } from '../components/SearchBox';
import { ButtonLink } from '../components/ui/Button';
import { ConfidenceBadge, ConfidenceLegend } from '../components/ui/ConfidenceBadge';
import { Skeleton } from '../components/ui/States';
import { inr } from '../lib/format';

const { startDate } = defaultDates();
const EXAMPLES = [
  { text: '5-day Bali trip for two under ₹1,00,000', req: { origin: 'DEL', destination: 'bali', adults: 2, budget: 100000, nights: 4, interests: ['beach', 'culture'] } },
  { text: 'Long weekend in Coorg from Bengaluru', req: { origin: 'BLR', destination: 'coorg', adults: 2, budget: 30000, nights: 2, interests: ['nature', 'food'] } },
  { text: 'Family week in Dubai from Mumbai', req: { origin: 'BOM', destination: 'dubai', adults: 2, children: 2, budget: 300000, nights: 6, interests: ['family', 'shopping'] } },
  { text: 'Surprise me: beach trip in India for ₹40,000', req: { origin: 'HYD', adults: 2, budget: 40000, nights: 3, interests: ['beach'], region: 'domestic' as const } },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useDestinations({ sort: 'recommended' });
  const featured = data?.destinations.slice(0, 6) ?? [];
  const heroes = data?.destinations.filter((d) => ['bali', 'leh-ladakh', 'udaipur'].includes(d.slug)) ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--color-pine-50),transparent_60%),radial-gradient(ellipse_at_bottom_right,#FDF3E1,transparent_55%)]" />
        <div className="container-page grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <span className="eyebrow">Travel intelligence for India & beyond</span>
            <h1 className="display mt-4 text-[44px] leading-[1.04] sm:text-6xl lg:text-[68px]">
              Know the <em className="text-pine-600 not-italic [font-style:italic]">real cost</em> of a trip before you go.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              TripPilot plans day-by-day itineraries and prices the whole journey — transport, stays, food, tickets, visas, insurance and the fees people forget — and tells you exactly which numbers are estimates.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/plan" size="lg">Plan a trip</ButtonLink>
              <ButtonLink to="/discover" size="lg" variant="secondary">Explore destinations</ButtonLink>
            </div>
            <SearchBox className="mt-8 max-w-md" placeholder="Try “Goa”, “Thailand” or “Amber Fort”" />
          </div>

          <div className="relative hidden h-[520px] lg:block" aria-hidden>
            {heroes.slice(0, 3).map((d, i) => (
              <div
                key={d.slug}
                className="absolute w-[300px] overflow-hidden rounded-[28px] border-[6px] border-white bg-white shadow-[var(--shadow-lift)] animate-fade-up"
                style={{
                  left: ['8%', '44%', '20%'][i],
                  top: ['4%', '16%', '52%'][i],
                  rotate: ['-5deg', '4deg', '-1.5deg'][i],
                  animationDelay: `${i * 120 + 100}ms`,
                  zIndex: [1, 2, 3][i],
                }}
              >
                <Postcard scene={d.scene} palette={d.palette} alt="" className="aspect-[4/3] w-full" />
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="display text-lg">{d.name}</div>
                    <div className="text-xs text-muted">{d.country.flag} {d.international ? d.country.name : d.region}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-muted">per day from</div>
                    <div className="font-semibold">{inr(d.dailyCostPerPerson.budget)}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && <Skeleton className="absolute left-[15%] top-[10%] h-80 w-80 rounded-[28px]" />}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="container-page">
        <div className="card flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="shrink-0 lg:w-52">
            <div className="text-sm font-semibold">Try an example</div>
            <div className="text-xs text-muted">Opens a full plan with costs</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button
                key={e.text}
                onClick={() => {
                  const { nights, ...rest } = e.req;
                  navigate(`/plan/results?${planToSearchParams({ ...rest, startDate, endDate: addDays(startDate, nights) })}`);
                }}
                className="rounded-full border border-line bg-paper px-4 py-2 text-left text-sm transition hover:border-pine-200 hover:bg-pine-50"
              >
                “{e.text}”
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="container-page mt-24">
        <div className="max-w-2xl">
          <span className="eyebrow">Why TripPilot</span>
          <h2 className="display mt-3 text-4xl sm:text-5xl">Compare whole trips, not just tickets.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icon: '🧾', title: 'Complete cost, itemised', body: 'Flights or trains, hotels and taxes, local transport, meals, tickets, visa fees, insurance and booking fees — with ranges, not false precision.' },
            { icon: '🗺️', title: 'Itineraries that actually work', body: 'Stops are grouped by area and timed with conservative travel estimates, so you never get a plan that needs teleportation.' },
            { icon: '⚖️', title: 'Cheapest vs best value', body: 'See budget, comfort and premium versions of the same trip side by side — plus cheaper destinations that match your interests.' },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="grid size-11 place-items-center rounded-xl bg-pine-50 text-xl" aria-hidden>{f.icon}</div>
              <h3 className="display mt-5 text-xl">{f.title}</h3>
              <p className="mt-2 text-[15px] text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-page mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Popular right now</span>
            <h2 className="display mt-3 text-4xl">Where travellers are heading</h2>
          </div>
          <Link to="/discover" className="text-sm font-semibold text-pine-700 hover:underline">See all destinations →</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[380px]" />)
            : featured.map((d, i) => <DestinationCard key={d.slug} d={d} index={i} />)}
        </div>
      </section>

      {/* Transparency */}
      <section className="container-page mt-24">
        <div className="grid gap-10 overflow-hidden rounded-[32px] bg-pine-900 p-8 text-white sm:p-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-pine-200">Honest by design</span>
            <h2 className="display mt-3 text-4xl">Every number tells you where it came from.</h2>
            <p className="mt-4 text-pine-100">
              Travel sites often show a teaser price and reveal the rest at checkout. TripPilot labels each line so you know what is confirmed, what is calculated and what is illustrative. Sponsored placements are always marked and never re-rank organic results.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 text-ink">
            <ConfidenceLegend />
            <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
              {[
                ['Economy flight · 1 stop (return) × 2', 102800, 'estimate'],
                ['Hotel taxes & service (21%)', 6850, 'sample'],
                ['Visa / entry fees × 2', 7000, 'sample'],
              ].map(([l, a, c]) => (
                <div key={l as string} className="flex items-center gap-3">
                  <span className="flex-1">{l}</span>
                  <ConfidenceBadge confidence={c as 'estimate'} compact />
                  <span className="w-20 text-right font-medium tabular">{inr(a as number)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
