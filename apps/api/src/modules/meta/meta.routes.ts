import { Router } from 'express';
import { COMFORT_TIERS, INTERESTS, ORIGIN_HUBS, PRICE_CONFIDENCE_LABELS, TRAVEL_PACES } from '@trippilot/shared';
import { env } from '../../config/env';
import { getItineraryGenerator } from '../planner/generators';

export const metaRouter = Router();

metaRouter.get('/', (_req, res) => {
  const generator = getItineraryGenerator();
  res.json({
    origins: ORIGIN_HUBS,
    interests: INTERESTS,
    tiers: COMFORT_TIERS,
    paces: TRAVEL_PACES,
    confidenceLabels: PRICE_CONFIDENCE_LABELS,
    providers: {
      itinerary: { id: generator.id, label: generator.label, kind: generator.kind },
      flights: env.FLIGHT_PROVIDER,
      hotels: env.HOTEL_PROVIDER,
      fx: env.FX_PROVIDER,
    },
    milestone: 1,
  });
});
