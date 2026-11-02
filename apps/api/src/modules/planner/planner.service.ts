import { randomUUID } from 'node:crypto';
import {
  calculateTripCost,
  checkItineraryFeasibility,
  COMFORT_TIERS,
  estimateTransportOptions,
  findOrigin,
  formatMoney,
  monthOf,
  MONTHS,
  nightsBetween,
  pickPrimaryTransport,
  rankScenarios,
  roomsNeeded,
  type AlternativeDestination,
  type ComfortTier,
  type OriginHub,
  type PlanResult,
  type PlanScenario,
  type PlannerRequest,
  type TransportEstimate,
} from '@trippilot/shared';
import { badRequest } from '../../lib/errors';
import { SAMPLE_DATA_SOURCE } from '../../data/sample-destinations';
import { costProfileOf, toAttractionDto, toSummary, confidenceFromDb, type DestinationFull } from '../destinations/destinations.mapper';
import { loadCatalogue } from '../destinations/catalogue.repository';
import { scoreDestination } from '../destinations/destinations.service';
import { getItineraryGenerator } from './generators';

const TIERS: ComfortTier[] = ['budget', 'standard', 'premium'];
const tierLabel = (t: ComfortTier) => COMFORT_TIERS.find((x) => x.id === t)!.label;

export const DATA_NOTICE =
  'Milestone 1 preview: no live prices are shown. Transport fares come from a distance-based estimate model and destination costs from TripPilot’s sample dataset. Nothing here is a quote or a booking.';

function transportFor(origin: OriginHub, d: DestinationFull, tier: ComfortTier, month: number): { options: TransportEstimate[]; primary: TransportEstimate | null } {
  const options = estimateTransportOptions({
    origin,
    destination: { lat: d.lat, lng: d.lng, name: d.name, international: d.countryCode !== 'IN' },
    tier,
    peakSeason: d.peakMonths.includes(month),
  });
  return { options, primary: pickPrimaryTransport(options, tier) };
}

function seasonality(d: DestinationFull, month: number): PlanResult['seasonality'] {
  const name = MONTHS[month - 1];
  if (d.avoidMonths.includes(month)) {
    return { month, verdict: 'avoid', note: `${name} is usually a difficult time for ${d.name} (heat, heavy rain or closures). Consider other dates.` };
  }
  if (d.bestMonths.includes(month)) {
    return {
      month,
      verdict: 'great',
      note: `${name} is one of the best months for ${d.name}.${d.peakMonths.includes(month) ? ' It is also peak season — expect higher prices and crowds.' : ''}`,
    };
  }
  return { month, verdict: 'okay', note: `${name} is shoulder season for ${d.name} — fewer crowds, but check the weather.` };
}

/** Pick the best-matching destination when the user didn't name one. */
async function chooseDestination(req: PlannerRequest, origin: OriginHub, nights: number): Promise<DestinationFull> {
  const all = await loadCatalogue();
  const month = monthOf(req.startDate);
  const candidates = all.filter((d) => {
    if (req.region === 'domestic' && d.countryCode !== 'IN') return false;
    if (req.region === 'international' && d.countryCode === 'IN') return false;
    return d.idealDaysMin <= nights + 1;
  });
  if (candidates.length === 0) throw badRequest('No destinations match these filters yet.');

  const ranked = candidates
    .map((d) => {
      let { score } = scoreDestination(d, { month, interests: req.interests });
      if (req.budget) {
        const { primary } = transportFor(origin, d, req.tier, month);
        const est = calculateTripCost({
          adults: req.adults, children: req.children, nights, tier: req.tier, profile: costProfileOf(d),
          profileConfidence: 'sample', profileSource: SAMPLE_DATA_SOURCE, transport: primary,
          activities: [], international: d.countryCode !== 'IN', includeInsurance: req.includeInsurance,
        });
        const ratio = est.total / req.budget;
        score += ratio <= 0.85 ? 8 : ratio <= 1 ? 4 : -10 * ratio;
      }
      return { d, score };
    })
    .sort((a, b) => b.score - a.score);
  return ranked[0]!.d;
}

