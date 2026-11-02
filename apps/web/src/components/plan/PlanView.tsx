import { useState, type ReactNode } from 'react';
import type { PlanResult, PlannerRequestInput } from '@trippilot/shared';
import { formatDateRange, formatDuration, inr } from '../../lib/format';
import { Postcard } from '../Postcard';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { Alternatives } from './Alternatives';
import { BudgetMeter } from './BudgetMeter';
import { CostBreakdown } from './CostBreakdown';
import { ItineraryView } from './ItineraryView';
import { ScenarioCompare } from './ScenarioCompare';

const TABS = [
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'cost', label: 'Cost breakdown' },
  { id: 'compare', label: 'Compare options' },
  { id: 'alternatives', label: 'Alternatives' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const SEASON_STYLE = {
  great: 'bg-pine-50 text-pine-700',
  okay: 'bg-amber-soft text-amber-ink',
  avoid: 'bg-coral/10 text-coral',
} as const;

export function PlanView({ plan, request, actions, banner }: { plan: PlanResult; request: PlannerRequestInput; actions?: ReactNode; banner?: ReactNode }) {
  const [tab, setTab] = useState<TabId>('itinerary');
  const travellers = plan.request.adults + plan.request.children;
  const d = plan.destination;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line">
        <Postcard scene={d.scene} palette={d.palette} imageUrl={d.imageUrl} alt="" className="absolute inset-0 size-full opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-paper/40" />
        <div className="container-page relative py-10">
          {banner}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                <span>{d.country.flag} {d.international ? d.country.name : d.region}</span>
                <span className="text-line">•</span>
                <span>{formatDateRange(plan.request.startDate, plan.request.endDate)}</span>
                <span className="text-line">•</span>
                <span>{plan.request.adults} adult{plan.request.adults > 1 ? 's' : ''}{plan.request.children ? `, ${plan.request.children} child${plan.request.children > 1 ? 'ren' : ''}` : ''}</span>
              </div>
              <h1 className="display mt-2 text-4xl sm:text-5xl">{plan.request.nights + 1} days in {d.name}</h1>
              <p className="mt-2 text-ink-soft">From {plan.request.origin.city} · {d.tagline}</p>
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-muted">Estimated total</div>
              <div className="display mt-1 text-3xl tabular">{inr(plan.cost.total)}</div>
              <div className="text-xs text-muted tabular">Range {inr(plan.cost.range.low)} – {inr(plan.cost.range.high)}</div>
            </div>
            <div className="card p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-muted">Per traveller</div>
              <div className="display mt-1 text-3xl tabular">{inr(plan.cost.perTraveller)}</div>
              <div className="text-xs text-muted">{travellers} traveller{travellers > 1 ? 's' : ''} · excl. optional extras</div>
            </div>
            <div className="card p-5"><BudgetMeter budget={plan.cost.budget} /></div>
            <div className="card p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-muted">Getting there</div>
              {plan.transport ? (
                <>
                  <div className="mt-1 font-semibold">{plan.transport.label}</div>
                  <div className="text-sm text-muted">~{formatDuration(plan.transport.durationMinutes)} each way · {plan.transport.distanceKm.toLocaleString('en-IN')} km</div>
                  <div className="mt-1.5"><ConfidenceBadge confidence={plan.transport.confidence} /></div>
                </>
              ) : (
                <div className="mt-1 font-semibold">Local transport only</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page mt-8 space-y-4">
        {/* Data notice */}
        <div className="flex gap-3 rounded-2xl border border-violet-ink/15 bg-violet-soft px-5 py-4 text-sm text-violet-ink">
          <span aria-hidden>ⓘ</span>
          <p><b>About these numbers.</b> {plan.dataNotice} Planner: {plan.generator.label}.</p>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className={`rounded-2xl px-5 py-4 text-sm ${SEASON_STYLE[plan.seasonality.verdict]}`}>
            <b>{plan.seasonality.verdict === 'great' ? 'Great timing' : plan.seasonality.verdict === 'okay' ? 'Shoulder season' : 'Tricky timing'}.</b> {plan.seasonality.note}
          </div>
          {plan.warnings.length > 0 && (
            <div className="rounded-2xl border border-amber-ink/20 bg-amber-soft/60 px-5 py-4 text-sm text-amber-ink" role="status">
              <b>Things to know</b>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">{plan.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 mt-8 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="container-page">
          <div role="tablist" aria-label="Plan sections" className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {TABS.map((t) => (
              <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-medium transition ${tab === t.id ? 'border-pine-600 text-pine-700' : 'border-transparent text-muted hover:text-ink'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="container-page mt-8" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'itinerary' && <ItineraryView plan={plan} />}
        {tab === 'cost' && <CostBreakdown cost={plan.cost} travellers={travellers} />}
        {tab === 'compare' && <ScenarioCompare plan={plan} request={request} />}
        {tab === 'alternatives' && <Alternatives plan={plan} request={request} />}
      </div>
    </div>
  );
}
