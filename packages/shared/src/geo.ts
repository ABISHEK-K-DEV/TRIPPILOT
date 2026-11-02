import type { Coordinates } from './types';

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Conservative in-city travel time between two points.
 * Straight-line distance is inflated by a road-winding factor and divided by a
 * realistic urban average speed, plus a fixed buffer for parking / waiting.
 * Deliberately pessimistic so generated schedules stay achievable.
 */
export function estimateLocalTravelMinutes(
  a: Coordinates,
  b: Coordinates,
  opts: { avgSpeedKmh?: number; roadFactor?: number; bufferMinutes?: number } = {},
): number {
  const { avgSpeedKmh = 22, roadFactor = 1.4, bufferMinutes = 10 } = opts;
  const km = haversineKm(a, b) * roadFactor;
  if (km < 0.4) return 5; // walking distance
  // Round up to 5-minute steps: schedules shouldn't look falsely precise.
  return Math.ceil(((km / avgSpeedKmh) * 60 + bufferMinutes) / 5) * 5;
}
