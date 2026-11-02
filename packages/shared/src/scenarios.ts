import type { ComfortTier, TransportEstimate } from './types';

export interface ScenarioScoreInput {
  id: string;
  total: number;
  tier: ComfortTier;
  transport: Pick<TransportEstimate, 'durationMinutes' | 'stops'> | null;
}

export interface ScenarioScores {
  id: string;
  comfortScore: number; // 0–10
  convenienceScore: number; // 0–10
  valueScore: number; // quality ÷ cost^0.75
}

export interface ScenarioRanking {
  cheapest: string;
  bestValue: string;
  mostConvenient: string;
  scores: ScenarioScores[];
}

const COMFORT_BY_TIER: Record<ComfortTier, number> = { budget: 4, standard: 7, premium: 9.5 };
const LOCAL_CONVENIENCE_BY_TIER: Record<ComfortTier, number> = { budget: 3, standard: 6.5, premium: 9 };

/**
 * Convenience: shorter door-to-door journeys, fewer connections and easier
 * local transport score higher. Purely rule-based and transparent.
 */
export function convenienceScore(s: ScenarioScoreInput): number {
  const local = LOCAL_CONVENIENCE_BY_TIER[s.tier];
  if (!s.transport) return round1(local);
  const hours = s.transport.durationMinutes / 60;
  const journey = Math.max(0, 10 - hours * 0.55 - s.transport.stops * 2);
  return round1(journey * 0.6 + local * 0.4);
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Value = quality ÷ cost^0.75 (cost in ₹10,000 units). The sub-linear exponent
 * means a pricier option can still win if it is meaningfully better.
 */
export function valueScore(quality: number, total: number): number {
  return Math.round((quality / Math.pow(Math.max(total, 1) / 10000, 0.75)) * 100) / 100;
}

export function rankScenarios(scenarios: ScenarioScoreInput[]): ScenarioRanking {
  if (scenarios.length === 0) throw new Error('No scenarios to rank');
  const scores: ScenarioScores[] = scenarios.map((s) => {
    const comfort = COMFORT_BY_TIER[s.tier];
    const convenience = convenienceScore(s);
    const quality = comfort * 0.6 + convenience * 0.4;
    return { id: s.id, comfortScore: comfort, convenienceScore: convenience, valueScore: valueScore(quality, s.total) };
  });
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const cheapest = [...scenarios].sort((a, b) => a.total - b.total)[0]!.id;
  const mostConvenient = [...scores].sort(
    (a, b) => b.convenienceScore - a.convenienceScore || byId.get(a.id)!.total - byId.get(b.id)!.total,
  )[0]!.id;
  const bestValue = [...scores].sort((a, b) => b.valueScore - a.valueScore)[0]!.id;
  return { cheapest, bestValue, mostConvenient, scores };
}
