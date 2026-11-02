import type { DestinationQuery, DestinationSummary } from '@trippilot/shared';
import { findOrigin, haversineKm } from '@trippilot/shared';
import { loadCatalogue } from './catalogue.repository';
import { notFound } from '../../lib/errors';
import { toDetail, toSummary, type DestinationFull } from './destinations.mapper';


const climateOf = (temp: number) => (temp < 22 ? 'cool' : temp <= 30 ? 'mild' : 'warm');

export function scoreDestination(d: DestinationFull, ctx: { month?: number; interests?: string[] }) {
  let score = d.popularity / 10;
  const reasons: string[] = [];
  if (ctx.month) {
    if (d.bestMonths.includes(ctx.month)) {
      score += 6;
      reasons.push('Great time to visit');
    } else if (d.avoidMonths.includes(ctx.month)) {
      score -= 8;
    }
  }
  const overlap = (ctx.interests ?? []).filter((i) => d.tags.includes(i));
  if (overlap.length) {
    score += overlap.length * 3;
    reasons.push(`Matches ${overlap.slice(0, 3).join(', ')}`);
  }
  return { score, reasons };
}

export async function listDestinations(q: DestinationQuery): Promise<DestinationSummary[]> {
  const all = await loadCatalogue();
  const origin = q.origin ? findOrigin(q.origin) : undefined;
  const month = q.month;
  const needle = q.q?.toLowerCase();

  const results = all
    .map((d) => {
      const summary = toSummary(d);
      if (origin) summary.distanceKm = Math.round(haversineKm(origin, d));
      const { score, reasons } = scoreDestination(d, { month, interests: q.tags });
      summary.matchReasons = reasons;
      return { d, summary, score };
    })
    .filter(({ d, summary }) => {
      if (needle) {
        const hay = [d.name, d.region, d.country.name, d.tagline, ...d.tags].join(' ').toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (q.tags.length && !q.tags.some((t) => d.tags.includes(t))) return false;
      if (q.region === 'domestic' && summary.international) return false;
      if (q.region === 'international' && !summary.international) return false;
      if (month && d.avoidMonths.includes(month)) return false;
      if (q.climate !== 'any') {
        const t = d.monthlyTempC[(month ?? new Date().getMonth() + 1) - 1] ?? 25;
        if (climateOf(t) !== q.climate) return false;
      }
      if (q.maxDailyCost && summary.dailyCostPerPerson.budget > q.maxDailyCost) return false;
      if (q.days && d.idealDaysMin > q.days) return false;
      if (q.accessibility === 'good' && d.accessibility !== 'good') return false;
      if (q.accessibility === 'moderate' && d.accessibility === 'limited') return false;
      if (q.weekend) {
        if (d.idealDaysMin > 3) return false;
        if (summary.distanceKm !== undefined && summary.distanceKm > 900) return false;
      }
      return true;
    });

  const sorted = results.sort((a, b) => {
    switch (q.sort) {
      case 'cost_asc':
        return a.summary.dailyCostPerPerson.standard - b.summary.dailyCostPerPerson.standard;
      case 'cost_desc':
        return b.summary.dailyCostPerPerson.standard - a.summary.dailyCostPerPerson.standard;
      case 'distance':
        return (a.summary.distanceKm ?? 0) - (b.summary.distanceKm ?? 0);
      default:
        return b.score - a.score;
    }
  });
  return sorted.map((r) => r.summary);
}

export async function getDestination(slug: string) {
  const d = (await loadCatalogue()).find((x) => x.slug === slug);
  if (!d) throw notFound('Destination');
  return toDetail(d);
}

export async function getDestinationFull(slug: string): Promise<DestinationFull> {
  const d = (await loadCatalogue()).find((x) => x.slug === slug);
  if (!d) throw notFound('Destination');
  return d;
}
