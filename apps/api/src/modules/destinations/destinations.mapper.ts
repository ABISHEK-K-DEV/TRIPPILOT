import type { Attraction, Country, Destination } from '@prisma/client';
import type {
  AttractionDto,
  ComfortTier,
  DestinationCostProfile,
  DestinationDetail,
  DestinationSummary,
  PriceConfidence,
  SceneKind,
} from '@trippilot/shared';

export type DestinationWithCountry = Destination & { country: Country };
export type DestinationFull = DestinationWithCountry & { attractions: Attraction[] };

export const confidenceFromDb = (c: 'VERIFIED' | 'ESTIMATE' | 'SAMPLE'): PriceConfidence =>
  c.toLowerCase() as PriceConfidence;

export function costProfileOf(d: Destination): DestinationCostProfile {
  return d.costProfile as unknown as DestinationCostProfile;
}

/** Typical daily spend per person: half a room + food + local transport. */
export function dailyCostPerPerson(profile: DestinationCostProfile): Record<ComfortTier, number> {
  const tiers: ComfortTier[] = ['budget', 'standard', 'premium'];
  return Object.fromEntries(
    tiers.map((t) => [
      t,
      Math.round(profile.hotelPerNight[t] / 2 + profile.foodPerPersonPerDay[t] + profile.localTransportPerPersonPerDay[t]),
    ]),
  ) as Record<ComfortTier, number>;
}

export function toSummary(d: DestinationWithCountry): DestinationSummary {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    region: d.region,
    country: { code: d.country.code, name: d.country.name, flag: d.country.flag },
    international: d.countryCode !== 'IN',
    tagline: d.tagline,
    tags: d.tags,
    bestMonths: d.bestMonths,
    idealDays: [d.idealDaysMin, d.idealDaysMax],
    dailyCostPerPerson: dailyCostPerPerson(costProfileOf(d)),
    accessibility: d.accessibility as DestinationSummary['accessibility'],
    scene: d.scene as SceneKind,
    palette: d.palette as [string, string, string],
    imageUrl: d.imageUrl,
    dataConfidence: confidenceFromDb(d.dataConfidence),
    lat: d.lat,
    lng: d.lng,
  };
}

export function toAttractionDto(a: Attraction): AttractionDto {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    category: a.category,
    tags: a.tags,
    durationMinutes: a.durationMinutes,
    pricePerPerson: Number(a.priceAmount),
    bestTime: a.bestTime as AttractionDto['bestTime'],
    area: a.area,
    lat: a.lat,
    lng: a.lng,
  };
}

export function toDetail(d: DestinationFull): DestinationDetail {
  const profile = costProfileOf(d);
  return {
    ...toSummary(d),
    description: d.description,
    timeZone: d.timeZone,
    currency: d.country.currency,
    languages: d.languages,
    monthlyTempC: d.monthlyTempC,
    peakMonths: d.peakMonths,
    avoidMonths: d.avoidMonths,
    visaNote: profile.visaNote,
    accessibilityNotes: d.accessibilityNotes,
    costProfile: profile,
    attractions: d.attractions.map(toAttractionDto),
  };
}
