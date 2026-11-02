import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDeleteTrip, useMe, useTrip, useTrips } from '../lib/queries';
import { formatDateRange, inr } from '../lib/format';
import { PlanView } from '../components/plan/PlanView';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States';
import { ApiRequestError } from '../lib/api';
import { NotFoundPage } from './NotFoundPage';
import { planToSearchParams } from '../lib/plan-params';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const location = useLocation();
  if (isLoading) return <div className="container-page pt-10"><Skeleton className="h-40" /></div>;
  if (!me) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}

function TripsList() {
  const { data: trips, isLoading, isError, error, refetch } = useTrips(true);
  const del = useDeleteTrip();
  return (
    <div className="container-page pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">My trips</span>
          <h1 className="display mt-3 text-4xl">Saved plans</h1>
        </div>
        <ButtonLink to="/plan">+ Plan a new trip</ButtonLink>
      </div>
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : trips!.length === 0 ? (
          <EmptyState icon="🧳" title="No saved trips yet" body="Build a plan and tap “Save trip” to keep it here." action={<ButtonLink to="/plan">Start planning</ButtonLink>} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {trips!.map((t) => (
              <li key={t.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/trips/${t.id}`} className="display text-xl hover:text-pine-700">{t.title}</Link>
                    <div className="mt-1 text-sm text-muted">{formatDateRange(t.startDate, t.endDate)} · {t.travellers} traveller{t.travellers > 1 ? 's' : ''}</div>
                  </div>
                  <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{t.status.toLowerCase()}</span>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                  <div>
                    <div className="text-xs text-muted">Estimated total</div>
                    <div className="text-lg font-semibold tabular">{inr(t.estimatedTotal)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" loading={del.isPending && del.variables === t.id} onClick={() => confirm(`Delete “${t.title}”?`) && del.mutate(t.id)}>Delete</Button>
                    <ButtonLink to={`/trips/${t.id}`} size="sm" variant="secondary">Open</ButtonLink>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TripDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useTrip(id);
  const navigate = useNavigate();
  if (isLoading) return <div className="container-page pt-10"><Skeleton className="h-64" /></div>;
  if (isError && error instanceof ApiRequestError && error.status === 404) return <NotFoundPage what="trip" />;
  if (isError || !data) return <div className="container-page pt-10"><ErrorState error={error} onRetry={() => refetch()} /></div>;
  const saved = new Date(data.plan.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <PlanView
      plan={data.plan}
      request={data.request}
      banner={
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white/80 px-4 py-2.5 text-sm">
          <Link to="/trips" className="font-medium text-pine-700 hover:underline">← My trips</Link>
          <span className="text-muted">Saved snapshot from {saved}. Prices may have changed since.</span>
        </div>
      }
      actions={<Button variant="secondary" onClick={() => navigate(`/plan/results?${planToSearchParams(data.request)}`)}>Refresh estimates</Button>}
    />
  );
}

export const TripsPage = () => <RequireAuth><TripsList /></RequireAuth>;
export const TripDetailPage = () => <RequireAuth><TripDetail /></RequireAuth>;
