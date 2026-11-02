import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { readSession } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { authRouter } from './modules/auth/auth.routes';
import { destinationsRouter } from './modules/destinations/destinations.routes';
import { searchRouter } from './modules/search/search.routes';
import { plannerRouter } from './modules/planner/planner.routes';
import { tripsRouter } from './modules/trips/trips.routes';
import { metaRouter } from './modules/meta/meta.routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(readSession);

  app.get('/api/health', async (_req, res) => {
    let database = 'up';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }
    res.status(database === 'up' ? 200 : 503).json({ status: database === 'up' ? 'ok' : 'degraded', database, time: new Date().toISOString() });
  });

  app.use('/api/meta', metaRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/destinations', destinationsRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/planner', plannerRouter);
  app.use('/api/trips', tripsRouter);

  app.use('/api', notFoundHandler);
  app.use(errorHandler);
  return app;
}
