import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MONTHS, ORIGIN_HUBS } from '@trippilot/shared';
import { useDestinations } from '../lib/queries';
import { DestinationCard } from '../components/DestinationCard';
import { Chip } from '../components/ui/Chip';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States';
import { Button } from '../components/ui/Button';

const COLLECTIONS = [
  { id: 'beach', label: '🏖 Beaches' },
  { id: 'mountains', label: '🏔 Mountains' },
  { id: 'heritage', label: '🏛 Heritage' },
  { id: 'adventure', label: '🧗 Adventure' },
  { id: 'family', label: '👨‍👩‍👧 Family' },
  { id: 'city', label: '🌆 Cities' },
  { id: 'spiritual', label: '🕉 Spiritual' },
  { id: 'romantic', label: '💞 Romantic' },
  { id: 'food', label: '🍜 Food' },
  { id: 'island', label: '🏝 Islands' },
];

const DAILY_BUDGETS = [
  { v: '', label: 'Any budget' },
  { v: '2500', label: 'Under ₹2,500/day' },
  { v: '4000', label: 'Under ₹4,000/day' },
  { v: '6000', label: 'Under ₹6,000/day' },
];

export function DiscoverPage() {
  const [sp, setSp] = useSearchParams();
  const get = (k: string, d = '') => sp.get(k) ?? d;
  const update = (k: string, v: string | null) => {
    const next = new URLSearchParams(sp);
    if (v === null || v === '' || v === 'any') next.delete(k);
    else next.set(k, v);
    setSp(next, { replace: true });
  };
  const tags = get('tags').split(',').filter(Boolean);
  const params = useMemo(() => Object.fromEntries([...sp.entries()].filter(([, v]) => v !== '')), [sp]);
  const { data, isLoading, isError, error, refetch, isFetching } = useDestinations({ origin: get('origin', 'DEL'), ...params });
  const activeCount = [...sp.keys()].filter((k) => !['origin', 'sort'].includes(k)).length;

  return (
    <div className="container-page pt-10">
      <header className="max-w-3xl">
        <span className="eyebrow">Discover</span>
        <h1 className="display mt-3 text-4xl sm:text-5xl">Find a destination that fits</h1>
        <p className="mt-3 text-ink-soft">Filter by season, budget, trip length, travel style and accessibility. Costs are typical figures from our sample dataset.</p>
      </header>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        <Chip active={tags.length === 0 && !get('weekend')} onClick={() => { update('tags', null); update('weekend', null); }}>All</Chip>
        <Chip active={get('weekend') === 'true'} onClick={() => update('weekend', get('weekend') ? null : 'true')}>🚗 Weekend getaways</Chip>
        {COLLECTIONS.map((c) => (
          <Chip key={c.id} active={tags.includes(c.id)} onClick={() => update('tags', tags.includes(c.id) ? tags.filter((t) => t !== c.id).join(',') : [...tags, c.id].join(','))}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-label="Filters">
          <div className="card space-y-4 p-5">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Search</span>
              <input className="input" placeholder="Name, region, country…" value={get('q')} onChange={(e) => update('q', e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Travelling from</span>
              <select className="input" value={get('origin', 'DEL')} onChange={(e) => update('origin', e.target.value)}>
                {ORIGIN_HUBS.map((o) => <option key={o.code} value={o.code}>{o.city}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Where</span>
              <select className="input" value={get('region', 'any')} onChange={(e) => update('region', e.target.value)}>
                <option value="any">Anywhere</option><option value="domestic">Within India</option><option value="international">International</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Travel month</span>
              <select className="input" value={get('month')} onChange={(e) => update('month', e.target.value)}>
                <option value="">Any month</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Weather that month</span>
              <select className="input" value={get('climate', 'any')} onChange={(e) => update('climate', e.target.value)}>
                <option value="any">Any</option><option value="cool">Cool (under 22°C)</option><option value="mild">Mild (22–30°C)</option><option value="warm">Warm (over 30°C)</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Daily budget per person</span>
              <select className="input" value={get('maxDailyCost')} onChange={(e) => update('maxDailyCost', e.target.value)}>
                {DAILY_BUDGETS.map((b) => <option key={b.v} value={b.v}>{b.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Trip length</span>
              <select className="input" value={get('days')} onChange={(e) => update('days', e.target.value)}>
                <option value="">Any length</option><option value="2">2 days</option><option value="3">3 days</option><option value="5">5 days</option><option value="7">A week</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">Accessibility</span>
              <select className="input" value={get('accessibility', 'any')} onChange={(e) => update('accessibility', e.target.value)}>
                <option value="any">Any</option><option value="moderate">Moderate or better</option><option value="good">Good step-free access</option>
              </select>
            </label>
            {activeCount > 0 && <Button variant="ghost" size="sm" className="w-full" onClick={() => setSp(new URLSearchParams(), { replace: true })}>Clear all filters</Button>}
          </div>
        </aside>

        <section aria-live="polite">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">{isLoading ? 'Loading…' : `${data?.total ?? 0} destination${data?.total === 1 ? '' : 's'}`}{isFetching && !isLoading ? ' · updating' : ''}</p>
            <select aria-label="Sort" className="input w-auto py-2 text-sm" value={get('sort', 'recommended')} onChange={(e) => update('sort', e.target.value)}>
              <option value="recommended">Recommended</option><option value="cost_asc">Lowest cost</option><option value="cost_desc">Highest cost</option><option value="distance">Nearest</option>
            </select>
          </div>
          {isError ? (
            <ErrorState error={error} onRetry={() => refetch()} title="Couldn’t load destinations" />
          ) : isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[380px]" />)}</div>
          ) : data!.destinations.length === 0 ? (
            <EmptyState title="No destinations match" body="Try removing a filter or choosing a different month." action={<Button variant="secondary" onClick={() => setSp(new URLSearchParams())}>Reset filters</Button>} />
          ) : (
            <div className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 transition-opacity ${isFetching ? 'opacity-70' : ''}`}>
              {data!.destinations.map((d, i) => <DestinationCard key={d.slug} d={d} index={i} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
