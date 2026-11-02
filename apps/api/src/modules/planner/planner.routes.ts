import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { plannerRequestSchema } from '@trippilot/shared';
import { parse } from '../../middleware/validate';
import { generatePlan } from './planner.service';

export const plannerRouter = Router();

const planLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many plans in a short time. Please wait a moment.' } },
});

plannerRouter.post('/plan', planLimiter, async (req, res) => {
  const request = parse(plannerRequestSchema, req.body);
  res.json({ plan: await generatePlan(request) });
});
