import { roundEstimate } from './money';
import type {
  BudgetAssessment,
  ComfortTier,
  CostCategory,
  CostLineItem,
  CurrencyCode,
  DestinationCostProfile,
  PriceConfidence,
  TransportEstimate,
  TripCostBreakdown,
} from './types';

export interface ActivityCostInput {
  id: string;
  name: string;
  pricePerPerson: number;
  confidence: PriceConfidence;
}

export interface TripCostInput {
  currency?: CurrencyCode;
  adults: number;
  children: number;
  nights: number;
  tier: ComfortTier;
  profile: DestinationCostProfile;
  /** Confidence of the destination cost profile (sample data in Milestone 1). */
  profileConfidence: PriceConfidence;
  profileSource: string;
  transport: TransportEstimate | null;
  activities: ActivityCostInput[];
  international: boolean;
  includeInsurance: boolean;
  budget?: number | null;
}

/** Child cost multipliers relative to an adult. Documented so users can audit them. */
export const CHILD_FACTORS = { food: 0.6, activities: 0.5, localTransport: 0.5, transport: 1 } as const;
export const BOOKING_FEE_RATE = 0.02;
export const CONTINGENCY_RATE = 0.1;

const CATEGORIES: CostCategory[] = [
  'transport', 'accommodation', 'local_transport', 'food', 'activities', 'visa', 'insurance', 'taxes_fees', 'optional',
];

/** Rooms needed: two adults per room, one child can share each room, extra children need extra rooms. */
export function roomsNeeded(adults: number, children: number): number {
  const rooms = Math.max(1, Math.ceil(adults / 2));
  const overflowChildren = Math.max(0, children - rooms);
  return rooms + Math.ceil(overflowChildren / 2);
}

function item(
  partial: Omit<CostLineItem, 'range' | 'amount' | 'optional'> & { raw: number; spread: [number, number]; optional?: boolean },
): CostLineItem {
  const { raw, spread, optional = false, ...rest } = partial;
  return {
    ...rest,
    amount: roundEstimate(raw),
    range: { low: roundEstimate(raw * spread[0]), high: roundEstimate(raw * spread[1]) },
    optional,
  };
}

export function assessBudget(total: number, high: number, budget: number | null | undefined, ctx: { transport: number }): BudgetAssessment {
  if (!budget || budget <= 0) {
    return { status: 'no_budget', budget: null, difference: null, utilisation: null, warnings: [] };
  }
  const warnings: string[] = [];
  const utilisation = total / budget;
  let status: BudgetAssessment['status'];
  if (total > budget) {
    status = 'over';
    warnings.push(`The estimated total exceeds your budget by about ${Math.round((utilisation - 1) * 100)}%.`);
  } else if (utilisation > 0.9 || high > budget) {
    status = 'tight';
    warnings.push('Your budget is tight — price changes could push the trip over budget. Keep a buffer.');
  } else {
    status = 'within';
  }
  if (ctx.transport > budget * 0.5) {
    warnings.push('Getting there uses more than half of your budget. Consider a closer destination or flexible dates.');
  }
  return { status, budget, difference: budget - total, utilisation, warnings };
}