export async function generatePlan(req: PlannerRequest): Promise<PlanResult> {
  const origin = findOrigin(req.origin);
  if (!origin) throw badRequest(`Unsupported departure city "${req.origin}"`);
  const nights = nightsBetween(req.startDate, req.endDate);
  const month = monthOf(req.startDate);
  const travellers = req.adults + req.children;

  let destination: DestinationFull;
  if (req.destination) {
    const found = (await loadCatalogue()).find((d) => d.slug === req.destination);
    if (!found) throw badRequest(`Unknown destination "${req.destination}"`);
    destination = found;
  } else {
    destination = await chooseDestination(req, origin, nights);
  }

  const international = destination.countryCode !== 'IN';
  const profile = costProfileOf(destination);
  const profileConfidence = confidenceFromDb(destination.dataConfidence);
  const { options: transportOptions, primary: transport } = transportFor(origin, destination, req.tier, month);

  // 1. Itinerary
  const generator = getItineraryGenerator();
  const { days, notes: generatorNotes } = await generator.generate({
    destination: {
      slug: destination.slug, name: destination.name, timeZone: destination.timeZone,
      lat: destination.lat, lng: destination.lng, attractions: destination.attractions.map(toAttractionDto),
    },
    startDate: req.startDate, nights, pace: req.pace, interests: req.interests, transport,
  });
  const feasibility = checkItineraryFeasibility(days, req.pace);

  const activities = days.flatMap((d) =>
    d.stops.filter((s) => s.kind === 'attraction').map((s) => ({ id: s.id, name: s.title, pricePerPerson: s.costPerPerson, confidence: s.confidence })),
  );

  const costFor = (tier: ComfortTier, t: TransportEstimate | null) =>
    calculateTripCost({
      adults: req.adults, children: req.children, nights, tier, profile, profileConfidence,
      profileSource: SAMPLE_DATA_SOURCE, transport: t, activities, international,
      includeInsurance: req.includeInsurance, budget: req.budget ?? null,
    });

  // 2. Cost for the chosen tier
  const cost = costFor(req.tier, transport);

  // 3. Scenario comparison (same itinerary, different comfort levels)
  const scenarioBase = TIERS.map((tier) => {
    const t = tier === req.tier ? transport : transportFor(origin, destination, tier, month).primary;
    return { tier, transport: t, cost: tier === req.tier ? cost : costFor(tier, t) };
  });
  const ranking = rankScenarios(scenarioBase.map((s) => ({ id: s.tier, tier: s.tier, total: s.cost.total, transport: s.transport })));
  const scenarios: PlanScenario[] = scenarioBase.map((s) => ({
    id: s.tier,
    label: tierLabel(s.tier),
    tier: s.tier,
    transport: s.transport,
    cost: s.cost,
    scores: ranking.scores.find((x) => x.id === s.tier)!,
  }));

  // 4. Alternatives
  const alternatives = await findAlternatives(req, origin, destination, nights, month);

  // 5. Accommodation guidance
  const areaCounts = new Map<string, number>();
  days.forEach((d) => d.stops.forEach((s) => s.location && areaCounts.set(s.location.name, (areaCounts.get(s.location.name) ?? 0) + 1)));
  const topAreas = [...areaCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([a]) => a);
  const rooms = roomsNeeded(req.adults, req.children);
  const accommodation = (topAreas.length ? topAreas : [destination.name]).map((area, i) => ({
    tier: req.tier,
    area,
    nightlyRate: profile.hotelPerNight[req.tier],
    rooms,
    confidence: profileConfidence,
    note: i === 0 ? `Most of your plan is around ${area} — staying here minimises daily travel.` : `Alternative base close to several stops.`,
  }));

  // 6. Warnings
  const season = seasonality(destination, month);
  const warnings: string[] = [...cost.budget.warnings];
  if (season.verdict === 'avoid') warnings.push(season.note);
  if (nights + 1 < destination.idealDaysMin) warnings.push(`${destination.name} is best enjoyed over at least ${destination.idealDaysMin} days.`);
  if (/altitude/i.test(destination.accessibilityNotes)) warnings.push('High altitude: keep the first day free to acclimatise and avoid strenuous activity.');
  if (international && profile.visaFeePerPerson > 0) warnings.push('Visa fees are included as an estimate. Apply only through official government portals.');
  if (transport && transport.mode === 'flight' && transport.stops > 0) warnings.push('This estimate assumes a connecting flight; layovers add travel time.');
  feasibility.filter((f) => f.severity === 'error').forEach((f) => warnings.push(`Day ${f.dayNumber}: ${f.message}`));
  if (cost.budget.status === 'over') {
    const cheaper = alternatives.find((a) => a.withinBudget);
    if (cheaper) warnings.push(`${cheaper.destination.name} could fit your budget at about ${formatMoney(cheaper.total)}.`);
    if (req.tier !== 'budget') warnings.push('Switching to the Budget comfort level would reduce costs — see the scenario comparison.');
  }

  const summary = `${nights + 1}-day ${destination.name} trip for ${travellers} traveller${travellers > 1 ? 's' : ''} from ${origin.city}. Estimated total ${formatMoney(cost.total)} (${formatMoney(cost.range.low)}–${formatMoney(cost.range.high)}), about ${formatMoney(cost.perTraveller)} per traveller.`;

  return {
    id: randomUUID(),
    generatedAt: new Date().toISOString(),
    generator: { id: generator.id, label: generator.label, kind: generator.kind },
    request: {
      origin: { code: origin.code, city: origin.city },
      startDate: req.startDate, endDate: req.endDate, nights, adults: req.adults, children: req.children,
      budget: req.budget ?? null, tier: req.tier, pace: req.pace, interests: req.interests,
    },
    destination: { ...toSummary(destination), timeZone: destination.timeZone, visaNote: profile.visaNote },
    summary,
    seasonality: season,
    transportOptions,
    transport,
    itinerary: days,
    feasibility,
    cost,
    scenarios,
    ranking: { cheapest: ranking.cheapest as ComfortTier, bestValue: ranking.bestValue as ComfortTier, mostConvenient: ranking.mostConvenient as ComfortTier },
    alternatives,
    accommodation,
    warnings: [...new Set(warnings)],
    plannerNotes: generatorNotes,
    dataNotice: DATA_NOTICE,
  };
}

