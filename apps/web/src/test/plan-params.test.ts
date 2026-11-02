import { describe, expect, it } from 'vitest';
import { defaultDates, planToSearchParams, searchParamsToPlan } from '../lib/plan-params';

describe('plan URL params', () => {
  it('round-trips a planner request', () => {
    const req = {
      origin: 'BLR', destination: 'goa', region: 'any' as const, startDate: '2026-12-10', endDate: '2026-12-14',
      adults: 2, children: 1, budget: 60000, tier: 'budget' as const, pace: 'relaxed' as const,
      interests: ['beach', 'food'], includeInsurance: false,
    };
    expect(searchParamsToPlan(planToSearchParams(req))).toEqual(req);
  });
  it('returns null when required fields are missing', () => {
    expect(searchParamsToPlan(new URLSearchParams('from=DEL'))).toBeNull();
  });
  it('defaults to a 5-night trip six weeks out', () => {
    const { startDate, endDate } = defaultDates(new Date('2026-11-02T10:00:00Z'));
    expect(startDate).toBe('2026-12-14');
    expect(endDate).toBe('2026-12-19');
  });
});
