import { Link } from 'react-router-dom';
import type { ComfortTier, PlanResult, PlannerRequestInput } from '@trippilot/shared';
import { formatDuration, inr } from '../../lib/format';
import { planToSearchParams } from '../../lib/plan-params';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { CategoryBar } from './CostBreakdown';

const BADGES: { key: keyof PlanResult['ranking']; label: string; cls: string }[] = [
  { key: 'cheapest', label: 'Cheapest', cls: 'bg-pine-50 text-pine-700' },
  { key: 'bestValue', label: 'Best value', cls: 'bg-amber-soft text-amber-ink' },
  { key: 'mostConvenient', label: 'Most convenient', cls: 'bg-[#E8F0FC] text-sky-600' },
];

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="text-muted">{label}</span><span className="font-medium tabular">{value.toFixed(1)}/10</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-sand"><div className="h-full rounded-full bg-pine-500" style={{ width: `${value * 10}%` }} /></div>
    </div>
  );
}

export function ScenarioCompare({ plan, request }: { plan: PlanResult; request: PlannerRequestInput }) {
  const travellers = plan.request.adults + plan.request.children;
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {plan.scenarios.map((s) => {
          const badges = BADGES.filter((b) => plan.ranking[b.key] === s.id);
          const current = s.tier === plan.request.tier;
          const to = `/plan/results?${planToSearchParams({ ...request, tier: s.tier as ComfortTier })}`;
          return (
            <article key={s.id} className={`card flex flex-col p-5 ${current ? 'ring-2 ring-pine-500' : ''}`}>
              <div className="flex min-h-6 flex-wrap gap-1.5">
                {badges.map((b) => <span key={b.key} className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${b.cls}`}>{b.label}</span>)}
                {current && <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">Your plan</span>}
              </div>
              <h3 className="display mt-3 text-xl">{s.label}</h3>
              <div className="mt-3">
                <div className="display text-3xl tabular">{inr(s.cost.total)}</div>
                <div className="text-sm text-muted tabular">{inr(s.cost.perTraveller)} per traveller · range {inr(s.cost.range.low)}–{inr(s.cost.range.high)}</div>
              </div>
              <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-muted">Getting there</dt><dd className="text-right">{s.transport ? s.transport.label : 'Local only'}</dd></div>
                {s.transport && <div className="flex justify-between gap-3"><dt className="text-muted">Journey time</dt><dd className="tabular">~{formatDuration(s.transport.durationMinutes)} each way</dd></div>}
                <div className="flex justify-between gap-3"><dt className="text-muted">Stay</dt><dd className="tabular">{inr(s.cost.items.find((i) => i.id === 'accommodation')?.amount ?? 0)}</dd></div>
              </dl>
              <div className="mt-4 space-y-2.5">
                <Meter label="Comfort" value={s.scores.comfortScore} />
                <Meter label="Convenience" value={s.scores.convenienceScore} />
              </div>
              <div className="mt-5"><CategoryBar cost={s.cost} /></div>
              {!current && (
                <Link to={to} className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-line text-sm font-medium transition hover:border-pine-200 hover:bg-pine-50">
                  Switch to {s.label}
                </Link>
              )}
            </article>
          );
        })}
      </div>
      <p className="text-sm text-muted">
        <b>How we rank:</b> cheapest = lowest estimated total. Most convenient = shortest door-to-door journey, fewest connections and easiest local transport. Best value = comfort and convenience relative to cost. Rankings never depend on commissions or sponsorship.
      </p>

      <div className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-semibold">Ways to get there from {plan.request.origin.city}</h3>
          <p className="text-sm text-muted">Model-based estimates for {travellers} traveller{travellers > 1 ? 's' : ''}, return. Live fares, baggage and cancellation terms arrive with provider integrations.</p>
        </div>
        {plan.transportOptions.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">You’re already close by — local transport covers this trip.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-sand/60 text-left text-xs uppercase tracking-wider text-muted">
                <tr><th className="px-5 py-2.5 font-medium">Option</th><th className="px-3 py-2.5 font-medium">Time (one way)</th><th className="px-3 py-2.5 font-medium">Per traveller</th><th className="px-3 py-2.5 font-medium">Total</th><th className="px-5 py-2.5 font-medium"></th></tr>
              </thead>
              <tbody>
                {plan.transportOptions.map((t) => (
                  <tr key={t.mode} className="border-t border-line">
                    <td className="px-5 py-3">
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted">{t.distanceKm.toLocaleString('en-IN')} km{plan.transport?.mode === t.mode ? ' · used in your plan' : ''}</div>
                    </td>
                    <td className="px-3 py-3 tabular">~{formatDuration(t.durationMinutes)}</td>
                    <td className="px-3 py-3 tabular">{inr(t.perTravellerReturn.low)}–{inr(t.perTravellerReturn.high)}</td>
                    <td className="px-3 py-3 font-semibold tabular">{inr(t.perTravellerReturn.best * travellers)}</td>
                    <td className="px-5 py-3"><ConfidenceBadge confidence={t.confidence} compact /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
