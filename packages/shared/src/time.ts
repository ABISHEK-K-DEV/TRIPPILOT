const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(date: string): number {
  if (!DATE_RE.test(date)) throw new Error(`Invalid date "${date}" (expected YYYY-MM-DD)`);
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(ms)) throw new Error(`Invalid date "${date}"`);
  return ms;
}

/** Number of nights between two calendar dates (timezone-agnostic). */
export function nightsBetween(startDate: string, endDate: string): number {
  return Math.round((parseIsoDate(endDate) - parseIsoDate(startDate)) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  return new Date(parseIsoDate(date) + days * 86_400_000).toISOString().slice(0, 10);
}

/** 1-based month of a YYYY-MM-DD date. */
export function monthOf(date: string): number {
  return new Date(parseIsoDate(date)).getUTCMonth() + 1;
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(hhmm: string, minutes: number): string {
  return minutesToTime(timeToMinutes(hhmm) + minutes);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
