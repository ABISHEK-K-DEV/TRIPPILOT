import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { PlanResult } from '@trippilot/shared';
import { sampleCatalogue } from './fixtures';

vi.mock('../src/modules/destinations/catalogue.repository', () => ({
  loadCatalogue: async () => sampleCatalogue(),
  invalidateCatalogue: () => {},
}));

let app: import('express').Express;
beforeAll(async () => {
  const { createApp } = await import('../src/app');
  app = createApp();
});

const body = { origin: 'DEL', destination: 'bali', startDate: '2026-12-10', endDate: '2026-12-15', adults: 2, budget: 100000, interests: ['beach', 'culture'] };

describe('POST /api/planner/plan', () => {
  it('returns a complete, transparently labelled plan', async () => {
    const res = await request(app).post('/api/planner/plan').send(body);
    expect(res.status).toBe(200);
    const plan: PlanResult = res.body.plan;
    expect(plan.destination.slug).toBe('bali');
    expect(plan.itinerary).toHaveLength(6);
    expect(plan.cost.total).toBeGreaterThan(0);
    expect(plan.cost.items.find((i) => i.id === 'visa')).toBeDefined();
    expect(plan.cost.items.every((i) => i.confidence !== 'verified')).toBe(true);
    expect(plan.dataNotice).toMatch(/no live prices/i);
    expect(plan.scenarios.map((s) => s.id)).toEqual(['budget', 'standard', 'premium']);
    expect(plan.feasibility.filter((f) => f.severity === 'error')).toEqual([]);
    expect(['within', 'tight', 'over']).toContain(plan.cost.budget.status);
  });

  it('chooses a destination when none is given', async () => {
    const res = await request(app).post('/api/planner/plan').send({ ...body, destination: undefined, region: 'domestic' });
    expect(res.status).toBe(200);
    expect(res.body.plan.destination.international).toBe(false);
  });

  it('validates input', async () => {
    const res = await request(app).post('/api/planner/plan').send({ ...body, endDate: '2026-12-01' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('rejects unknown destinations', async () => {
    const res = await request(app).post('/api/planner/plan').send({ ...body, destination: 'atlantis' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/destinations', () => {
  it('filters by region and tags', async () => {
    const res = await request(app).get('/api/destinations').query({ region: 'international', tags: 'beach' });
    expect(res.status).toBe(200);
    expect(res.body.destinations.length).toBeGreaterThan(0);
    for (const d of res.body.destinations) {
      expect(d.international).toBe(true);
      expect(d.tags).toContain('beach');
    }
  });

  it('returns destination detail with attractions', async () => {
    const res = await request(app).get('/api/destinations/jaipur');
    expect(res.status).toBe(200);
    expect(res.body.destination.attractions.length).toBeGreaterThan(3);
  });

  it('404s for unknown destinations', async () => {
    expect((await request(app).get('/api/destinations/nowhere')).status).toBe(404);
  });
});

describe('auth guard', () => {
  it('requires a session for trips', async () => {
    expect((await request(app).get('/api/trips')).status).toBe(401);
  });
});
