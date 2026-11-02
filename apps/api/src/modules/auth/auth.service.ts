import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import type { LoginInput, PublicUser, RegisterInput } from '@trippilot/shared';
import { prisma } from '../../lib/prisma';
import { AppError, conflict } from '../../lib/errors';

const BCRYPT_ROUNDS = 12;
// Constant-time-ish defence against user enumeration: compare against a dummy hash when the user is missing.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

export function toPublicUser(u: User): PublicUser {
  return { id: u.id, email: u.email, name: u.name, homeCity: u.homeCity, defaultCurrency: u.defaultCurrency, role: u.role };
}

export async function registerUser(input: RegisterInput): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('An account with this email already exists');
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      homeCity: input.homeCity || null,
      passwordHash,
      preferences: { create: {} },
    },
  });
}

export async function authenticate(input: LoginInput): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || user.deletedAt) throw new AppError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return user;
}
