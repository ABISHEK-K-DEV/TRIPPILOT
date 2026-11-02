import { env } from '../../../config/env';
import { GeminiItineraryGenerator } from './gemini-generator';
import { SampleItineraryGenerator } from './sample-generator';
import type { ItineraryGenerator } from './types';

let instance: ItineraryGenerator | null = null;

export function getItineraryGenerator(): ItineraryGenerator {
  if (instance) return instance;
  if (env.AI_PROVIDER === 'gemini') {
    if (!env.GEMINI_API_KEY) {
      console.warn('[planner] AI_PROVIDER=gemini but GEMINI_API_KEY is empty — falling back to the sample planner.');
      instance = new SampleItineraryGenerator();
    } else {
      instance = new GeminiItineraryGenerator(env.GEMINI_API_KEY, env.GEMINI_MODEL);
    }
  } else {
    instance = new SampleItineraryGenerator();
  }
  return instance;
}

export type { ItineraryGenerator } from './types';
