import { useState } from 'react';
import type { CostCategory, CostLineItem, TripCostBreakdown } from '@trippilot/shared';
import { inr } from '../../lib/format';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';

export const CATEGORY_META: Record<CostCategory, { label: string; color: string; icon: string }> = {
  transport: { label: 'Getting there', color: '#174A3B', icon: '✈️' },
  accommodation: { label: 'Accommodation', color: '#2E7D63', icon: '🏨' },
  local_transport: { label: 'Local transport', color: '#6FA98F', icon: '🛺' },
  food: { label: 'Food & drinks', color: '#E0A33A', icon: '🍛' },
  activities: { label: 'Activities & tickets', color: '#D9614A', icon: '🎟️' },
  visa: { label: 'Visa & entry', color: '#4C3D99', icon: '🛂' },
  insurance: { label: 'Insurance', color: '#2563C9', icon: '🛡️' },
  taxes_fees: { label: 'Taxes & fees', color: '#8A8F8C', icon: '🧾' },
  optional: { label: 'Optional', color: '#CFC8B8', icon: '➕' },
};

export function CategoryBar({ cost }: { cost: TripCostBreakdown }) {
  const cats = (Object.keys(cost.byCategory) as CostCategory[]).filter((c) => c !== 'optional' && cost.byCategory[c] > 0);
  return (
    <div>
      <div className="flex h-3.5 overflow-hidden rounded-full bg-sand" role="img" aria-label="Cost split by category">
        {cats.map((c) => (
          <div key={c} style={{ width: `${(cost.byCategory[c] / cost.total) * 100}%`, background: CATEGORY_META[c].color }} title={`${CATEGORY_META[c].label}: ${inr(cost.byCategory[c])}`} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-y-1.5 text-sm">
        {cats.map((c) => (
          <li key={c} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: CATEGORY_META[c].color }} aria-hidden />
            <span className="truncate text-muted">{CATEGORY_META[c].label}</span>
            <span className="ml-auto whitespace-nowrap font-medium tabular">
              {Math.round((cost.byCategory[c] / cost.total) * 100)}%<span className="ml-2 inline-block w-20 text-right font-normal text-muted">{inr(cost.byCategory[c])}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ item }: { item: CostLineItem }) {
  const [open, setOpen] = useState(false);
  const meta = CATEGORY_META[item.category];
  return (
    <li className="border-t border-line first:border-t-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 py-3.5 text-left hover:bg-sand/40 sm:px-2">
        <span className="text-lg" aria-hidden>{meta.icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium">{item.label}</span>
          <span className="block text-xs text-muted">{meta.label}</span>
        </span>
        <ConfidenceBadge confidence={item.confidence} compact />
        <span className="w-28 text-right">
          <span className="block font-semibold tabular">{inr(item.amount)}</span>
          {item.range.low !== item.range.high && (
            <span className="block text-[11px] text-muted tabular">{inr(item.range.low)}–{inr(item.range.high)}</span>
          )}
        </span>
        <svg viewBox="0 0 20 20" className={`size-4 text-muted transition ${open ? 'rotate-180' : ''}`} aria-hidden><path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
      </button>
      {open && (
        <div className="mb-3 ml-10 rounded-xl bg-sand/70 px-4 py-3 text-sm text-ink-soft sm:ml-12">
          <p>{item.basis}</p>
          <p className="mt-1 text-xs text-muted">Source: {item.source}</p>
        </div>
      )}
    </li>
  );
}

export function CostBreakdown({ cost, travellers }: { cost: TripCostBreakdown; travellers: number }) {
  const core = cost.items.filter((i) => !i.optional);
  const optional = cost.items.filter((i) => i.optional);
  const estPct = Math.round(((cost.confidenceSummary.estimate + cost.confidenceSummary.sample) / Math.max(cost.total, 1)) * 100);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="display text-xl">Complete trip cost</h3>
          <span className="text-xs text-muted">Tap a row to see how it’s calculated</span>
        </div>
        <ul className="mt-4">{core.map((i) => <Row key={i.id} item={i} />)}</ul>
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-pine-700 px-5 py-4 text-white">
          <div>
            <div className="text-sm text-pine-100">Estimated total · {travellers} traveller{travellers > 1 ? 's' : ''}</div>
            <div className="text-xs text-pine-200 tabular">Likely range {inr(cost.range.low)} – {inr(cost.range.high)}</div>
          </div>
          <div className="text-right">
            <div className="display text-2xl tabular">{inr(cost.total)}</div>
            <div className="text-xs text-pine-100 tabular">{inr(cost.perTraveller)} per traveller</div>
          </div>
        </div>
        {optional.length > 0 && (
          <>
            <h4 className="mt-8 font-semibold">Optional & often-forgotten costs</h4>
            <p className="text-sm text-muted">Not included in the total above.</p>
            <ul className="mt-2">{optional.map((i) => <Row key={i.id} item={i} />)}</ul>
          </>
        )}
      </div>
      <aside className="space-y-4">
        <div className="card p-5">
          <h4 className="font-semibold">Where the money goes</h4>
          <div className="mt-4"><CategoryBar cost={cost} /></div>
        </div>
        <div className="card p-5">
          <h4 className="font-semibold">How reliable is this?</h4>
          <div className="mt-3 flex items-end gap-2">
            <span className="display text-3xl tabular">{100 - estPct}%</span>
            <span className="pb-1 text-sm text-muted">of the total is verified</span>
          </div>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-sand">
            <div className="bg-pine-500" style={{ width: `${(cost.confidenceSummary.verified / Math.max(cost.total, 1)) * 100}%` }} />
            <div className="bg-amber-ink/70" style={{ width: `${(cost.confidenceSummary.estimate / Math.max(cost.total, 1)) * 100}%` }} />
            <div className="bg-violet-ink/60" style={{ width: `${(cost.confidenceSummary.sample / Math.max(cost.total, 1)) * 100}%` }} />
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            <li className="flex justify-between"><span className="text-muted">Verified</span><span className="tabular">{inr(cost.confidenceSummary.verified)}</span></li>
            <li className="flex justify-between"><span className="text-amber-ink">Estimates</span><span className="tabular">{inr(cost.confidenceSummary.estimate)}</span></li>
            <li className="flex justify-between"><span className="text-violet-ink">Sample data</span><span className="tabular">{inr(cost.confidenceSummary.sample)}</span></li>
          </ul>
          <p className="mt-3 text-xs text-muted">Live provider prices will replace estimates as integrations launch. We never present an estimate as a confirmed price.</p>
        </div>
      </aside>
    </div>
  );
}