async function findAlternatives(
  req: PlannerRequest, origin: OriginHub, current: DestinationFull, nights: number, month: number,
): Promise<AlternativeDestination[]> {
  const all = await loadCatalogue();
  const interests = req.interests.length ? req.interests : current.tags;
  return all
    .filter((d) => d.id !== current.id && d.idealDaysMin <= nights + 1 && !d.avoidMonths.includes(month))
    .map((d) => {
      const { primary } = transportFor(origin, d, req.tier, month);
      const typicalActivities = d.attractions
        .slice(0, Math.min(d.attractions.length, nights + 1))
        .map((a) => ({ id: a.id, name: a.name, pricePerPerson: Number(a.priceAmount), confidence: 'sample' as const }));
      const cost = calculateTripCost({
        adults: req.adults, children: req.children, nights, tier: req.tier, profile: costProfileOf(d),
        profileConfidence: confidenceFromDb(d.dataConfidence), profileSource: SAMPLE_DATA_SOURCE, transport: primary,
        activities: typicalActivities, international: d.countryCode !== 'IN', includeInsurance: req.includeInsurance,
      });
      const overlap = d.tags.filter((t) => interests.includes(t));
      const reasons: string[] = [];
      if (overlap.length) reasons.push(`Also great for ${overlap.slice(0, 2).join(' & ')}`);
      if (d.bestMonths.includes(month)) reasons.push(`good in ${MONTHS[month - 1]}`);
      return {
        d, overlap: overlap.length, cost, primary,
        reason: reasons.join(', ') || 'Similar trip length',
      };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.cost.total - b.cost.total)
    .slice(0, 8)
    .sort((a, b) => a.cost.total - b.cost.total)
    .slice(0, 4)
    .map((x) => ({
      destination: toSummary(x.d),
      total: x.cost.total,
      perTraveller: x.cost.perTraveller,
      withinBudget: req.budget ? x.cost.total <= req.budget : null,
      transportLabel: x.primary?.label ?? null,
      reason: x.reason.charAt(0).toUpperCase() + x.reason.slice(1),
    }));
}

export { tierLabel };
