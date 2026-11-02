import type {
  ComfortTier,
  Coordinates,
  DestinationCostProfile,
  FeasibilityIssue,
  ItineraryDay,
  PriceConfidence,
  TransportEstimate,
  TravelPace,
  TripCostBreakdown,
} from './types';
import type { ScenarioScores } from './scenarios';

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  homeCity: string | null;
  defaultCurrency: string;
  role: 'USER' | 'ADMIN';
}

export type SceneKind = 'beach' | 'mountain' | 'city' | 'desert' | 'forest' | 'lake' | 'heritage' | 'island';

export interface DestinationSummary extends Coordinates {
  id: string;
  slug: string;
  name: string;
  region: string;
  country: { code: string; name: string; flag: string };
  international: boolean;
  tagline: string;
  tags: string[];
  bestMonths: number[];
  idealDays: [number, number];
  dailyCostPerPerson: Record<ComfortTier, number>;
  accessibility: 'good' | 'moderate' | 'limited';
  scene: SceneKind;
  palette: [string, string, string];
  imageUrl: string | null;
  dataConfidence: PriceConfidence;
  distanceKm?: number;
  matchReasons?: string[];
}

export interface AttractionDto extends Coordinates {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  durationMinutes: number;
  pricePerPerson: number;
  bestTime: 'morning' | 'afternoon' | 'evening' | 'any';
  area: string;
}

export interface DestinationDetail extends DestinationSummary {
  description: string;
  timeZone: string;
  currency: string;
  languages: string[];
  monthlyTempC: number[];
  peakMonths: number[];
  avoidMonths: number[];
  visaNote: string;
  accessibilityNotes: string;
  costProfile: DestinationCostProfile;
  attractions: AttractionDto[];
}

export interface PlanScenario {
  id: ComfortTier;
  label: string;
  tier: ComfortTier;
  transport: TransportEstimate | null;
  cost: TripCostBreakdown;
  scores: ScenarioScores;
}

export interface AlternativeDestination {
  destination: DestinationSummary;
  total: number;
  perTraveller: number;
  withinBudget: boolean | null;
  transportLabel: string | null;
  reason: string;
}

export interface PlanResult {
  id: string;
  generatedAt: string;
  generator: { id: string; label: string; kind: 'rule_based' | 'llm' };
  request: {
    origin: { code: string; city: string };
    startDate: string;
    endDate: string;
    nights: number;
    adults: number;
    children: number;
    budget: number | null;
    tier: ComfortTier;
    pace: TravelPace;
    interests: string[];
  };
  destination: DestinationSummary & { timeZone: string; visaNote: string };
  summary: string;
  seasonality: { month: number; verdict: 'great' | 'okay' | 'avoid'; note: string };
  transportOptions: TransportEstimate[];
  transport: TransportEstimate | null;
  itinerary: ItineraryDay[];
  feasibility: FeasibilityIssue[];
  cost: TripCostBreakdown;
  scenarios: PlanScenario[];
  ranking: { cheapest: ComfortTier; bestValue: ComfortTier; mostConvenient: ComfortTier };
  alternatives: AlternativeDestination[];
  accommodation: { tier: ComfortTier; area: string; nightlyRate: number; rooms: number; note: string; confidence: PriceConfidence }[];
  warnings: string[];
  plannerNotes: string[];
  dataNotice: string;
}

export interface SavedTripSummary {
  id: string;
  title: string;
  destinationName: string;
  destinationSlug: string;
  startDate: string;
  endDate: string;
  travellers: number;
  estimatedTotal: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface SearchResult {
  destinations: Pick<DestinationSummary, 'slug' | 'name' | 'region' | 'country' | 'scene' | 'palette'>[];
  attractions: { id: string; name: string; destinationSlug: string; destinationName: string }[];
  countries: { code: string; name: string; flag: string; destinationCount: number }[];
}
