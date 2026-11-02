import { describe, expect, it } from 'vitest';
import { convenienceScore, rankScenarios, valueScore } from '../src/scenarios';

describe('rankScenarios', () => {
  const flight = (stops: number, durationMinutes: number) => ({ stops, durationMinutes });
  const r = rankScenarios([
    { id: 'budget', tier: 'budget', total: 60000, transport: flight(1, 600) },
    { id: 'standard', tier: 'standard', total: 85000, transport: flight(0, 360) },
    { id: 'premium', tier: 'premium', total: 170000, transport: flight(0, 360) },
  ]);

  it('picks the cheapest by total', () => expect(r.cheapest).toBe('budget'));
  it('picks the most convenient by journey and local transport', () => expect(r.mostConvenient).toBe('premium'));
  it('picks a balanced option as best value', () => expect(r.bestValue).toBe('standard'));

  it('breaks convenience ties with price', () => {
    const t = rankScenarios([
      { id: 'a', tier: 'standard', total: 90000, transport: flight(0, 300) },
      { id: 'b', tier: 'standard', total: 80000, transport: flight(0, 300) },
    ]);
    expect(t.mostConvenient).toBe('b');
  });

  it('throws on empty input', () => expect(() => rankScenarios([])).toThrow());
});

describe('scores', () => {
  it('penalises connections and long journeys', () => {
    const direct = convenienceScore({ id: 'x', tier: 'standard', total: 1, transport: { stops: 0, durationMinutes: 240 } });
    const oneStop = convenienceScore({ id: 'y', tier: 'standard', total: 1, transport: { stops: 1, durationMinutes: 480 } });
    expect(direct).toBeGreaterThan(oneStop);
  });
  it('value falls as cost rises for equal quality', () => {
    expect(valueScore(7, 50000)).toBeGreaterThan(valueScore(7, 100000));
  });
});
