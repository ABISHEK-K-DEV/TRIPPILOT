import { describe, expect, it } from 'vitest';
import { calculateTripCost, roomsNeeded, assessBudget, type TripCostInput } from '../src/cost-engine';
import type { DestinationCostProfile, TransportEstimate } from '../src/types';

const profile: DestinationCostProfile = {
  hotelPerNight: { budget: 1000, standard: 4000, premium: 12000 },
  foodPerPersonPerDay: { budget: 500, standard: 1200, premium: 3000 },
  localTransportPerPersonPerDay: { budget: 200, standard: 600, premium: 1500 },
  hotelTaxRate: 0.1,
  visaFeePerPerson: 3000,
  visaNote: 'Visa on arrival.',
  insurancePerPersonPerDay: 100,
};

const transport: TransportEstimate = {
  mode: 'flight', label: 'Direct economy flight', distanceKm: 2000, durationMinutes: 300,
  perTravellerReturn: { best: 20000, low: 16000, high: 28000 }, stops: 0,
  confidence: 'estimate', source: 'model', basis: 'test',
};

const base: TripCostInput = {
  adults: 2, children: 0, nights: 4, tier: 'standard', profile,
  profileConfidence: 'sample', profileSource: 'sample', transport,
  activities: [
    { id: 'a', name: 'Temple', pricePerPerson: 500, confidence: 'sample' },
    { id: 'b', name: 'Park', pricePerPerson: 0, confidence: 'sample' },
  ],
  international: true, includeInsurance: true, budget: 100000,
};

const get = (r: ReturnType<typeof calculateTripCost>, id: string) => r.items.find((i) => i.id === id);

describe('roomsNeeded', () => {
  it('puts two adults per room', () => {
    expect(roomsNeeded(1, 0)).toBe(1);
    expect(roomsNeeded(2, 0)).toBe(1);
    expect(roomsNeeded(3, 0)).toBe(2);
  });
  it('lets one child share each room and adds rooms for extra children', () => {
    expect(roomsNeeded(2, 1)).toBe(1);
    expect(roomsNeeded(2, 2)).toBe(2);
    expect(roomsNeeded(2, 3)).toBe(2);
    expect(roomsNeeded(4, 2)).toBe(2);
  });
});

describe('calculateTripCost', () => {
  const r = calculateTripCost(base);

  it('itemises every core category', () => {
    expect(get(r, 'transport')!.amount).toBe(40000);
    expect(get(r, 'accommodation')!.amount).toBe(16000); // 4000 × 1 room × 4 nights
    expect(get(r, 'hotel_tax')!.amount).toBe(1600);
    expect(get(r, 'local_transport')!.amount).toBe(6000); // 600 × 2 × 5 days
    expect(get(r, 'food')!.amount).toBe(12000); // 1200 × 2 × 5
    expect(get(r, 'activities')!.amount).toBe(1000); // 500 × 2 (free item ignored)
    expect(get(r, 'visa')!.amount).toBe(6000);
    expect(get(r, 'insurance')!.amount).toBe(1000); // 100 × 2 × 5
    expect(get(r, 'booking_fees')!.amount).toBe(1100); // 2% of 56,000 = 1,120 → rounded
  });

  it('totals only core items and excludes optional extras', () => {
    const core = r.items.filter((i) => !i.optional).reduce((s, i) => s + i.amount, 0);
    expect(r.total).toBe(core);
    expect(r.total).toBe(84700);
    expect(r.optionalTotal).toBeGreaterThan(0);
    expect(r.items.filter((i) => i.optional).map((i) => i.id)).toEqual(['contingency', 'shopping', 'connectivity']);
  });

  it('computes per-traveller cost and a sensible range', () => {
    expect(r.perTraveller).toBe(42350);
    expect(r.range.low).toBeLessThan(r.total);
    expect(r.range.high).toBeGreaterThan(r.total);
  });

  it('never labels anything verified when inputs are estimates or sample data', () => {
    expect(r.confidenceSummary.verified).toBe(0);
    expect(r.confidenceSummary.estimate + r.confidenceSummary.sample).toBe(r.total);
    expect(r.items.every((i) => i.confidence !== 'verified')).toBe(true);
  });

  it('category totals add up to all items', () => {
    const sum = Object.values(r.byCategory).reduce((s, v) => s + v, 0);
    expect(sum).toBe(r.total + r.optionalTotal);
  });

  it('omits visa and roaming for domestic trips and insurance when not wanted', () => {
    const d = calculateTripCost({ ...base, international: false, includeInsurance: false });
    expect(get(d, 'visa')).toBeUndefined();
    expect(get(d, 'insurance')).toBeUndefined();
    expect(get(d, 'connectivity')).toBeUndefined();
  });

  it('applies child factors', () => {
    const c = calculateTripCost({ ...base, children: 1 });
    expect(get(c, 'food')!.amount).toBe(15600); // 1200 × 2.6 × 5
    expect(get(c, 'transport')!.amount).toBe(60000); // children pay full fare
  });

  it('handles trips without inter-city transport', () => {
    const c = calculateTripCost({ ...base, transport: null });
    expect(get(c, 'transport')).toBeUndefined();
    expect(c.total).toBeGreaterThan(0);
  });

  it('rejects invalid traveller counts', () => {
    expect(() => calculateTripCost({ ...base, adults: 0 })).toThrow();
  });
});

describe('assessBudget', () => {
  it('flags over-budget trips', () => {
    const b = assessBudget(120000, 140000, 100000, { transport: 20000 });
    expect(b.status).toBe('over');
    expect(b.difference).toBe(-20000);
    expect(b.warnings[0]).toMatch(/20%/);
  });
  it('flags tight budgets when the upper estimate exceeds it', () => {
    expect(assessBudget(80000, 105000, 100000, { transport: 0 }).status).toBe('tight');
    expect(assessBudget(95000, 99000, 100000, { transport: 0 }).status).toBe('tight');
  });
  it('is within budget with headroom', () => {
    expect(assessBudget(60000, 80000, 100000, { transport: 0 }).status).toBe('within');
  });
  it('warns when transport dominates', () => {
    const b = assessBudget(60000, 80000, 100000, { transport: 55000 });
    expect(b.warnings.some((w) => /more than half/.test(w))).toBe(true);
  });
  it('handles missing budget', () => {
    expect(assessBudget(60000, 80000, null, { transport: 0 }).status).toBe('no_budget');
  });
});
