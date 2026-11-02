import { Link } from 'react-router-dom';
import type { ComfortTier, DestinationSummary } from '@trippilot/shared';
import { Postcard } from './Postcard';
import { inr, monthList, titleCase } from '../lib/format';

export function DestinationCard({ d, tier = 'standard', index = 0 }: { d: DestinationSummary; tier?: ComfortTier; index?: number }) {
  return (
    <Link
      to={`/destinations/${d.slug}`}
      className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Postcard scene={d.scene} palette={d.palette} imageUrl={d.imageUrl} alt={`Illustration of ${d.name}`} className="size-full transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
            {d.country.flag} {d.international ? d.country.name : d.region}
          </span>
        </div>
        {d.matchReasons?.[0] && (
          <span className="absolute bottom-3 left-3 rounded-full bg-pine-700/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {d.matchReasons[0]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="display text-xl">{d.name}</h3>
          {d.distanceKm !== undefined && <span className="text-xs text-muted tabular">{d.distanceKm.toLocaleString('en-IN')} km</span>}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{d.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-sand px-2 py-0.5 text-xs text-ink-soft">{titleCase(t)}</span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4 mt-5">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted">From / person / day</div>
            <div className="text-lg font-semibold tabular">
              {inr(d.dailyCostPerPerson[tier])}
              <span className="ml-1.5 align-middle text-[11px] font-medium text-violet-ink">sample</span>
            </div>
          </div>
          <div className="text-right text-xs text-muted">
            <div>Best: {monthList(d.bestMonths).split(', ').slice(0, 3).join(', ')}{d.bestMonths.length > 3 ? '…' : ''}</div>
            <div>{d.idealDays[0]}–{d.idealDays[1]} days</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
