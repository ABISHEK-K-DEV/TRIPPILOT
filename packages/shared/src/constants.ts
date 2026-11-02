export const INTERESTS = [
  { id: 'beach', label: 'Beaches' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'heritage', label: 'History & heritage' },
  { id: 'culture', label: 'Culture' },
  { id: 'food', label: 'Food' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'nature', label: 'Nature & wildlife' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'family', label: 'Family friendly' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'city', label: 'City life' },
] as const;

export type InterestId = (typeof INTERESTS)[number]['id'];

export const DESTINATION_TAGS = [
  'beach', 'mountains', 'city', 'heritage', 'adventure', 'family', 'nature', 'nightlife',
  'spiritual', 'food', 'wellness', 'romantic', 'culture', 'shopping', 'island', 'desert',
] as const;

export const COMFORT_TIERS = [
  { id: 'budget', label: 'Budget', description: 'Hostels, guesthouses and 2★ hotels' },
  { id: 'standard', label: 'Comfort', description: 'Well-rated 3–4★ hotels' },
  { id: 'premium', label: 'Premium', description: '5★ hotels, villas and resorts' },
] as const;

export const TRAVEL_PACES = [
  { id: 'relaxed', label: 'Relaxed', description: 'Up to 5 hours of sightseeing a day', activityMinutes: 300 },
  { id: 'balanced', label: 'Balanced', description: 'Up to 7 hours a day', activityMinutes: 420 },
  { id: 'packed', label: 'Packed', description: 'Up to 9 hours a day', activityMinutes: 540 },
] as const;

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Upper limit on total scheduled minutes per day (activities + travel). */
export const MAX_DAY_MINUTES: Record<'relaxed' | 'balanced' | 'packed', number> = {
  relaxed: 420,
  balanced: 570,
  packed: 690,
};

export const PRICE_CONFIDENCE_LABELS = {
  verified: { label: 'Verified', description: 'Confirmed by an authorised provider within its freshness window.' },
  estimate: { label: 'Estimate', description: 'Calculated by TripPilot from models and typical prices. Final prices will differ.' },
  sample: { label: 'Sample data', description: 'Illustrative sample data used while live data integrations are being built.' },
} as const;
