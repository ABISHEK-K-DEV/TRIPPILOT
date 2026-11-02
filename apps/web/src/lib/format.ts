import { formatMoney, MONTHS } from '@trippilot/shared';

export { formatMoney, formatDuration } from '@trippilot/shared';

export const inr = (n: number) => formatMoney(n, 'INR');
export const inrCompact = (n: number) => formatMoney(n, 'INR', { compact: true });

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { timeZone: 'UTC', ...opts });
}

export function formatDateRange(start: string, end: string) {
  return `${formatDate(start, { weekday: 'short', day: 'numeric', month: 'short' })} – ${formatDate(end, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function monthList(months: number[]) {
  if (months.length === 0) return 'Year-round';
  return [...months].sort((a, b) => a - b).map((m) => MONTHS[m - 1]).join(', ');
}

export const titleCase = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
