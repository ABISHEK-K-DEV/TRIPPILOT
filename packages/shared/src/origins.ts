import type { OriginHub } from './types';

/** Departure hubs supported in the India launch market. */
export const ORIGIN_HUBS: OriginHub[] = [
  { code: 'DEL', city: 'New Delhi', state: 'Delhi', lat: 28.5562, lng: 77.1 },
  { code: 'BOM', city: 'Mumbai', state: 'Maharashtra', lat: 19.0896, lng: 72.8656 },
  { code: 'BLR', city: 'Bengaluru', state: 'Karnataka', lat: 13.1986, lng: 77.7066 },
  { code: 'MAA', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9941, lng: 80.1709 },
  { code: 'HYD', city: 'Hyderabad', state: 'Telangana', lat: 17.2403, lng: 78.4294 },
  { code: 'CCU', city: 'Kolkata', state: 'West Bengal', lat: 22.6547, lng: 88.4467 },
  { code: 'COK', city: 'Kochi', state: 'Kerala', lat: 10.152, lng: 76.4019 },
  { code: 'AMD', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0772, lng: 72.6347 },
  { code: 'PNQ', city: 'Pune', state: 'Maharashtra', lat: 18.5822, lng: 73.9197 },
  { code: 'JAI', city: 'Jaipur', state: 'Rajasthan', lat: 26.8242, lng: 75.8122 },
  { code: 'LKO', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.7606, lng: 80.8893 },
  { code: 'GOI', city: 'Goa', state: 'Goa', lat: 15.3808, lng: 73.8314 },
];

export function findOrigin(code: string): OriginHub | undefined {
  return ORIGIN_HUBS.find((o) => o.code === code.toUpperCase());
}
