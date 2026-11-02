import type { RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env, isProd } from '../config/env';
import { forbidden, unauthorized } from '../lib/errors';

export const AUTH_COOKIE = 'tp_session';

export interface AuthClaims {
  sub: string;
  role: 'USER' | 'ADMIN';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthClaims;
    }
  }
}

export function issueSession(res: Response, claims: AuthClaims) {
  const token = jwt.sign(claims, env.JWT_SECRET, { expiresIn: `${env.JWT_EXPIRES_IN_DAYS}d` });
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: env.JWT_EXPIRES_IN_DAYS * 86_400_000,
    path: '/',
  });
}

export function clearSession(res: Response) {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
}

/** Attaches `req.auth` when a valid session cookie is present. Never throws. */
export const readSession: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[AUTH_COOKIE];
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthClaims;
      req.auth = { sub: decoded.sub, role: decoded.role };
    } catch {
      /* expired or tampered — treat as anonymous */
    }
  }
  next();
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.auth) throw unauthorized();
  next();
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.auth) throw unauthorized();
  if (req.auth.role !== 'ADMIN') throw forbidden();
  next();
};
