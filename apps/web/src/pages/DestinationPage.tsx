import { useParams } from 'react-router-dom';
import { MONTHS, type ComfortTier } from '@trippilot/shared';
import { useDestination } from '../lib/queries';
import { Postcard } from '../components/Postcard';
import { ButtonLink } from '../components/ui/Button';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { ErrorState, Skeleton } from '../components/ui/States';
import { formatDuration, inr, titleCase } from '../lib/format';
import { ApiRequestError } from '../lib/api';
import { NotFoundPage } from './NotFoundPage';

const TIERS: { id: ComfortTier; label: string }[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'standard', label: 'Comfort' },
  { id: 'premium', label: 'Premium' },
];

export function DestinationPage() {
  const { slug } = useParams();
  const { data: d, isLoading, isError, error, refetch } = useDestination(slug);

  if (isLoading) return <div className="container-page pt-10"><Skeleton className="h-80" /><Skeleton className="mt-6 h-40" /></div>;
  if (isError && error instanceof ApiRequestError && error.status === 404) return <NotFoundPage what="destination" />;
  if (isError || !d) return <div className="container-page pt-10"><ErrorState error={error} onRetry={() => refetch()} /></div>;

  const maxT = Math.max(...d.monthlyTempC, 35);
  const minT = Math.min(...d.monthlyTempC, 0);
  return (
    <article>
      <div className="relative">
        <Postcard scene={d.scene} palette={d.palette} imageUrl={d.imageUrl} alt={`Illustration of ${d.name}`} className="h-[340px] w-full sm:h-[420px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-8 text-white">
          <div className="text-sm font-medium text-white/85">{d.country.flag} {d.region}, {d.country.name}</div>
          <h1 className="display mt-1 text-5xl sm:text-6xl">{d.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-white/90">{d.tagline}</p>
        </div>
      </div>

      <div className="container-page mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          <section>
            <p className="text-lg leading-relaxed text-ink-soft">{d.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {d.tags.map((t) => <span key={t} className="rounded-full bg-sand px-3 py-1 text-sm text-ink-soft">{titleCase(t)}</span>)}
            </div>
          </section>

          <section aria-labelledby="when">
            <h2 id="when" className="display text-2xl">When to go</h2>
            <p className="mt-1 text-sm text-muted">Average daytime highs (°C) · sample climate data</p>
            <div className="mt-5 grid grid-cols-12 items-end gap-1.5 sm:gap-2">
              {d.monthlyTempC.map((t, i) => {
                const m = i + 1;
                const tone = d.bestMonths.includes(m) ? 'bg-pine-500' : d.avoidMonths.includes(m) ? 'bg-coral/70' : 'bg-sand-deep';
                return (
                  <div key={m} className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-medium tabular text-ink-soft">{t}°</span>
                    <div className={`w-full rounded-md ${tone}`} style={{ height: `${24 + ((t - minT) / (maxT - minT)) * 90}px` }} title={`${MONTHS[i]}: ${t}°C`} />
                    <span className="text-[11px] text-muted">{MONTHS[i]![0]}<span className="hidden sm:inline">{MONTHS[i]!.slice(1)}</span></span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-pine-500" /> Best time</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-sand-deep" /> Shoulder</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded bg-coral/70" /> Best avoided</span>
              {d.peakMonths.length > 0 && <span>Peak prices: {d.peakMonths.map((m) => MONTHS[m - 1]).join(', ')}</span>}
            </div>
          </section>

          <section id="sights" aria-labelledby="sights-h" className="scroll-mt-24">
            <h2 id="sights-h" className="display text-2xl">Top sights & experiences</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {d.attractions.map((a) => (
                <li key={a.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{a.name}</h3>
                    <span className="shrink-0 text-sm font-semibold tabular">{a.pricePerPerson > 0 ? inr(a.pricePerPerson) : 'Free'}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{a.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>📍 {a.area}</span><span>· {formatDuration(a.durationMinutes)}</span>
                    {a.bestTime !== 'any' && <span>· best in the {a.bestTime}</span>}
                    {a.pricePerPerson > 0 && <ConfidenceBadge confidence="sample" compact />}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Typical daily cost</h2>
              <ConfidenceBadge confidence={d.dataConfidence} />
            </div>
            <p className="mt-1 text-xs text-muted">Per person: half a double room, food and local transport.</p>
            <dl className="mt-4 space-y-2.5">
              {TIERS.map((t) => (
                <div key={t.id} className="flex items-baseline justify-between">
                  <dt className="text-sm text-ink-soft">{t.label}</dt>
                  <dd className="text-lg font-semibold tabular">{inr(d.dailyCostPerPerson[t.id])}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink to={`/plan?to=${d.slug}`} className="mt-5 w-full">Plan a trip to {d.name}</ButtonLink>
          </div>
          <div className="card space-y-4 p-5 text-sm">
            <div><div className="font-semibold">Entry for Indian passport holders</div><p className="mt-1 text-muted">{d.visaNote} Always confirm on the official government website.</p></div>
            <div><div className="font-semibold">Accessibility</div><p className="mt-1 text-muted"><span className="font-medium capitalize text-ink">{d.accessibility}</span> — {d.accessibilityNotes}</p></div>
            <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
              <div><div className="text-xs text-muted">Ideal stay</div><div className="font-medium">{d.idealDays[0]}–{d.idealDays[1]} days</div></div>
              <div><div className="text-xs text-muted">Local currency</div><div className="font-medium">{d.currency}</div></div>
              <div><div className="text-xs text-muted">Time zone</div><div className="font-medium">{d.timeZone.split('/')[1]?.replace('_', ' ')}</div></div>
              <div><div className="text-xs text-muted">Languages</div><div className="font-medium">{d.languages.slice(0, 2).join(', ')}</div></div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
