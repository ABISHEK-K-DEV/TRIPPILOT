/**
 * Core domain types shared by the TripPilot API and web app.
 *
 * Pricing transparency is a first-class concept: every monetary figure carries
 * a `confidence` so the UI can never present an estimate as a confirmed price.
 */

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'THB' | 'IDR' | 'SGD' | 'LKR' | 'MVR' | 'NPR' | 'MYR' | 'VND';

/**
 * - `verified`: returned by an authorised provider within its freshness window.
 * - `estimate`: computed by TripPilot from models / historical observations.
 * - `sample`:   illustrative sample data used during early milestones.
 */
export type PriceConfidence = 'verified' | 'estimate' | 'sample';

export type ComfortTier = 'budget' | 'standard' | 'premium';
export type TravelPace = 'relaxed' | 'balanced' | 'packed';
export type TransportMode = 'flight' | 'train' | 'road';

export interface Money {
  amount: number; // whole units of `currency` (e.g. rupees), rounded
  currency: CurrencyCode;
}

export interface PriceRange {
  low: number;
  high: number;
}

export type CostCategory =
  | 'transport'
  | 'accommodation'
  | 'local_transport'
  | 'food'
  | 'activities'
  | 'visa'
  | 'insurance'
  | 'taxes_fees'
  | 'optional';

export interface CostLineItem {
  id: string;
  category: CostCategory;
  label: string;
  /** Best estimate in the breakdown currency. */
  amount: number;
  range: PriceRange;
  confidence: PriceConfidence;
  /** Where the number came from, e.g. "TripPilot distance model" or a provider name. */
  source: string;
  /** Short explanation of how the figure was computed. */
  basis: string;
  optional: boolean;
}

export type BudgetStatus = 'within' | 'tight' | 'over' | 'no_budget';

export interface BudgetAssessment {
  status: BudgetStatus;
  budget: number | null;
  /** Positive = money left over, negative = overspend (based on best estimate). */
  difference: number | null;
  /** Share of budget used by the best estimate (0..∞). */
  utilisation: number | null;
  warnings: string[];
}

export interface TripCostBreakdown {
  currency: CurrencyCode;
  items: CostLineItem[];
  /** Totals exclude optional items. */
  total: number;
  range: PriceRange;
  perTraveller: number;
  optionalTotal: number;
  byCategory: Record<CostCategory, number>;
  confidenceSummary: Record<PriceConfidence, number>;
  budget: BudgetAssessment;
}

export interface DestinationCostProfile {
  /** Nightly rate per room by tier, before taxes. */
  hotelPerNight: Record<ComfortTier, number>;
  /** Food & drink per adult per day. */
  foodPerPersonPerDay: Record<ComfortTier, number>;
  /** Local transport per traveller per day. */
  localTransportPerPersonPerDay: Record<ComfortTier, number>;
  /** Hotel taxes & service charges on room charges (e.g. 0.12 for 12%), optionally per tier (tariff slabs). */
  hotelTaxRate: number | Record<ComfortTier, number>;
  /** Visa / entry fee per traveller for Indian passport holders; 0 when not required. */
  visaFeePerPerson: number;
  visaNote: string;
  /** Typical travel insurance cost per traveller per day. */
  insurancePerPersonPerDay: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OriginHub extends Coordinates {
  code: string; // IATA
  city: string;
  state: string;
}

export interface TransportEstimate {
  mode: TransportMode;
  label: string;
  distanceKm: number;
  /** Door-to-door one-way travel time in minutes (estimate). */
  durationMinutes: number;
  /** Return fare per traveller. */
  perTravellerReturn: PriceRange & { best: number };
  stops: number;
  confidence: PriceConfidence;
  source: string;
  basis: string;
}

export interface ItineraryStop {
  id: string;
  kind: 'arrival' | 'attraction' | 'meal' | 'free_time' | 'departure' | 'transfer';
  title: string;
  description?: string;
  startTime: string; // HH:MM local time
  durationMinutes: number;
  /** Travel time from the previous stop. */
  travelMinutesFromPrevious: number;
  location?: Coordinates & { name: string };
  costPerPerson: number;
  confidence: PriceConfidence;
  tags?: string[];
  attractionId?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  area?: string;
  stops: ItineraryStop[];
  totalActivityMinutes: number;
  totalTravelMinutes: number;
  notes: string[];
}

export interface FeasibilityIssue {
  dayNumber: number;
  severity: 'warning' | 'error';
  message: string;
}
