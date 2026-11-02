import { Link } from 'react-router-dom';
import type { PlanResult, PlannerRequestInput } from '@trippilot/shared';
import { inr } from '../../lib/format';
import { planToSearchParams } from '../../lib/plan-params';
import { Postcard } from '../Postcard';
import { EmptyState } from '../ui/States';

export function Alternatives({ plan, request }: { plan: PlanResult; request: PlannerRequestInput }) {
  if (plan.alternatives.length === 0)
    return <EmptyState title="No close alternatives" body="Try adding more interests or extending your dates to see similar destinations." />;
  const diff = (total: number) => total - plan.cost.total;
  return (
    <div>
      <p className="mb-5 text-sm text-muted">Same dates, travellers and comfort level — estimated with typical sights for each destination.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plan.alternatives.map((a) => {
          const d = diff(a.total);
          return (
            <article key={a.destination.slug} className="card flex flex-col overflow-hidden">
              <Postcard scene={a.destination.scene} palette={a.destination.palette} imageUrl={a.destination.imageUrl} alt={a.destination.name} className="aspect-[16/9] w-full" />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="display text-lg">{a.destination.name}</h3>
                  <span className="text-sm">{a.destination.country.flag}</span>
                </div>
                <p className="text-xs text-muted">{a.reason}</p>
                <div className="mt-3 text-xl font-semibold tabular">{inr(a.total)}</div>
                <div className={`text-xs font-medium tabular ${d < 0 ? 'text-pine-600' : 'text-coral'}`}>
                  {d < 0 ? `${inr(-d)} cheaper` : `${inr(d)} more`} than {plan.destination.name}
                </div>
                {a.withinBudget !== null && (
                  <span className={`mt-2 w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.withinBudget ? 'bg-pine-50 text-pine-700' : 'bg-coral/10 text-coral'}`}>
                    {a.withinBudget ? 'Fits your budget' : 'Over budget'}
                  </span>
                )}
                <Link to={`/plan/results?${planToSearchParams({ ...request, destination: a.destination.slug })}`} className="mt-auto pt-4 text-sm font-semibold text-pine-700 hover:underline">
                  Plan this instead →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
