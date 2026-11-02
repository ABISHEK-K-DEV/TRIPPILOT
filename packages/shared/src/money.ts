import type { CurrencyCode } from './types';

const LOCALE_BY_CURRENCY: Partial<Record<CurrencyCode, string>> = { INR: 'en-IN' };

/** Format whole-unit amounts. INR uses Indian digit grouping (₹1,00,000). */
export function formatMoney(amount: number, currency: CurrencyCode = 'INR', opts: { compact?: boolean } = {}): string {
  const locale = LOCALE_BY_CURRENCY[currency] ?? 'en-US';
  if (opts.compact && currency === 'INR' && Math.abs(amount) >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(lakhs >= 10 ? 1 : 2).replace(/\.?0+$/, '')}L`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount));
}

/** Round to a "human" granularity so estimates don't look falsely precise. */
export function roundEstimate(amount: number): number {
  const abs = Math.abs(amount);
  const step = abs >= 100000 ? 500 : abs >= 10000 ? 100 : abs >= 1000 ? 50 : 10;
  return Math.round(amount / step) * step;
}

/**
 * Indicative reference rates (units of currency per 1 INR).
 * SAMPLE DATA — Milestone 2 replaces this with a live currency provider.
 */
export const SAMPLE_FX_RATES_PER_INR: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  THB: 0.41,
  IDR: 188,
  SGD: 0.016,
  LKR: 3.5,
  MVR: 0.18,
  NPR: 1.6,
  MYR: 0.054,
  VND: 300,
};

export function convertFromInr(amountInr: number, to: CurrencyCode): number {
  return amountInr * SAMPLE_FX_RATES_PER_INR[to];
}
