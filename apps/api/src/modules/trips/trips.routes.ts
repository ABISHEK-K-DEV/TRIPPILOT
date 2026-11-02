import { Router } from 'express';
import { z } from 'zod';
import { Prisma, type ComfortTier as DbTier, type ExpenseCategory, type PriceConfidence as DbConfidence, type TravelPace as DbPace } from '@prisma/client';
import { plannerRequestSchema, type CostCategory, type PlanResult, type SavedTripSummary } from '@trippilot/shared';
import { prisma } from '../../lib/prisma';
import { notFound } from '../../lib/errors';
import { parse } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { generatePlan } from '../planner/planner.service';

export const tripsRouter = Router();
tripsRouter.use(requireAuth);

const CATEGORY_MAP: Record<CostCategory, ExpenseCategory> = {
  transport: 'TRANSPORT', accommodation: 'ACCOMMODATION', local_transport: 'LOCAL_TRANSPORT', food: 'FOOD',
  activities: 'ACTIVITIES', visa: 'VISA', insurance: 'INSURANCE', taxes_fees: 'TAXES_FEES', optional: 'OTHER',
};
const KIND_MAP = { arrival: 'ARRIVAL', attraction: 'ATTRACTION', meal: 'MEAL', free_time: 'FREE_TIME', transfer: 'TRANSFER', departure: 'DEPARTURE' } as const;
const toDbConfidence = (c: string) => c.toUpperCase() as DbConfidence;

function toSummary(t: { id: string; title: string; startDate: Date; endDate: Date; adults: number; children: number; estimatedTotal: Prisma.Decimal | null; currency: string; status: string; createdAt: Date; destination: { name: string; slug: string } | null }): SavedTripSummary {
  return {
    id: t.id,
    title: t.title,
    destinationName: t.destination?.name ?? 'Unknown destination',
    destinationSlug: t.destination?.slug ?? '',
    startDate: t.startDate.toISOString().slice(0, 10),
    endDate: t.endDate.toISOString().slice(0, 10),
    travellers: t.adults + t.children,
    estimatedTotal: Number(t.estimatedTotal ?? 0),
    currency: t.currency,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
  };
}

const saveSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  request: plannerRequestSchema,
});

/**
 * Saving re-runs the planner on the server from the request — a client-supplied
 * plan snapshot is never trusted.
 */
tripsRouter.post('/', async (req, res) => {
  const { title, request } = parse(saveSchema, req.body);
  const plan = await generatePlan(request);
  const userId = req.auth!.sub;
  const resolvedRequest = { ...request, destination: plan.destination.slug };

  const trip = await prisma.$transaction(async (tx) => {
    const created = await tx.trip.create({
      data: {
        ownerId: userId,
        destinationId: plan.destination.id,
        title: title ?? `${plan.destination.name} · ${plan.request.nights + 1} days`,
        originCode: plan.request.origin.code,
        startDate: new Date(`${plan.request.startDate}T00:00:00Z`),
        endDate: new Date(`${plan.request.endDate}T00:00:00Z`),
        adults: plan.request.adults,
        children: plan.request.children,
        tier: plan.request.tier.toUpperCase() as DbTier,
        pace: plan.request.pace.toUpperCase() as DbPace,
        interests: plan.request.interests,
        budgetAmount: plan.request.budget ?? undefined,
        currency: plan.cost.currency,
        estimatedTotal: plan.cost.total,
        planRequest: resolvedRequest as Prisma.InputJsonValue,
        planSnapshot: plan as unknown as Prisma.InputJsonValue,
        generator: plan.generator.id,
        members: { create: { userId, role: 'OWNER', status: 'ACCEPTED', joinedAt: new Date() } },
        expenses: {
          create: plan.cost.items.map((i) => ({
            category: CATEGORY_MAP[i.category],
            label: i.label,
            amount: i.amount,
            currency: plan.cost.currency,
            amountInTripCurrency: i.amount,
            confidence: toDbConfidence(i.confidence),
            isPlanned: true,
            isOptional: i.optional,
            source: i.source,
          })),
        },
        itineraries: {
          create: {
            timeZone: plan.destination.timeZone,
            generator: plan.generator.id,
            activities: {
              create: plan.itinerary.flatMap((d) =>
                d.stops.map((s, position) => ({
                  dayNumber: d.dayNumber,
                  position,
                  kind: KIND_MAP[s.kind],
                  title: s.title,
                  notes: s.description,
                  localDate: new Date(`${d.date}T00:00:00Z`),
                  startTime: s.startTime,
                  durationMinutes: s.durationMinutes,
                  travelMinutesBefore: s.travelMinutesFromPrevious,
                  lat: s.location?.lat,
                  lng: s.location?.lng,
                  attractionId: s.attractionId,
                  costAmount: s.costPerPerson,
                  costConfidence: toDbConfidence(s.confidence),
                })),
              ),
            },
          },
        },
      },
      include: { destination: { select: { name: true, slug: true } } },
    });
    return created;
  });

  res.status(201).json({ trip: toSummary(trip) });
});

tripsRouter.get('/', async (req, res) => {
  const trips = await prisma.trip.findMany({
    where: { OR: [{ ownerId: req.auth!.sub }, { members: { some: { userId: req.auth!.sub, status: 'ACCEPTED' } } }] },
    orderBy: { createdAt: 'desc' },
    include: { destination: { select: { name: true, slug: true } } },
  });
  res.json({ trips: trips.map(toSummary) });
});

async function findAccessibleTrip(id: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id, OR: [{ ownerId: userId }, { members: { some: { userId, status: 'ACCEPTED' } } }] },
    include: { destination: { select: { name: true, slug: true } } },
  });
  if (!trip) throw notFound('Trip');
  return trip;
}

tripsRouter.get('/:id', async (req, res) => {
  const trip = await findAccessibleTrip(req.params.id, req.auth!.sub);
  res.json({
    trip: toSummary(trip),
    plan: trip.planSnapshot as unknown as PlanResult,
    request: trip.planRequest,
  });
});

tripsRouter.delete('/:id', async (req, res) => {
  const result = await prisma.trip.deleteMany({ where: { id: req.params.id, ownerId: req.auth!.sub } });
  if (result.count === 0) throw notFound('Trip');
  res.status(204).end();
});
