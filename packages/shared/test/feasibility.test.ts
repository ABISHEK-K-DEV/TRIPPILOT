import { describe, expect, it } from 'vitest';
import { checkItineraryFeasibility } from '../src/feasibility';
import type { ItineraryDay, ItineraryStop } from '../src/types';

const stop = (p: Partial<ItineraryStop>): ItineraryStop => ({
  id: Math.random().toString(36), kind: 'attraction', title: 'Stop', startTime: '09:00',
  durationMinutes: 60, travelMinutesFromPrevious: 0, costPerPerson: 0, confidence: 'sample', ...p,
});
const day = (stops: ItineraryStop[]): ItineraryDay => ({
  dayNumber: 1, date: '2026-12-01', title: 'Day', stops, totalActivityMinutes: 0, totalTravelMinutes: 0, notes: [],
});

describe('checkItineraryFeasibility', () => {
  it('accepts a realistic day', () => {
    const d = day([
      stop({ startTime: '09:00', durationMinutes: 120 }),
      stop({ startTime: '11:30', durationMinutes: 90, travelMinutesFromPrevious: 30 }),
    ]);
    expect(checkItineraryFeasibility([d], 'balanced')).toEqual([]);
  });

  it('detects stops you cannot reach in time', () => {
    const d = day([
      stop({ startTime: '09:00', durationMinutes: 120 }),
      stop({ title: 'Fort', startTime: '11:10', travelMinutesFromPrevious: 30 }),
    ]);
    const issues = checkItineraryFeasibility([d], 'balanced');
    expect(issues).toHaveLength(1);
    expect(issues[0]!.severity).toBe('error');
    expect(issues[0]!.message).toContain('Fort');
  });

  it('warns about very long legs and overloaded days', () => {
    const d = day([
      stop({ startTime: '08:00', durationMinutes: 240 }),
      stop({ startTime: '15:00', durationMinutes: 240, travelMinutesFromPrevious: 180 }),
    ]);
    const msgs = checkItineraryFeasibility([d], 'relaxed').map((i) => i.message).join(' ');
    expect(msgs).toMatch(/takes about 3h/);
    expect(msgs).toMatch(/more than a relaxed pace/);
  });

  it('warns about late finishes', () => {
    const d = day([stop({ startTime: '21:30', durationMinutes: 90 })]);
    expect(checkItineraryFeasibility([d], 'packed')[0]!.message).toMatch(/late/);
  });
});
