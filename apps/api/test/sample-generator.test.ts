import { describe, expect, it } from 'vitest';
import { checkItineraryFeasibility, timeToMinutes, type TravelPace } from '@trippilot/shared';
import { SampleItineraryGenerator } from '../src/modules/planner/generators/sample-generator';
import { toAttractionDto } from '../src/modules/destinations/destinations.mapper';
import { sampleCatalogue } from './fixtures';

const generator = new SampleItineraryGenerator();
const catalogue = sampleCatalogue();
const paces: TravelPace[] = ['relaxed', 'balanced', 'packed'];

describe('SampleItineraryGenerator', () => {
  for (const d of catalogue) {
    for (const pace of paces) {
      for (const nights of [1, 3, 6]) {
        it(`${d.slug} · ${pace} · ${nights} nights is feasible`, async () => {
          const { days } = await generator.generate({
            destination: { slug: d.slug, name: d.name, timeZone: d.timeZone, lat: d.lat, lng: d.lng, attractions: d.attractions.map(toAttractionDto) },
            startDate: '2026-12-10', nights, pace, interests: ['heritage', 'beach'], transport: null,
          });
          expect(days).toHaveLength(nights + 1);
          expect(days[0]!.stops[0]!.kind).toBe('arrival');
          expect(days.at(-1)!.stops.at(-1)!.kind).toBe('departure');
          const errors = checkItineraryFeasibility(days, pace).filter((i) => i.severity === 'error');
          expect(errors).toEqual([]);
          // No attraction is repeated and nothing ends after 22:30
          const ids = days.flatMap((x) => x.stops).filter((s) => s.attractionId).map((s) => s.attractionId);
          expect(new Set(ids).size).toBe(ids.length);
          for (const s of days.flatMap((x) => x.stops)) {
            expect(timeToMinutes(s.startTime) + s.durationMinutes).toBeLessThanOrEqual(22 * 60 + 30);
          }
        });
      }
    }
  }

  it('prioritises the traveller’s interests', async () => {
    const goa = catalogue.find((d) => d.slug === 'goa')!;
    const { days } = await generator.generate({
      destination: { slug: 'goa', name: 'Goa', timeZone: goa.timeZone, lat: goa.lat, lng: goa.lng, attractions: goa.attractions.map(toAttractionDto) },
      startDate: '2026-12-10', nights: 2, pace: 'balanced', interests: ['adventure'], transport: null,
    });
    const titles = days.flatMap((d) => d.stops.map((s) => s.title));
    expect(titles).toContain('Scuba or snorkelling trip');
  });
});
