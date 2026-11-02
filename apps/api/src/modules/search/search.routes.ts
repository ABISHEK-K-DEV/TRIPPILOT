import { Router } from 'express';
import { z } from 'zod';
import type { SearchResult } from '@trippilot/shared';
import { parse } from '../../middleware/validate';
import { loadCatalogue } from '../destinations/catalogue.repository';

export const searchRouter = Router();

searchRouter.get('/', async (req, res) => {
  const { q } = parse(z.object({ q: z.string().trim().min(1).max(80) }), req.query);
  const needle = q.toLowerCase();
  const all = await loadCatalogue();

  const destinations = all
    .filter((d) => [d.name, d.region, d.country.name, ...d.tags].some((s) => s.toLowerCase().includes(needle)))
    .slice(0, 6)
    .map((d) => ({
      slug: d.slug,
      name: d.name,
      region: d.region,
      country: { code: d.country.code, name: d.country.name, flag: d.country.flag },
      scene: d.scene as SearchResult['destinations'][number]['scene'],
      palette: d.palette as [string, string, string],
    }));

  const attractions = all
    .flatMap((d) => d.attractions.map((a) => ({ a, d })))
    .filter(({ a }) => a.name.toLowerCase().includes(needle))
    .slice(0, 6)
    .map(({ a, d }) => ({ id: a.id, name: a.name, destinationSlug: d.slug, destinationName: d.name }));

  const countryMap = new Map<string, SearchResult['countries'][number]>();
  for (const d of all) {
    if (!d.country.name.toLowerCase().includes(needle)) continue;
    const c = countryMap.get(d.country.code) ?? { code: d.country.code, name: d.country.name, flag: d.country.flag, destinationCount: 0 };
    c.destinationCount += 1;
    countryMap.set(c.code, c);
  }

  const result: SearchResult = { destinations, attractions, countries: [...countryMap.values()] };
  res.json(result);
});
