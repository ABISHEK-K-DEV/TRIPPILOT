import type { PlannerRequestInput } from '@trippilot/shared';

/**
 * Plans are addressed by URL so results can be refreshed, bookmarked and shared.
 */
export function planToSearchParams(p: PlannerRequestInput): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set('from', p.origin);
  if (p.destination) sp.set('to', p.destination);
  if (p.region && p.region !== 'any') sp.set('region', p.region);
  sp.set('start', p.startDate);
  sp.set('end', p.endDate);
  sp.set('adults', String(p.adults));
  if (p.children) sp.set('children', String(p.children));
  if (p.budget) sp.set('budget', String(p.budget));
  if (p.tier) sp.set('tier', p.tier);
  if (p.pace) sp.set('pace', p.pace);
  if (p.interests?.length) sp.set('interests', p.interests.join(','));
  if (p.includeInsurance === false) sp.set('insurance', '0');
  return sp;
}

export function searchParamsToPlan(sp: URLSearchParams): PlannerRequestInput | null {
  const origin = sp.get('from');
  const startDate = sp.get('start');
  const endDate = sp.get('end');
  if (!origin || !startDate || !endDate) return null;
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  return {
    origin,
    destination: sp.get('to') ?? undefined,
    region: (sp.get('region') as PlannerRequestInput['region']) ?? 'any',
    startDate,
    endDate,
    adults: num('adults') ?? 2,
    children: num('children') ?? 0,
    budget: num('budget'),
    tier: (sp.get('tier') as PlannerRequestInput['tier']) ?? 'standard',
    pace: (sp.get('pace') as PlannerRequestInput['pace']) ?? 'balanced',
    interests: sp.get('interests')?.split(',').filter(Boolean) ?? [],
    includeInsurance: sp.get('insurance') !== '0',
  };
}

/** Default dates: a 5-night trip starting ~6 weeks from today. */
export function defaultDates(today = new Date()): { startDate: string; endDate: string } {
  const start = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 42));
  const end = new Date(start.getTime() + 5 * 86_400_000);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}
