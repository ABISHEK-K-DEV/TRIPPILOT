import type { DestinationFull } from '../src/modules/destinations/destinations.mapper';
import { SAMPLE_COUNTRIES, SAMPLE_DATA_SOURCE, SAMPLE_DESTINATIONS } from '../src/data/sample-destinations';
import { Prisma } from '@prisma/client';

/** Builds the in-memory catalogue the API would load from the database after seeding. */
export function sampleCatalogue(): DestinationFull[] {
  const now = new Date();
  return SAMPLE_DESTINATIONS.map((d, di) => {
    const c = SAMPLE_COUNTRIES.find((x) => x.code === d.countryCode)!;
    const id = `dest_${di}`;
    return {
      id, slug: d.slug, name: d.name, region: d.region, countryCode: d.countryCode,
      tagline: d.tagline, description: d.description, lat: d.lat, lng: d.lng, gatewayAirport: d.gatewayAirport,
      timeZone: d.timeZone, languages: d.languages, tags: d.tags, bestMonths: d.bestMonths, peakMonths: d.peakMonths,
      avoidMonths: d.avoidMonths, monthlyTempC: d.monthlyTempC, idealDaysMin: d.idealDays[0], idealDaysMax: d.idealDays[1],
      accessibility: d.accessibility, accessibilityNotes: d.accessibilityNotes, scene: d.scene, palette: d.palette,
      imageUrl: null, costCurrency: 'INR', costProfile: d.costProfile as unknown as Prisma.JsonValue,
      dataConfidence: 'SAMPLE', dataSource: SAMPLE_DATA_SOURCE, dataUpdatedAt: now, isPublished: true,
      popularity: d.popularity, createdAt: now, updatedAt: now,
      country: {
        code: c.code, name: c.name, flag: c.flag, currency: c.currency, continent: c.continent, callingCode: null,
        visaRequirementIN: c.visaRequirementIN, visaFeeIN: null, visaFeeCurrency: null, visaInfoUpdatedAt: null,
      },
      attractions: d.attractions.map((a, ai) => ({
        id: `${id}_a${ai}`, destinationId: id, name: a.name, description: a.description, category: a.category,
        tags: a.tags, area: a.area, lat: a.lat, lng: a.lng, durationMinutes: a.durationMinutes, bestTime: a.bestTime, sortOrder: ai,
        openingHours: null, priceAmount: new Prisma.Decimal(a.price), priceCurrency: 'INR', priceConfidence: 'SAMPLE',
        rating: null, ratingSource: null, isSponsored: false, createdAt: now, updatedAt: now,
      })),
    };
  });
}
