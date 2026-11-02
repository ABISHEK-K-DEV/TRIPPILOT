import type { AttractionDto, Coordinates, ItineraryDay, TransportEstimate, TravelPace } from '@trippilot/shared';

export interface ItineraryGeneratorInput {
  destination: Coordinates & { slug: string; name: string; timeZone: string; attractions: AttractionDto[] };
  startDate: string;
  nights: number;
  pace: TravelPace;
  interests: string[];
  transport: TransportEstimate | null;
}

export interface ItineraryGeneratorOutput {
  days: ItineraryDay[];
  notes: string[];
}

/**
 * Pluggable itinerary generator. Implementations: the deterministic sample
 * planner (Milestone 1) and LLM-backed planners (Milestone 2). LLM output must
 * be validated against the same structures and feasibility rules.
 */
export interface ItineraryGenerator {
  id: string;
  label: string;
  kind: 'rule_based' | 'llm';
  generate(input: ItineraryGeneratorInput): Promise<ItineraryGeneratorOutput>;
}
