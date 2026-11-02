import { haversineKm } from './geo';
import { roundEstimate } from './money';
import type { ComfortTier, Coordinates, TransportEstimate } from './types';

export interface TransportQuery {
  origin: Coordinates & { code: string; city: string };
  destination: Coordinates & { name: string; international: boolean };
  tier: ComfortTier;
  /** Whether travel dates fall in the destination's peak season. */
  peakSeason: boolean;
}

const SOURCE = 'TripPilot distance-based fare model';

/**
 * Model-based transport estimates. These are NOT live fares: they exist so the
 * cost engine can show a realistic order of magnitude until authorised flight
 * and rail providers are connected (Milestone 3).
 */
export function estimateTransportOptions(q: TransportQuery): TransportEstimate[] {
  const km = Math.round(haversineKm(q.origin, q.destination));
  const options: TransportEstimate[] = [];
  const seasonFactor = q.peakSeason ? 1.2 : 1;

  if (km < 40) return options; // same metro area — covered by local transport

  if (q.destination.international || km >= 300) {
    const base = q.destination.international ? 4000 + 3.0 * km : 2200 + 3.2 * km;
    const tierFactor = { budget: 0.88, standard: 1, premium: 1.18 }[q.tier];
    // Routing assumption: long-haul budget/standard fares usually connect; premium buys the fastest routing.
    const stops = km > 4000 ? (q.tier === 'premium' ? 0 : 1) : q.tier === 'budget' && km > 1500 ? 1 : 0;
    const oneWay = base * tierFactor * seasonFactor;
    const flyingMinutes = (km / 750) * 60;
    const duration = Math.round(90 + flyingMinutes + 45 + stops * 150);
    options.push({
      mode: 'flight',
      label: stops ? 'Economy flight · 1 stop' : 'Economy flight · fastest routing',
      distanceKm: km,
      durationMinutes: duration,
      perTravellerReturn: {
        best: roundEstimate(oneWay * 2),
        low: roundEstimate(oneWay * 2 * 0.78),
        high: roundEstimate(oneWay * 2 * 1.4),
      },
      stops,
      confidence: 'estimate',
      source: SOURCE,
      basis: `${km.toLocaleString('en-IN')} km great-circle distance, ${stops ? 'assumes one connection' : 'assumes non-stop or the fastest routing'}, economy, taxes included${q.peakSeason ? ', peak-season uplift' : ''}. Not a live fare.`,
    });
  }

  if (!q.destination.international && km <= 1600) {
    const perKm = { budget: 0.75, standard: 1.7, premium: 2.9 }[q.tier];
    const oneWay = (150 + perKm * km * 1.25) * seasonFactor;
    const duration = Math.round(((km * 1.3) / 55) * 60 + 60);
    const cls = { budget: 'Sleeper class', standard: 'AC 3-tier', premium: 'AC 2-tier' }[q.tier];
    options.push({
      mode: 'train',
      label: `Train · ${cls}`,
      distanceKm: km,
      durationMinutes: duration,
      perTravellerReturn: {
        best: roundEstimate(oneWay * 2),
        low: roundEstimate(oneWay * 2 * 0.85),
        high: roundEstimate(oneWay * 2 * 1.3),
      },
      stops: 0,
      confidence: 'estimate',
      source: SOURCE,
      basis: `${cls} fare modelled on ~${Math.round(km * 1.25).toLocaleString('en-IN')} km rail distance. Availability not checked.`,
    });
  }

  if (!q.destination.international && km <= 650) {
    const perKm = { budget: 1.9, standard: 4.5, premium: 8 }[q.tier]; // per traveller (bus → shared cab → private cab)
    const oneWay = (perKm * km * 1.3) * seasonFactor;
    const mode = { budget: 'Intercity bus', standard: 'Shared / sedan cab (per person)', premium: 'Private cab (per person, 2 sharing)' }[q.tier];
    options.push({
      mode: 'road',
      label: mode,
      distanceKm: km,
      durationMinutes: Math.round(((km * 1.3) / 45) * 60 + 30),
      perTravellerReturn: {
        best: roundEstimate(oneWay * 2),
        low: roundEstimate(oneWay * 2 * 0.8),
        high: roundEstimate(oneWay * 2 * 1.35),
      },
      stops: 0,
      confidence: 'estimate',
      source: SOURCE,
      basis: `~${Math.round(km * 1.3).toLocaleString('en-IN')} km by road.`,
    });
  }

  return options;
}

/** Choose the most sensible primary mode for a tier. */
export function pickPrimaryTransport(options: TransportEstimate[], tier: ComfortTier): TransportEstimate | null {
  if (options.length === 0) return null;
  const flight = options.find((o) => o.mode === 'flight');
  const train = options.find((o) => o.mode === 'train');
  const road = options.find((o) => o.mode === 'road');

  if (road && road.distanceKm <= 300) return road;
  if (!train) return flight ?? road ?? null;
  if (!flight) return train;
  // Overnight-able trains are a good budget choice; otherwise fly.
  if (tier === 'budget' && train.durationMinutes <= 16 * 60) return train;
  if (tier === 'standard' && train.durationMinutes <= 9 * 60) return train;
  return flight;
}
