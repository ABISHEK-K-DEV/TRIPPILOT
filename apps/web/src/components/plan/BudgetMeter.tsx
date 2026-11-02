import type { BudgetAssessment } from '@trippilot/shared';
import { inr } from '../../lib/format';

const STATUS = {
  within: { label: 'Within budget', bar: 'bg-pine-500', text: 'text-pine-700', bg: 'bg-pine-50' },
  tight: { label: 'Tight budget', bar: 'bg-amber-ink', text: 'text-amber-ink', bg: 'bg-amber-soft' },
  over: { label: 'Over budget', bar: 'bg-coral', text: 'text-coral', bg: 'bg-coral/10' },
  no_budget: { label: 'No budget set', bar: 'bg-sand-deep', text: 'text-muted', bg: 'bg-sand' },
} as const;

export function BudgetMeter({ budget }: { budget: BudgetAssessment }) {
  const s = STATUS[budget.status];
  if (budget.status === 'no_budget') {
    return (
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Budget</div>
        <div className="mt-1 text-lg font-semibold">Not set</div>
        <p className="text-xs text-muted">Add a budget to get warnings and cheaper alternatives.</p>
      </div>
    );
  }
  const pct = Math.min(100, (budget.utilisation ?? 0) * 100);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Budget {inr(budget.budget!)}</div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
      </div>
      <div className={`mt-1 text-lg font-semibold tabular ${s.text}`}>
        {budget.difference! >= 0 ? `${inr(budget.difference!)} left` : `${inr(-budget.difference!)} over`}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Budget used">
        <div className={`h-full rounded-full ${s.bar} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
