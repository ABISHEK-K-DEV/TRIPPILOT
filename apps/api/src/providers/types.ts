/**
 * Provider adapter contracts. Every external data source sits behind one of
 * these interfaces so vendors can be swapped without touching business logic.
 *
 * Rules every adapter must follow:
 *  • Return `confidence: 'verified'` only for prices the provider returned in
 *    this request (or within its declared freshness window).
 *  • Never synthesise fares, availability or ratings.
 *  • Record every observed price in `PriceObservation` for freshness tracking.
 *  • Keep API keys server-side (read from env), never in responses.
 */
import type { CurrencyCode, PriceConfidence } from '@trippilot/shared';

export interface ProviderMeta {
  id: string;
  name: string;
  /** Minutes a returned price may be shown as verified. */
  freshnessMinutes: number;
  isAffiliate: boolean;
}

export interface FlightSearchQuery {
  origin: string; // IATA
  destination: string; // IATA
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  cabin: 'economy' | 'premium_economy' | 'business';
  currency: CurrencyCode;
}

export interface FlightOffer {
  providerOfferId: string;
  airlines: string[];
  segments: { from: string; to: string; departAt: string; arriveAt: string; flightNumber: string }[];
  stops: number;
  layovers: { airport: string; minutes: number }[];
  baggage: { cabinKg: number | null; checkedKg: number | null };
  cancellation: string | null;
  seatSelectionFee: number | null;
  baseFare: number;
  taxesAndFees: number;
  extraCharges: number;
  totalPayable: number;
  currency: CurrencyCode;
  confidence: PriceConfidence;
  observedAt: string;
  expiresAt: string | null;
  deepLink: string | null;
  isSponsored: boolean;
}

export interface FlightProvider {
  meta: ProviderMeta;
  search(query: FlightSearchQuery): Promise<FlightOffer[]>;
}

export interface HotelSearchQuery {
  destinationSlug: string;
  lat: number;
  lng: number;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  currency: CurrencyCode;
}

export interface HotelOffer {
  providerHotelId: string;
  name: string;
  lat: number | null;
  lng: number | null;
  starRating: number | null;
  guestRating: number | null;
  ratingSource: string | null;
  facilities: string[];
  breakfastIncluded: boolean;
  cancellation: string | null;
  nightlyRate: number;
  taxes: number;
  extraCharges: number;
  totalPayable: number;
  currency: CurrencyCode;
  confidence: PriceConfidence;
  observedAt: string;
  expiresAt: string | null;
  deepLink: string | null;
  isSponsored: boolean;
}

export interface HotelProvider {
  meta: ProviderMeta;
  search(query: HotelSearchQuery): Promise<HotelOffer[]>;
}

export interface FxProvider {
  meta: ProviderMeta;
  /** Units of `to` per 1 unit of `from`. */
  rate(from: CurrencyCode, to: CurrencyCode): Promise<{ rate: number; asOf: string; confidence: PriceConfidence }>;
}
