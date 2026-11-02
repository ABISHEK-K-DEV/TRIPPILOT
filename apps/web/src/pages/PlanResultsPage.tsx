import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMe, usePlan, useSaveTrip } from '../lib/queries';
import { planToSearchParams, searchParamsToPlan } from '../lib/plan-params';
import { PlanView } from '../components/plan/PlanView';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States';
import { Spinner } from '../components/ui/Spinner';

function PlanSkeleton() {
  return (
    <div className="container-page pt-10" aria-busy="true" aria-label="Building your plan">
      <div className="flex items-center gap-3 text-pine-700"><Spinner /><span className="font-medium">Building your plan — matching sights, timing each day and pricing every line…</span></div>
      <Skeleton className="mt-6 h-12 w-2/3" />
      <div className="mt-6 grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_380px]"><Skeleton className="h-96" /><Skeleton className="h-72" /></div>
    </div>
  );
}

export function PlanResultsPage() {
  const [sp] = useSearchParams();
  const request = useMemo(() => searchParamsToPlan(sp), [sp]);
  const { data: plan, isLoading, isError, error, refetch } = usePlan(request);
  const { data: me } = useMe();
  const save = useSaveTrip();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  if (!request)
    return (
      <div className="container-page pt-16">
        <EmptyState title="No trip details yet" body="Start with the planner to generate an itinerary and cost breakdown." action={<ButtonLink to="/plan">Open the planner</ButtonLink>} />
      </div>
    );
  if (isLoading) return <PlanSkeleton />;
  if (isError || !plan)
    return (
      <div className="container-page pt-16">
        <ErrorState error={error} onRetry={() => refetch()} title="We couldn’t build this plan" />
        <div className="mt-4 text-center"><Link to={`/plan?${sp}`} className="text-sm font-semibold text-pine-700 hover:underline">← Edit trip details</Link></div>
      </div>
    );

  const resolvedRequest = { ...request, destination: plan.destination.slug };
  const share = async () => {
    const url = `${window.location.origin}/plan/results?${planToSearchParams(resolvedRequest)}`;
    try {
      if (navigator.share) await navigator.share({ title: `TripPilot · ${plan.destination.name}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* user cancelled */ }
  };

  const onSave = () => {
    if (!me) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    save.mutate({ request: resolvedRequest }, { onSuccess: ({ trip }) => navigate(`/trips/${trip.id}`) });
  };

  return (
    <PlanView
      plan={plan}
      request={resolvedRequest}
      banner={save.isError ? <div className="mb-4 rounded-xl bg-coral/10 px-4 py-2 text-sm text-coral" role="alert">Couldn’t save: {(save.error as Error).message}</div> : null}
      actions={
        <>
          <ButtonLink to={`/plan?${planToSearchParams(resolvedRequest)}`} variant="secondary">Edit</ButtonLink>
          <Button variant="secondary" onClick={share}>{copied ? 'Link copied ✓' : 'Share'}</Button>
          <Button onClick={onSave} loading={save.isPending}>{me ? 'Save trip' : 'Sign in to save'}</Button>
        </>
      }
    />
  );
}
