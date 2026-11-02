import { describe, expect, it } from 'vitest';
import { safeNext } from '../pages/AuthPages';

describe('safeNext', () => {
  it('allows relative app paths', () => {
    expect(safeNext('/plan/results?from=DEL')).toBe('/plan/results?from=DEL');
  });
  it('blocks open redirects', () => {
    for (const bad of ['//evil.com', '/\\evil.com', 'https://evil.com', 'evil.com', null]) expect(safeNext(bad)).toBe('/trips');
  });
});
