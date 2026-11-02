import type { ZodTypeAny, z } from 'zod';
import { badRequest } from '../lib/errors';

export function parse<S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fields = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    throw badRequest(fields[0]?.message ?? 'Invalid request', { fields });
  }
  return result.data;
}
