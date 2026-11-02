import { describe, expect, it } from 'vitest';
import { haversineKm, estimateLocalTravelMinutes } from '../src/geo';
import { formatMoney, roundEstimate } from '../src/money';
import { addDays, addMinutesToTime, monthOf, nightsBetween, formatDuration } from '../src/time';
import { estimateTransportOptions, pickPrimaryTransport } from '../src/transport';
import { findOrigin } from '../src/origins';
import { destinationQuerySchema, plannerRequestSchema } from '../src/schemas';

describe('geo', () => {
  it('computes Delhi → Mumbai distance', () => {
    const km = haversineKm({ lat: 28.5562, lng: 77.1 }, { lat: 19.0896, lng: 72.8656 });
    expect(km).toBeGreaterThan(1100);
    expect(km).toBeLessThan(1200);
  });
  it('estimates local travel conservatively', () => {
    expect(estimateLocalTravelMinutes({ lat: 15.5, lng: 73.8 }, { lat: 15.5, lng: 73.8 })).toBe(5);
    const m = estimateLocalTravelMinutes({ lat: 15.55, lng: 73.75 }, { lat: 15.25, lng: 74.0 });
    expect(m).toBeGreaterThan(60);
    expect(m % 5).toBe(0);
  });
});

describe('money', () => {
  it('formats INR with Indian grouping', () => {
    expect(formatMoney(100000)).toBe('₹1,00,000');
    expect(formatMoney(1234567)).toBe('₹12,34,567');
    expect(formatMoney(250000, 'INR', { compact: true })).toBe('₹2.5L');
  });
  it('rounds estimates to sensible steps', () => {
    expect(roundEstimate(1234)).toBe(1250);
    expect(roundEstimate(12345)).toBe(12300);
    expect(roundEstimate(123456)).toBe(123500);
    expect(roundEstimate(87)).toBe(90);
  });
});

describe('time', () => {
  it('counts nights across month and year boundaries', () => {
    expect(nightsBetween('2026-12-29', '2027-01-03')).toBe(5);
    expect(nightsBetween('2028-02-28', '2028-03-01')).toBe(2); // leap year
    expect(() => nightsBetween('2026-13-01', '2026-12-01')).toThrow();
  });
  it('adds days and minutes', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addMinutesToTime('09:45', 90)).toBe('11:15');
    expect(monthOf('2026-12-05')).toBe(12);
    expect(formatDuration(135)).toBe('2h 15m');
    expect(formatDuration(45)).toBe('45 min');
  });
});

describe('transport model', () => {
  const del = findOrigin('DEL')!;
  it('offers flights for international trips and marks them as estimates', () => {
    const opts = estimateTransportOptions({
      origin: del, destination: { lat: -8.74, lng: 115.17, name: 'Bali', international: true }, tier: 'standard', peakSeason: false,
    });
    expect(opts.map((o) => o.mode)).toEqual(['flight']);
    expect(opts[0]!.confidence).toBe('estimate');
    expect(opts[0]!.basis).toMatch(/Not a live fare/);
  });
  it('prefers road for short domestic trips', () => {
    const opts = estimateTransportOptions({
      origin: del, destination: { lat: 26.91, lng: 75.79, name: 'Jaipur', international: false }, tier: 'standard', peakSeason: false,
    });
    expect(pickPrimaryTransport(opts, 'standard')!.mode).toBe('road');
  });
  it('applies a peak season uplift', () => {
    const q = { origin: del, destination: { lat: 15.5, lng: 73.83, name: 'Goa', international: false }, tier: 'standard' as const };
    const off = estimateTransportOptions({ ...q, peakSeason: false }).find((o) => o.mode === 'flight')!;
    const peak = estimateTransportOptions({ ...q, peakSeason: true }).find((o) => o.mode === 'flight')!;
    expect(peak.perTravellerReturn.best).toBeGreaterThan(off.perTravellerReturn.best);
  });
  it('returns nothing for the same city', () => {
    expect(estimateTransportOptions({ origin: del, destination: { lat: 28.6, lng: 77.2, name: 'Delhi', international: false }, tier: 'budget', peakSeason: false })).toEqual([]);
  });
});

describe('plannerRequestSchema', () => {
  const ok = { origin: 'DEL', destination: 'bali', startDate: '2026-12-10', endDate: '2026-12-15', adults: 2 };
  it('applies defaults', () => {
    const r = plannerRequestSchema.parse(ok);
    expect(r.tier).toBe('standard');
    expect(r.children).toBe(0);
  });
  it('rejects return before departure', () => {
    expect(plannerRequestSchema.safeParse({ ...ok, endDate: '2026-12-09' }).success).toBe(false);
  });
  it('rejects overly long trips', () => {
    expect(plannerRequestSchema.safeParse({ ...ok, endDate: '2027-02-15' }).success).toBe(false);
  });
});

describe('regressions', () => {
  it('rejects impossible calendar dates instead of rolling them over', () => {
    expect(() => nightsBetween('2026-02-27', '2026-02-30')).toThrow();
    expect(() => nightsBetween('2027-02-29', '2027-03-02')).toThrow(); // not a leap year
    expect(nightsBetween('2028-02-29', '2028-03-02')).toBe(2);
  });
  it('treats the string "false" as false', () => {
    const base = { origin: 'DEL', startDate: '2026-12-01', endDate: '2026-12-03', adults: 1 };
    expect(plannerRequestSchema.parse({ ...base, includeInsurance: 'false' }).includeInsurance).toBe(false);
    expect(plannerRequestSchema.parse({ ...base, includeInsurance: false }).includeInsurance).toBe(false);
    expect(plannerRequestSchema.parse(base).includeInsurance).toBe(true);
    expect(plannerRequestSchema.safeParse({ ...base, includeInsurance: 'maybe' }).success).toBe(false);
  });
});

describe('destinationQuerySchema', () => {
  it('parses weekend flags correctly', () => {
    expect(destinationQuerySchema.parse({ weekend: 'false' }).weekend).toBe(false);
    expect(destinationQuerySchema.parse({ weekend: 'true' }).weekend).toBe(true);
    expect(destinationQuerySchema.parse({}).weekend).toBeUndefined();
  });
});
