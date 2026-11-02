import { Router } from 'express';
import { destinationQuerySchema } from '@trippilot/shared';
import { parse } from '../../middleware/validate';
import { getDestination, listDestinations } from './destinations.service';
import { SAMPLE_DATA_SOURCE } from '../../data/sample-destinations';

export const destinationsRouter = Router();

destinationsRouter.get('/', async (req, res) => {
  const query = parse(destinationQuerySchema, req.query);
  const destinations = await listDestinations(query);
  res.json({ destinations, total: destinations.length, dataSource: SAMPLE_DATA_SOURCE });
});

destinationsRouter.get('/:slug', async (req, res) => {
  res.json({ destination: await getDestination(req.params.slug) });
});