/** Compute a complete, itemised trip cost with ranges and confidence labels. */
export function calculateTripCost(input: TripCostInput): TripCostBreakdown {
  const { adults, children, nights, tier, profile, profileConfidence: pc, profileSource: ps } = input;
  if (adults < 1) throw new Error('At least one adult traveller is required');
  if (nights < 0) throw new Error('Nights cannot be negative');

  const travellers = adults + children;
  const days = nights + 1;
  const rooms = roomsNeeded(adults, children);
  const items: CostLineItem[] = [];

  // 1. Getting there and back
  let transportTotal = 0;
  if (input.transport) {
    const t = input.transport;
    transportTotal = t.perTravellerReturn.best * travellers;
    items.push({
      id: 'transport',
      category: 'transport',
      label: `${t.label} (return) × ${travellers}`,
      amount: roundEstimate(transportTotal),
      range: { low: roundEstimate(t.perTravellerReturn.low * travellers), high: roundEstimate(t.perTravellerReturn.high * travellers) },
      confidence: t.confidence,
      source: t.source,
      basis: t.basis,
      optional: false,
    });
  }

  // 2. Accommodation (pre-tax) + hotel taxes
  const roomCost = profile.hotelPerNight[tier] * rooms * nights;
  const taxRate = typeof profile.hotelTaxRate === 'number' ? profile.hotelTaxRate : profile.hotelTaxRate[tier];
  if (nights > 0) {
    items.push(item({
      id: 'accommodation', category: 'accommodation',
      label: `${rooms} room${rooms > 1 ? 's' : ''} × ${nights} night${nights > 1 ? 's' : ''}`,
      raw: roomCost, spread: [0.85, 1.3], confidence: pc, source: ps,
      basis: `Typical ${tier} nightly rate before taxes.`,
    }));
    items.push(item({
      id: 'hotel_tax', category: 'taxes_fees', label: `Hotel taxes & service (${Math.round(taxRate * 100)}%)`,
      raw: roomCost * taxRate, spread: [0.85, 1.3], confidence: pc, source: ps,
      basis: 'Applied to the room charge. Rates vary by tariff slab and property.',
    }));
  }

  // 3. Local transport
  const travellerUnitsLocal = adults + children * CHILD_FACTORS.localTransport;
  items.push(item({
    id: 'local_transport', category: 'local_transport', label: `Local transport · ${days} days`,
    raw: profile.localTransportPerPersonPerDay[tier] * travellerUnitsLocal * days, spread: [0.8, 1.4], confidence: pc, source: ps,
    basis: tier === 'premium' ? 'Private transfers and cabs.' : tier === 'standard' ? 'Mix of ride-hailing and cabs.' : 'Public transport, shared rides and scooters.',
  }));

  // 4. Food
  const travellerUnitsFood = adults + children * CHILD_FACTORS.food;
  items.push(item({
    id: 'food', category: 'food', label: `Food & drinks · ${days} days`,
    raw: profile.foodPerPersonPerDay[tier] * travellerUnitsFood * days, spread: [0.8, 1.3], confidence: pc, source: ps,
    basis: `Typical ${tier} daily spend per adult; children counted at ${CHILD_FACTORS.food * 100}%.`,
  }));

  // 5. Activities & tickets
  const travellerUnitsAct = adults + children * CHILD_FACTORS.activities;
  const paid = input.activities.filter((a) => a.pricePerPerson > 0);
  if (paid.length > 0) {
    const perPerson = paid.reduce((s, a) => s + a.pricePerPerson, 0);
    const worst: PriceConfidence = paid.some((a) => a.confidence === 'sample') ? 'sample' : paid.every((a) => a.confidence === 'verified') ? 'verified' : 'estimate';
    items.push(item({
      id: 'activities', category: 'activities', label: `Entry tickets & activities (${paid.length})`,
      raw: perPerson * travellerUnitsAct, spread: [0.9, 1.25], confidence: worst, source: ps,
      basis: `Sum of ${paid.length} paid activities; children counted at ${CHILD_FACTORS.activities * 100}%.`,
    }));
  }

  // 6. Visa
  if (input.international) {
    items.push(item({
      id: 'visa', category: 'visa',
      label: profile.visaFeePerPerson > 0 ? `Visa / entry fees × ${travellers}` : 'Visa / entry fees',
      raw: profile.visaFeePerPerson * travellers, spread: [1, 1.15], confidence: pc, source: ps,
      basis: `${profile.visaNote} Always confirm on the official government website.`,
    }));
  }

  // 7. Insurance
  if (input.includeInsurance) {
    items.push(item({
      id: 'insurance', category: 'insurance', label: `Travel insurance × ${travellers}`,
      raw: profile.insurancePerPersonPerDay * travellers * days, spread: [0.8, 1.4], confidence: 'estimate', source: 'TripPilot insurance model',
      basis: 'Typical basic medical + trip cover. Premiums depend on age and cover.',
    }));
  }

  // 8. Booking / convenience fees
  const bookable = transportTotal + roomCost;
  if (bookable > 0) {
    items.push(item({
      id: 'booking_fees', category: 'taxes_fees', label: 'Booking & convenience fees',
      raw: bookable * BOOKING_FEE_RATE, spread: [0.5, 1.5], confidence: 'estimate', source: 'TripPilot fee model',
      basis: `~${BOOKING_FEE_RATE * 100}% of transport and hotel bookings (payment gateway / platform fees).`,
    }));
  }

  // Optional extras (excluded from totals)
  const coreSoFar = items.reduce((s, i) => s + i.amount, 0);
  items.push(item({
    id: 'contingency', category: 'optional', label: `Contingency buffer (${CONTINGENCY_RATE * 100}%)`,
    raw: coreSoFar * CONTINGENCY_RATE, spread: [1, 1], confidence: 'estimate', source: 'TripPilot recommendation',
    basis: 'Recommended buffer for price changes and surprises.', optional: true,
  }));
  items.push(item({
    id: 'shopping', category: 'optional', label: 'Shopping & souvenirs',
    raw: profile.foodPerPersonPerDay[tier] * 0.5 * adults * days, spread: [0.5, 2], confidence: 'estimate', source: 'TripPilot recommendation',
    basis: 'Discretionary spend — adjust to taste.', optional: true,
  }));
  if (input.international) {
    items.push(item({
      id: 'connectivity', category: 'optional', label: 'Roaming pack / local SIM',
      raw: 900 * adults, spread: [0.6, 1.8], confidence: 'estimate', source: 'TripPilot recommendation',
      basis: 'One data pack per adult.', optional: true,
    }));
  }

  const core = items.filter((i) => !i.optional);
  const total = core.reduce((s, i) => s + i.amount, 0);
  const range = {
    low: core.reduce((s, i) => s + i.range.low, 0),
    high: core.reduce((s, i) => s + i.range.high, 0),
  };
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<CostCategory, number>;
  for (const i of items) byCategory[i.category] += i.amount;
  const confidenceSummary: Record<PriceConfidence, number> = { verified: 0, estimate: 0, sample: 0 };
  for (const i of core) confidenceSummary[i.confidence] += i.amount;

  return {
    currency: input.currency ?? 'INR',
    items,
    total,
    range,
    perTraveller: Math.round(total / travellers),
    optionalTotal: items.filter((i) => i.optional).reduce((s, i) => s + i.amount, 0),
    byCategory,
    confidenceSummary,
    budget: assessBudget(total, range.high, input.budget, { transport: transportTotal }),
  };
}
