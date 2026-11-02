import { prisma } from '../../lib/prisma';
import type { DestinationFull } from './destinations.mapper';

/**
 * Catalogue repository with a small in-process cache. The catalogue changes
 * rarely; at scale this moves to Redis + a search index (Milestone 3) behind
 * the same function.
 */
const CACHE_TTL_MS = 60_000;
let cache: { at: number; data: DestinationFull[] } | null = null;

export async function loadCatalogue(): Promise<DestinationFull[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
  const data = await prisma.destination.findMany({
    where: { isPublished: true },
    include: { country: true, attractions: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { popularity: 'desc' },
  });
  cache = { at: Date.now(), data };
  return data;
}

export function invalidateCatalogue() {
  cache = null;
}
