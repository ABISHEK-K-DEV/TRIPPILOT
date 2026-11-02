import { z } from 'zod';
import { nightsBetween } from './time';

/** Accepts real booleans and the strings "true"/"false"/"1"/"0" (z.coerce.boolean treats "false" as true). */
const boolish = z.union([z.boolean(), z.enum(['true', 'false', '1', '0'])]).transform((v) => v === true || v === 'true' || v === '1');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Include a letter')
    .regex(/[0-9]/, 'Include a number'),
  homeCity: z.string().trim().max(80).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const MAX_TRIP_NIGHTS = 21;

export const plannerRequestSchema = z
  .object({
    origin: z.string().length(3),
    /** Destination slug, or omitted to let TripPilot pick from `region`. */
    destination: z.string().max(80).optional(),
    region: z.enum(['any', 'domestic', 'international']).default('any'),
    startDate: isoDate,
    endDate: isoDate,
    adults: z.coerce.number().int().min(1).max(12),
    children: z.coerce.number().int().min(0).max(10).default(0),
    budget: z.coerce.number().int().min(0).max(100_000_000).optional(),
    tier: z.enum(['budget', 'standard', 'premium']).default('standard'),
    pace: z.enum(['relaxed', 'balanced', 'packed']).default('balanced'),
    interests: z.array(z.string().max(30)).max(10).default([]),
    includeInsurance: boolish.default(true),
  })
  .superRefine((v, ctx) => {
    let nights: number;
    try {
      nights = nightsBetween(v.startDate, v.endDate);
    } catch {
      ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Invalid dates' });
      return;
    }
    if (nights < 1) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Return must be at least one day after departure' });
    if (nights > MAX_TRIP_NIGHTS) ctx.addIssue({ code: 'custom', path: ['endDate'], message: `Trips up to ${MAX_TRIP_NIGHTS} nights are supported for now` });
  });
export type PlannerRequest = z.infer<typeof plannerRequestSchema>;
export type PlannerRequestInput = z.input<typeof plannerRequestSchema>;

const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (v === undefined ? [] : (Array.isArray(v) ? v : v.split(',')).map((s) => s.trim()).filter(Boolean)));

export const destinationQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  tags: csv,
  region: z.enum(['any', 'domestic', 'international']).default('any'),
  month: z.coerce.number().int().min(1).max(12).optional(),
  climate: z.enum(['any', 'cool', 'mild', 'warm']).default('any'),
  maxDailyCost: z.coerce.number().int().positive().optional(),
  days: z.coerce.number().int().min(1).max(30).optional(),
  accessibility: z.enum(['any', 'good', 'moderate']).default('any'),
  origin: z.string().length(3).optional(),
  weekend: boolish.optional(),
  sort: z.enum(['recommended', 'cost_asc', 'cost_desc', 'distance']).default('recommended'),
});
export type DestinationQuery = z.infer<typeof destinationQuerySchema>;
