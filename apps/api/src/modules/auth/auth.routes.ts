import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginSchema, registerSchema } from '@trippilot/shared';
import { prisma } from '../../lib/prisma';
import { parse } from '../../middleware/validate';
import { clearSession, issueSession } from '../../middleware/auth';
import { authenticate, registerUser, toPublicUser } from './auth.service';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes.' } },
});

authRouter.post('/register', authLimiter, async (req, res) => {
  const input = parse(registerSchema, req.body);
  const user = await registerUser(input);
  issueSession(res, { sub: user.id, role: user.role });
  res.status(201).json({ user: toPublicUser(user) });
});

authRouter.post('/login', authLimiter, async (req, res) => {
  const input = parse(loginSchema, req.body);
  const user = await authenticate(input);
  issueSession(res, { sub: user.id, role: user.role });
  res.json({ user: toPublicUser(user) });
});

authRouter.post('/logout', (_req, res) => {
  clearSession(res);
  res.status(204).end();
});

/** Returns the signed-in user, or `{ user: null }` for anonymous visitors (not an error). */
authRouter.get('/me', async (req, res) => {
  if (!req.auth) {
    res.json({ user: null });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
  if (!user || user.deletedAt) {
    clearSession(res);
    res.json({ user: null });
    return;
  }
  res.json({ user: toPublicUser(user) });
});
