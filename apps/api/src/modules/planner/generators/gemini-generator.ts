import type { ItineraryGenerator, ItineraryGeneratorInput, ItineraryGeneratorOutput } from './types';
import { AppError } from '../../../lib/errors';

/**
 * Placeholder for the Milestone 2 Gemini-backed planner.
 * Contract: the LLM receives the destination catalogue (attractions with
 * coordinates, durations and sourced prices) and must return JSON matching
 * `ItineraryDay[]`; the output is validated with zod and re-checked with
 * `checkItineraryFeasibility`. Prices always come from TripPilot data, never
 * from the model.
 */
export class GeminiItineraryGenerator implements ItineraryGenerator {
  id = 'gemini';
  label = 'Gemini AI planner';
  kind = 'llm' as const;

  constructor(private readonly apiKey: string, private readonly model: string) {}

  async generate(_input: ItineraryGeneratorInput): Promise<ItineraryGeneratorOutput> {
    void this.apiKey;
    void this.model;
    throw new AppError(501, 'NOT_IMPLEMENTED', 'The Gemini planner is scheduled for Milestone 2. Set AI_PROVIDER=sample.');
  }
}
