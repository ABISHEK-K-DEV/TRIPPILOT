/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SAMPLE DATA — FOR MILESTONE 1 ONLY
 *  Prices are illustrative typical figures in INR assembled for product
 *  development. They are NOT live prices and must never be shown as verified.
 *  Visa notes reflect general guidance for Indian passport holders and must be
 *  confirmed with official government sources before travel.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { ComfortTier, DestinationCostProfile, SceneKind } from '@trippilot/shared';

export const SAMPLE_DATA_SOURCE = 'TripPilot sample dataset (Milestone 1)';

export interface SampleCountry {
  code: string;
  name: string;
  flag: string;
  currency: string;
  continent: string;
  visaRequirementIN: string;
}

export interface SampleAttraction {
  name: string;
  description: string;
  category: string;
  tags: string[];
  area: string;
  lat: number;
  lng: number;
  durationMinutes: number;
  bestTime: 'morning' | 'afternoon' | 'evening' | 'any';
  price: number;
}

export interface SampleDestination {
  slug: string;
  name: string;
  region: string;
  countryCode: string;
  tagline: string;
  description: string;
  lat: number;
  lng: number;
  gatewayAirport: string;
  timeZone: string;
  languages: string[];
  tags: string[];
  bestMonths: number[];
  peakMonths: number[];
  avoidMonths: number[];
  monthlyTempC: number[];
  idealDays: [number, number];
  accessibility: 'good' | 'moderate' | 'limited';
  accessibilityNotes: string;
  scene: SceneKind;
  palette: [string, string, string];
  popularity: number;
  costProfile: DestinationCostProfile;
  attractions: SampleAttraction[];
}

export const SAMPLE_COUNTRIES: SampleCountry[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', continent: 'Asia', visaRequirementIN: 'Not required' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', continent: 'Asia', visaRequirementIN: 'Visa on arrival / e-VoA' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB', continent: 'Asia', visaRequirementIN: 'Visa exemption for short tourist stays' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', continent: 'Asia', visaRequirementIN: 'Tourist e-visa' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', continent: 'Asia', visaRequirementIN: 'e-Visa via authorised agent' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', currency: 'LKR', continent: 'Asia', visaRequirementIN: 'ETA' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', currency: 'MVR', continent: 'Asia', visaRequirementIN: 'Free visa on arrival' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', currency: 'NPR', continent: 'Asia', visaRequirementIN: 'Not required' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currency: 'VND', continent: 'Asia', visaRequirementIN: 'e-Visa' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', continent: 'Asia', visaRequirementIN: 'Visa exemption for short tourist stays' },
];

type Tiered = [number, number, number];
const tiers = ([budget, standard, premium]: Tiered): Record<ComfortTier, number> => ({ budget, standard, premium });

/** India GST on hotel rooms: lower slab for tariffs up to ₹7,500/night, 18% above (sample assumption). */
const INDIA_HOTEL_TAX = { budget: 0.05, standard: 0.05, premium: 0.18 };

const domestic = (hotel: Tiered, food: Tiered, local: Tiered): DestinationCostProfile => ({
  hotelPerNight: tiers(hotel),
  foodPerPersonPerDay: tiers(food),
  localTransportPerPersonPerDay: tiers(local),
  hotelTaxRate: INDIA_HOTEL_TAX,
  visaFeePerPerson: 0,
  visaNote: 'No visa required for Indian citizens.',
  insurancePerPersonPerDay: 45,
});

const intl = (
  hotel: Tiered, food: Tiered, local: Tiered, tax: number, visa: number, visaNote: string,
): DestinationCostProfile => ({
  hotelPerNight: tiers(hotel),
  foodPerPersonPerDay: tiers(food),
  localTransportPerPersonPerDay: tiers(local),
  hotelTaxRate: tax,
  visaFeePerPerson: visa,
  visaNote,
  insurancePerPersonPerDay: 160,
});

const a = (
  name: string, description: string, category: string, tags: string[], area: string,
  lat: number, lng: number, durationMinutes: number, bestTime: SampleAttraction['bestTime'], price: number,
): SampleAttraction => ({ name, description, category, tags, area, lat, lng, durationMinutes, bestTime, price });

export const SAMPLE_DESTINATIONS: SampleDestination[] = [
  // ───────────────────────────── India ─────────────────────────────
  {
    slug: 'goa', name: 'Goa', region: 'Goa', countryCode: 'IN',
    tagline: 'Sunsets, Portuguese lanes and long lazy beaches',
    description: 'India’s smallest state packs golden beaches, Indo-Portuguese heritage, spice farms and a famous food scene. North Goa is lively; South Goa is quieter and greener.',
    lat: 15.4909, lng: 73.8278, gatewayAirport: 'GOI', timeZone: 'Asia/Kolkata', languages: ['Konkani', 'English', 'Hindi'],
    tags: ['beach', 'nightlife', 'food', 'heritage', 'romantic', 'family'],
    bestMonths: [11, 12, 1, 2, 3], peakMonths: [12, 1], avoidMonths: [6, 7, 8],
    monthlyTempC: [32, 32, 33, 33, 33, 30, 29, 29, 30, 32, 33, 33], idealDays: [3, 6],
    accessibility: 'moderate', accessibilityNotes: 'Major hotels offer step-free access; beaches and old quarters have uneven surfaces.',
    scene: 'beach', palette: ['#F2A65A', '#E76F51', '#2A9D8F'], popularity: 98,
    costProfile: domestic([1800, 5500, 16000], [700, 1500, 3500], [350, 900, 2200]),
    attractions: [
      a('Fontainhas Latin Quarter', 'Wander colourful Portuguese-era lanes, bakeries and chapels in Panaji.', 'heritage', ['heritage', 'culture', 'food'], 'Panaji', 15.4975, 73.8318, 120, 'morning', 0),
      a('Basilica of Bom Jesus', 'UNESCO-listed 16th-century basilica in Old Goa.', 'heritage', ['heritage', 'spiritual'], 'Old Goa', 15.5009, 73.9116, 90, 'morning', 0),
      a('Aguada Fort & Lighthouse', 'Clifftop 17th-century fort with sweeping Arabian Sea views.', 'heritage', ['heritage', 'romantic'], 'Candolim', 15.4925, 73.7735, 75, 'afternoon', 50),
      a('Anjuna & Vagator beaches', 'Rocky coves, beach shacks and a famous flea market (Wednesdays).', 'beach', ['beach', 'nightlife', 'shopping'], 'North Goa', 15.5970, 73.7400, 180, 'afternoon', 0),
      a('Spice plantation tour', 'Guided walk through a working spice farm with a Goan buffet lunch.', 'nature', ['nature', 'food', 'family'], 'Ponda', 15.4030, 74.0156, 180, 'morning', 900),
      a('Palolem Beach', 'Crescent-shaped bay in South Goa, great for kayaking and sunsets.', 'beach', ['beach', 'romantic', 'family'], 'South Goa', 15.0100, 74.0232, 210, 'afternoon', 0),
      a('Sunset river cruise on the Mandovi', 'Evening cruise with Goan folk music.', 'experience', ['romantic', 'family', 'culture'], 'Panaji', 15.5014, 73.8292, 90, 'evening', 600),
      a('Scuba or snorkelling trip', 'Beginner-friendly dive or snorkel trip near Grande Island.', 'adventure', ['adventure', 'beach'], 'Grande Island', 15.3540, 73.7740, 300, 'morning', 3500),
    ],
  },
  {
    slug: 'jaipur', name: 'Jaipur', region: 'Rajasthan', countryCode: 'IN',
    tagline: 'The Pink City of palaces, forts and bazaars',
    description: 'Rajasthan’s capital blends Rajput forts, royal palaces, astronomical wonders and colourful bazaars famous for gems, textiles and block prints.',
    lat: 26.9124, lng: 75.7873, gatewayAirport: 'JAI', timeZone: 'Asia/Kolkata', languages: ['Hindi', 'Rajasthani', 'English'],
    tags: ['heritage', 'culture', 'shopping', 'food', 'family', 'city'],
    bestMonths: [10, 11, 12, 1, 2, 3], peakMonths: [12, 1], avoidMonths: [5, 6],
    monthlyTempC: [22, 26, 32, 38, 41, 39, 34, 32, 33, 33, 29, 24], idealDays: [2, 4],
    accessibility: 'moderate', accessibilityNotes: 'Amber Fort and Nahargarh involve steep ramps and steps; City Palace is partially accessible.',
    scene: 'heritage', palette: ['#E9A3A0', '#C9604F', '#F4D9B0'], popularity: 92,
    costProfile: domestic([1500, 4500, 15000], [600, 1300, 3000], [300, 800, 1800]),
    attractions: [
      a('Amber Fort', 'Hilltop fort-palace of mirrored halls and ramparts above Maota Lake.', 'heritage', ['heritage', 'culture', 'family'], 'Amer', 26.9855, 75.8513, 180, 'morning', 200),
      a('Hawa Mahal', 'The iconic honeycomb “Palace of Winds” facade.', 'heritage', ['heritage', 'culture'], 'Old City', 26.9239, 75.8267, 60, 'morning', 50),
      a('City Palace', 'Royal residence with museums, courtyards and the Peacock Gate.', 'heritage', ['heritage', 'culture', 'family'], 'Old City', 26.9258, 75.8237, 120, 'any', 300),
      a('Jantar Mantar', 'UNESCO-listed 18th-century astronomical instruments.', 'heritage', ['heritage', 'family'], 'Old City', 26.9248, 75.8246, 60, 'any', 50),
      a('Johari & Bapu bazaars', 'Shop for gems, textiles and block-printed fabric.', 'shopping', ['shopping', 'culture', 'food'], 'Old City', 26.9196, 75.8235, 150, 'afternoon', 0),
      a('Nahargarh Fort sunset', 'Panoramic city views from the Aravalli ridge.', 'heritage', ['heritage', 'romantic'], 'Nahargarh', 26.9373, 75.8155, 120, 'evening', 200),
      a('Albert Hall Museum', 'Indo-Saracenic museum, beautifully lit at night.', 'museum', ['heritage', 'culture', 'family'], 'Ram Niwas Garden', 26.9116, 75.8195, 90, 'any', 40),
    ],
  },
  {
    slug: 'udaipur', name: 'Udaipur', region: 'Rajasthan', countryCode: 'IN',
    tagline: 'Lake palaces and the romance of Mewar',
    description: 'A city of shimmering lakes, whitewashed palaces and rooftop restaurants framed by the Aravalli hills.',
    lat: 24.5854, lng: 73.7125, gatewayAirport: 'UDR', timeZone: 'Asia/Kolkata', languages: ['Hindi', 'Mewari', 'English'],
    tags: ['heritage', 'romantic', 'culture', 'city'],
    bestMonths: [9, 10, 11, 12, 1, 2, 3], peakMonths: [12, 1], avoidMonths: [5],
    monthlyTempC: [24, 27, 32, 37, 39, 36, 31, 29, 31, 32, 29, 25], idealDays: [2, 4],
    accessibility: 'moderate', accessibilityNotes: 'Old city lanes are narrow and steep; lake boats need assisted boarding.',
    scene: 'lake', palette: ['#9BC1BC', '#ED6A5A', '#F4F1BB'], popularity: 84,
    costProfile: domestic([1600, 5000, 20000], [600, 1400, 3500], [300, 800, 1800]),
    attractions: [
      a('City Palace Udaipur', 'Rajasthan’s largest palace complex on the banks of Lake Pichola.', 'heritage', ['heritage', 'culture'], 'Old City', 24.5764, 73.6835, 150, 'morning', 400),
      a('Lake Pichola boat ride', 'Sunset cruise past Jag Mandir and the Lake Palace.', 'experience', ['romantic', 'family'], 'Lake Pichola', 24.5720, 73.6800, 60, 'evening', 700),
      a('Jagdish Temple', 'Ornate 17th-century Indo-Aryan temple.', 'spiritual', ['spiritual', 'heritage'], 'Old City', 24.5799, 73.6841, 45, 'morning', 0),
      a('Sajjangarh Monsoon Palace', 'Hilltop palace with views across the lakes.', 'heritage', ['heritage', 'romantic'], 'Sajjangarh', 24.5940, 73.6400, 120, 'evening', 300),
      a('Bagore Ki Haveli dance show', 'Evening Rajasthani folk performance.', 'culture', ['culture', 'family'], 'Gangaur Ghat', 24.5797, 73.6824, 75, 'evening', 150),
      a('Saheliyon Ki Bari', 'Fountains, lotus pools and marble pavilions.', 'garden', ['nature', 'family'], 'Fateh Sagar', 24.6031, 73.6862, 60, 'any', 10),
    ],
  },
  {
    slug: 'manali', name: 'Manali', region: 'Himachal Pradesh', countryCode: 'IN',
    tagline: 'Pine forests, snow passes and Himalayan adventure',
    description: 'Gateway to the Kullu valley and Lahaul, with old Manali cafés, cedar forests, river rafting and day trips to snow at Solang and Rohtang.',
    lat: 32.2396, lng: 77.1887, gatewayAirport: 'KUU', timeZone: 'Asia/Kolkata', languages: ['Hindi', 'Kullvi', 'English'],
    tags: ['mountains', 'adventure', 'nature', 'romantic', 'family'],
    bestMonths: [3, 4, 5, 6, 10, 11, 12], peakMonths: [5, 6, 12], avoidMonths: [7, 8],
    monthlyTempC: [9, 11, 15, 20, 24, 26, 25, 24, 22, 19, 15, 11], idealDays: [4, 6],
    accessibility: 'limited', accessibilityNotes: 'Hilly terrain and steep paths; landslides possible in monsoon.',
    scene: 'mountain', palette: ['#A8DADC', '#457B9D', '#1D3557'], popularity: 90,
    costProfile: domestic([1400, 4000, 12000], [600, 1200, 2800], [450, 1200, 2500]),
    attractions: [
      a('Hadimba Devi Temple', 'Pagoda-style wooden temple in a cedar forest.', 'spiritual', ['spiritual', 'heritage', 'nature'], 'Dhungri', 32.2481, 77.1803, 60, 'morning', 0),
      a('Old Manali village walk', 'Cafés, apple orchards and riverside lanes.', 'culture', ['culture', 'food'], 'Old Manali', 32.2560, 77.1795, 120, 'afternoon', 0),
      a('Solang Valley', 'Paragliding, ropeway and snow activities in season.', 'adventure', ['adventure', 'mountains', 'family'], 'Solang', 32.3166, 77.1576, 240, 'morning', 1500),
      a('Jogini Waterfall trek', 'Easy-moderate hike through village orchards to a waterfall.', 'nature', ['nature', 'adventure'], 'Vashisht', 32.2700, 77.1900, 180, 'morning', 0),
      a('Vashisht hot springs', 'Natural sulphur springs and temple.', 'wellness', ['wellness', 'spiritual'], 'Vashisht', 32.2667, 77.1890, 60, 'evening', 0),
      a('Beas river rafting', 'Grade II–III rafting stretch near Kullu.', 'adventure', ['adventure', 'nature'], 'Pirdi', 31.9660, 77.1150, 150, 'morning', 1200),
      a('Atal Tunnel & Sissu', 'Drive under the Rohtang ridge to the Lahaul valley.', 'nature', ['mountains', 'nature', 'family'], 'Sissu', 32.4810, 77.1270, 300, 'morning', 600),
    ],
  },
  {
    slug: 'leh-ladakh', name: 'Leh & Ladakh', region: 'Ladakh', countryCode: 'IN',
    tagline: 'High-altitude deserts, monasteries and blue lakes',
    description: 'A dramatic trans-Himalayan landscape of Buddhist monasteries, high passes and lakes. Plan at least one full day to acclimatise at 3,500 m.',
    lat: 34.1526, lng: 77.5771, gatewayAirport: 'IXL', timeZone: 'Asia/Kolkata', languages: ['Ladakhi', 'Hindi', 'English'],
    tags: ['mountains', 'adventure', 'spiritual', 'nature', 'desert'],
    bestMonths: [5, 6, 7, 8, 9], peakMonths: [6, 7], avoidMonths: [12, 1, 2],
    monthlyTempC: [-3, 0, 6, 12, 17, 22, 25, 25, 21, 14, 7, 1], idealDays: [5, 8],
    accessibility: 'limited', accessibilityNotes: 'High altitude (3,500 m+) — consult a doctor if you have heart or lung conditions. Many monasteries involve steps.',
    scene: 'desert', palette: ['#E9C46A', '#F4A261', '#264653'], popularity: 80,
    costProfile: domestic([1800, 5000, 14000], [700, 1300, 2800], [800, 1800, 3500]),
    attractions: [
      a('Acclimatisation & Leh Market', 'Gentle first day — rest, hydrate and stroll the main bazaar.', 'culture', ['culture', 'shopping'], 'Leh', 34.1642, 77.5848, 120, 'evening', 0),
      a('Shanti Stupa', 'White-domed stupa with panoramic views over Leh.', 'spiritual', ['spiritual', 'romantic'], 'Changspa', 34.1736, 77.5754, 60, 'evening', 0),
      a('Leh Palace', 'Nine-storey 17th-century royal palace.', 'heritage', ['heritage', 'culture'], 'Leh', 34.1650, 77.5868, 75, 'morning', 50),
      a('Thiksey Monastery', 'Hilltop gompa resembling Lhasa’s Potala; morning prayers.', 'spiritual', ['spiritual', 'heritage'], 'Thiksey', 34.0560, 77.6670, 120, 'morning', 50),
      a('Hemis Monastery', 'Ladakh’s largest monastery with a fine museum.', 'spiritual', ['spiritual', 'heritage'], 'Hemis', 33.9128, 77.7030, 120, 'morning', 100),
      a('Magnetic Hill & Sangam', 'Indus–Zanskar confluence and the famous optical illusion.', 'nature', ['nature', 'family'], 'Nimmu', 34.2000, 77.3400, 180, 'afternoon', 0),
    ],
  },
  {
    slug: 'rishikesh', name: 'Rishikesh', region: 'Uttarakhand', countryCode: 'IN',
    tagline: 'Yoga capital on the banks of the Ganga',
    description: 'Ashrams, suspension bridges, the evening Ganga aarti and some of India’s best white-water rafting.',
    lat: 30.0869, lng: 78.2676, gatewayAirport: 'DED', timeZone: 'Asia/Kolkata', languages: ['Hindi', 'Garhwali', 'English'],
    tags: ['spiritual', 'adventure', 'wellness', 'nature', 'mountains'],
    bestMonths: [2, 3, 4, 9, 10, 11], peakMonths: [3, 10], avoidMonths: [7, 8],
    monthlyTempC: [20, 23, 28, 34, 37, 36, 33, 32, 32, 30, 26, 22], idealDays: [2, 4],
    accessibility: 'moderate', accessibilityNotes: 'Ghats have steps; Laxman Jhula area is pedestrian with crowds.',
    scene: 'forest', palette: ['#B7E4C7', '#40916C', '#1B4332'], popularity: 78,
    costProfile: domestic([1000, 3500, 11000], [450, 1000, 2400], [250, 700, 1600]),
    attractions: [
      a('Triveni Ghat Ganga aarti', 'Evening fire ritual on the river.', 'spiritual', ['spiritual', 'culture'], 'Triveni Ghat', 30.1030, 78.2970, 60, 'evening', 0),
      a('White-water rafting', 'Shivpuri to Rishikesh 16 km rafting stretch.', 'adventure', ['adventure', 'nature'], 'Shivpuri', 30.1430, 78.3870, 180, 'morning', 1000),
      a('Beatles Ashram', 'Graffiti-covered ruins of the Maharishi’s ashram.', 'culture', ['culture', 'heritage'], 'Swarg Ashram', 30.1109, 78.3138, 90, 'afternoon', 150),
      a('Morning yoga class', 'Drop-in hatha yoga session at an ashram.', 'wellness', ['wellness', 'spiritual'], 'Tapovan', 30.1280, 78.3220, 90, 'morning', 500),
      a('Neer Garh waterfall', 'Short forest hike to tiered falls.', 'nature', ['nature', 'adventure', 'family'], 'Neer', 30.1400, 78.3500, 120, 'afternoon', 30),
      a('Ram & Laxman Jhula cafés', 'Cross the iconic bridges and café-hop.', 'food', ['food', 'culture'], 'Tapovan', 30.1260, 78.3290, 120, 'afternoon', 0),
    ],
  },
  {
    slug: 'munnar', name: 'Munnar', region: 'Kerala', countryCode: 'IN',
    tagline: 'Rolling tea estates in the Western Ghats',
    description: 'Mist-wrapped tea gardens, waterfalls and wildlife sanctuaries at around 1,600 m in Kerala’s hills.',
    lat: 10.0889, lng: 77.0595, gatewayAirport: 'COK', timeZone: 'Asia/Kolkata', languages: ['Malayalam', 'Tamil', 'English'],
    tags: ['mountains', 'nature', 'romantic', 'family', 'wellness'],
    bestMonths: [9, 10, 11, 12, 1, 2, 3], peakMonths: [12, 1], avoidMonths: [6, 7],
    monthlyTempC: [22, 23, 25, 25, 24, 21, 20, 20, 21, 21, 21, 21], idealDays: [2, 3],
    accessibility: 'limited', accessibilityNotes: 'Hilly roads; viewpoints often require walking on uneven paths.',
    scene: 'forest', palette: ['#95D5B2', '#2D6A4F', '#D8F3DC'], popularity: 76,
    costProfile: domestic([1500, 4500, 13000], [500, 1100, 2500], [500, 1100, 2400]),
    attractions: [
      a('Tea Museum (KDHP)', 'History of Munnar tea with a working factory.', 'museum', ['culture', 'family'], 'Nallathanni', 10.0961, 77.0580, 75, 'morning', 125),
      a('Eravikulam National Park', 'Home of the endangered Nilgiri tahr.', 'nature', ['nature', 'family'], 'Rajamala', 10.1720, 77.0640, 180, 'morning', 200),
      a('Mattupetty Dam & Echo Point', 'Lakeside stops on the scenic Top Station road.', 'nature', ['nature', 'family'], 'Mattupetty', 10.1060, 77.1240, 120, 'afternoon', 50),
      a('Tea estate walk', 'Guided walk through the plantations.', 'nature', ['nature', 'romantic'], 'Chithirapuram', 10.0700, 77.0700, 120, 'morning', 400),
      a('Attukad Waterfalls', 'Cascades between hills and tea gardens.', 'nature', ['nature'], 'Pallivasal', 10.0670, 77.0360, 60, 'afternoon', 0),
      a('Kathakali & Kalaripayattu show', 'Kerala classical dance and martial-art performance.', 'culture', ['culture', 'family'], 'Munnar town', 10.0890, 77.0610, 120, 'evening', 400),
    ],
  },
  {
    slug: 'alleppey', name: 'Alleppey', region: 'Kerala', countryCode: 'IN',
    tagline: 'Houseboats on the Kerala backwaters',
    description: 'Glide through palm-fringed canals and paddy fields on a traditional kettuvallam houseboat.',
    lat: 9.4981, lng: 76.3388, gatewayAirport: 'COK', timeZone: 'Asia/Kolkata', languages: ['Malayalam', 'English'],
    tags: ['nature', 'romantic', 'wellness', 'family', 'beach'],
    bestMonths: [10, 11, 12, 1, 2, 3], peakMonths: [12, 1], avoidMonths: [6, 7],
    monthlyTempC: [32, 33, 33, 33, 32, 29, 29, 29, 30, 30, 31, 31], idealDays: [2, 3],
    accessibility: 'moderate', accessibilityNotes: 'Houseboats need help boarding; some offer ground-level rooms.',
    scene: 'lake', palette: ['#CDE7B0', '#3E8914', '#134611'], popularity: 74,
    costProfile: domestic([1500, 6500, 16000], [500, 1100, 2500], [250, 700, 1500]),
    attractions: [
      a('Backwater houseboat day cruise', 'Lunch on board while cruising Vembanad Lake.', 'experience', ['romantic', 'nature', 'family'], 'Punnamada', 9.5100, 76.3500, 300, 'morning', 1800),
      a('Alappuzha Beach', 'Historic pier and sunset beach.', 'beach', ['beach', 'family'], 'Alappuzha', 9.4934, 76.3175, 90, 'evening', 0),
      a('Kayak village canals', 'Early kayak through narrow village waterways.', 'adventure', ['adventure', 'nature'], 'Kainakary', 9.4790, 76.3780, 150, 'morning', 900),
      a('Ayurvedic massage', 'Traditional abhyanga massage at a certified centre.', 'wellness', ['wellness'], 'Alappuzha', 9.4980, 76.3400, 90, 'afternoon', 2000),
      a('Marari Beach', 'Quiet fishing-village beach north of town.', 'beach', ['beach', 'romantic'], 'Mararikulam', 9.6000, 76.2980, 150, 'afternoon', 0),
    ],
  },
  {
    slug: 'coorg', name: 'Coorg', region: 'Karnataka', countryCode: 'IN',
    tagline: 'Coffee country and misty Kodava hills',
    description: 'Coffee estates, waterfalls, Tibetan monasteries and homestays with famous Kodava cuisine — a classic Bengaluru getaway.',
    lat: 12.4244, lng: 75.7382, gatewayAirport: 'IXE', timeZone: 'Asia/Kolkata', languages: ['Kodava', 'Kannada', 'English'],
    tags: ['nature', 'mountains', 'food', 'romantic', 'family'],
    bestMonths: [10, 11, 12, 1, 2, 3], peakMonths: [12], avoidMonths: [6, 7, 8],
    monthlyTempC: [27, 29, 31, 31, 29, 24, 22, 22, 24, 26, 26, 26], idealDays: [2, 3],
    accessibility: 'limited', accessibilityNotes: 'Estate paths and falls involve steps and slopes.',
    scene: 'forest', palette: ['#DDB892', '#7F5539', '#606C38'], popularity: 70,
    costProfile: domestic([1500, 4500, 14000], [500, 1100, 2500], [400, 900, 2000]),
    attractions: [
      a('Coffee plantation tour', 'From bean to cup on a working estate.', 'nature', ['nature', 'food', 'family'], 'Madikeri', 12.4300, 75.7300, 120, 'morning', 500),
      a('Abbey Falls', 'Waterfall surrounded by coffee and spice plantations.', 'nature', ['nature', 'family'], 'Madikeri', 12.4570, 75.7190, 75, 'morning', 15),
      a('Raja’s Seat', 'Sunset garden viewpoint over the valleys.', 'nature', ['romantic', 'family'], 'Madikeri', 12.4178, 75.7360, 60, 'evening', 10),
      a('Namdroling Monastery (Golden Temple)', 'Large Tibetan monastery at Bylakuppe.', 'spiritual', ['spiritual', 'culture'], 'Bylakuppe', 12.4300, 75.9670, 90, 'afternoon', 0),
      a('Dubare Elephant Camp', 'Riverside camp run by the forest department.', 'nature', ['nature', 'family'], 'Dubare', 12.3700, 75.9000, 150, 'morning', 100),
    ],
  },
  {
    slug: 'pondicherry', name: 'Puducherry', region: 'Puducherry', countryCode: 'IN',
    tagline: 'French quarter boulevards and quiet beaches',
    description: 'Mustard-yellow colonial streets, cafés, Auroville and a seaside promenade on the Bay of Bengal.',
    lat: 11.9416, lng: 79.8083, gatewayAirport: 'MAA', timeZone: 'Asia/Kolkata', languages: ['Tamil', 'French', 'English'],
    tags: ['beach', 'heritage', 'food', 'spiritual', 'romantic'],
    bestMonths: [11, 12, 1, 2, 3], peakMonths: [12, 1], avoidMonths: [5, 6],
    monthlyTempC: [29, 30, 32, 34, 37, 37, 35, 34, 34, 32, 30, 29], idealDays: [2, 3],
    accessibility: 'good', accessibilityNotes: 'Flat, walkable White Town; promenade is car-free in the evenings.',
    scene: 'heritage', palette: ['#FFD166', '#EF476F', '#118AB2'], popularity: 68,
    costProfile: domestic([1400, 4200, 11000], [550, 1200, 2600], [250, 600, 1500]),
    attractions: [
      a('White Town heritage walk', 'French colonial streets, churches and boutiques.', 'heritage', ['heritage', 'culture'], 'White Town', 11.9340, 79.8350, 120, 'morning', 0),
      a('Promenade Beach', 'Seaside boulevard, best at sunrise or evening.', 'beach', ['beach', 'family', 'romantic'], 'White Town', 11.9320, 79.8370, 60, 'evening', 0),
      a('Auroville & Matrimandir viewpoint', 'Experimental township and its golden sphere.', 'spiritual', ['spiritual', 'culture'], 'Auroville', 12.0070, 79.8106, 150, 'morning', 0),
      a('Paradise Beach', 'Ferry across the backwaters to a sandy spit.', 'beach', ['beach', 'family'], 'Chunnambar', 11.8920, 79.8240, 180, 'afternoon', 300),
      a('Sri Aurobindo Ashram', 'Peaceful ashram and samadhi.', 'spiritual', ['spiritual'], 'White Town', 11.9366, 79.8346, 45, 'morning', 0),
    ],
  },
  {
    slug: 'andaman', name: 'Andaman Islands', region: 'Andaman & Nicobar', countryCode: 'IN',
    tagline: 'Turquoise water, coral reefs and white sand',
    description: 'Port Blair’s history plus Havelock (Swaraj Dweep) and Neil (Shaheed Dweep) islands for some of Asia’s best beaches and diving. Inter-island ferries need advance booking.',
    lat: 11.6234, lng: 92.7265, gatewayAirport: 'IXZ', timeZone: 'Asia/Kolkata', languages: ['Hindi', 'Bengali', 'English'],
    tags: ['beach', 'island', 'adventure', 'romantic', 'nature', 'family'],
    bestMonths: [11, 12, 1, 2, 3, 4], peakMonths: [12, 1], avoidMonths: [6, 7, 8],
    monthlyTempC: [29, 30, 31, 32, 31, 29, 29, 29, 29, 29, 29, 29], idealDays: [5, 7],
    accessibility: 'limited', accessibilityNotes: 'Ferries and beaches have limited accessibility infrastructure.',
    scene: 'island', palette: ['#90E0EF', '#0077B6', '#CAF0F8'], popularity: 82,
    costProfile: domestic([2200, 6500, 18000], [700, 1500, 3200], [900, 1800, 3500]),
    attractions: [
      a('Cellular Jail & light show', 'Colonial-era prison museum with an evening sound and light show.', 'heritage', ['heritage', 'culture', 'family'], 'Port Blair', 11.6747, 92.7477, 120, 'evening', 300),
      a('Ross Island', 'Former British HQ ruins reclaimed by banyan trees.', 'heritage', ['heritage', 'nature'], 'Port Blair', 11.6770, 92.7620, 150, 'morning', 300),
      a('Radhanagar Beach', 'Award-winning beach on Havelock; legendary sunsets.', 'beach', ['beach', 'romantic', 'family'], 'Havelock', 11.9840, 92.9510, 180, 'afternoon', 0),
      a('Elephant Beach snorkelling', 'Boat trip to shallow coral reefs.', 'adventure', ['adventure', 'beach', 'nature'], 'Havelock', 12.0170, 92.9530, 240, 'morning', 1800),
      a('Discover scuba dive', 'Beginner dive with a certified instructor.', 'adventure', ['adventure'], 'Havelock', 12.0350, 92.9850, 240, 'morning', 6000),
      a('Kala Patthar Beach', 'Quiet stretch lined with black rocks.', 'beach', ['beach', 'romantic'], 'Havelock', 11.9640, 93.0090, 120, 'afternoon', 0),
    ],
  },
  {
    slug: 'varanasi', name: 'Varanasi', region: 'Uttar Pradesh', countryCode: 'IN',
    tagline: 'The world’s oldest living city on the Ganga',
    description: 'Dawn boat rides past ancient ghats, the Ganga aarti, silk weaving and a legendary street food scene. Sarnath is a short drive away.',
    lat: 25.3176, lng: 82.9739, gatewayAirport: 'VNS', timeZone: 'Asia/Kolkata', languages: ['Hindi', 'Bhojpuri', 'English'],
    tags: ['spiritual', 'heritage', 'culture', 'food'],
    bestMonths: [10, 11, 12, 1, 2, 3], peakMonths: [11, 12], avoidMonths: [5, 6],
    monthlyTempC: [23, 27, 33, 39, 41, 39, 33, 32, 32, 32, 29, 25], idealDays: [2, 3],
    accessibility: 'limited', accessibilityNotes: 'Ghats involve many steep steps; lanes are crowded.',
    scene: 'heritage', palette: ['#FFB703', '#FB8500', '#8ECAE6'], popularity: 72,
    costProfile: domestic([1200, 3800, 12000], [450, 1000, 2500], [250, 650, 1500]),
    attractions: [
      a('Sunrise boat ride on the ghats', 'Row past Manikarnika and Dashashwamedh at dawn.', 'experience', ['spiritual', 'culture', 'romantic'], 'Dashashwamedh', 25.3070, 83.0104, 120, 'morning', 600),
      a('Ganga aarti at Dashashwamedh', 'Grand evening river ceremony.', 'spiritual', ['spiritual', 'culture'], 'Dashashwamedh', 25.3068, 83.0106, 75, 'evening', 0),
      a('Kashi Vishwanath Temple', 'One of the holiest Shiva temples (expect queues).', 'spiritual', ['spiritual', 'heritage'], 'Vishwanath Gali', 25.3109, 83.0107, 120, 'morning', 0),
      a('Sarnath', 'Where the Buddha gave his first sermon; museum and stupas.', 'heritage', ['heritage', 'spiritual'], 'Sarnath', 25.3800, 83.0230, 180, 'afternoon', 50),
      a('Old city food walk', 'Kachori, malaiyo and lassi in the lanes.', 'food', ['food', 'culture'], 'Chowk', 25.3110, 83.0120, 120, 'evening', 400),
    ],
  },
  {
    slug: 'lonavala', name: 'Lonavala', region: 'Maharashtra', countryCode: 'IN',
    tagline: 'Monsoon-green Sahyadri weekend escape',
    description: 'Hill station between Mumbai and Pune with forts, caves, lakes and viewpoints that turn lush in the monsoon.',
    lat: 18.7546, lng: 73.4062, gatewayAirport: 'PNQ', timeZone: 'Asia/Kolkata', languages: ['Marathi', 'Hindi', 'English'],
    tags: ['mountains', 'nature', 'family', 'adventure', 'heritage'],
    bestMonths: [6, 7, 8, 9, 10, 11, 12, 1, 2], peakMonths: [7, 8], avoidMonths: [4, 5],
    monthlyTempC: [28, 30, 33, 34, 33, 28, 25, 25, 26, 29, 29, 28], idealDays: [1, 2],
    accessibility: 'moderate', accessibilityNotes: 'Resorts are accessible; forts and caves involve climbs.',
    scene: 'mountain', palette: ['#CCD5AE', '#588157', '#344E41'], popularity: 66,
    costProfile: domestic([1800, 5000, 14000], [500, 1100, 2500], [300, 800, 1800]),
    attractions: [
      a('Karla & Bhaja caves', '2nd-century BCE Buddhist rock-cut caves.', 'heritage', ['heritage', 'spiritual'], 'Malavali', 18.7832, 73.4710, 150, 'morning', 25),
      a('Tiger’s Leap viewpoint', 'Cliff edge with sweeping valley views.', 'nature', ['nature', 'family'], 'INS Shivaji', 18.7270, 73.3830, 60, 'any', 0),
      a('Lohagad Fort trek', 'Moderate climb to a Maratha hill fort.', 'adventure', ['adventure', 'heritage'], 'Lohagadwadi', 18.7100, 73.4760, 210, 'morning', 25),
      a('Pawna Lake', 'Lakeside camping and sunset picnics.', 'nature', ['nature', 'romantic'], 'Pawna', 18.6670, 73.4910, 180, 'evening', 0),
      a('Della Adventure Park', 'Family adventure activities.', 'adventure', ['adventure', 'family'], 'Kunegaon', 18.7900, 73.3600, 240, 'afternoon', 2500),
    ],
  },

  // ───────────────────────────── International ─────────────────────────────
  {
    slug: 'bali', name: 'Bali', region: 'Bali', countryCode: 'ID',
    tagline: 'Temples, rice terraces and island sunsets',
    description: 'Ubud’s jungle and culture, Uluwatu’s clifftop temples and beaches, and a world-class food and wellness scene. Distances are short on a map but traffic is slow — group sights by area.',
    lat: -8.5069, lng: 115.2625, gatewayAirport: 'DPS', timeZone: 'Asia/Makassar', languages: ['Indonesian', 'Balinese', 'English'],
    tags: ['beach', 'culture', 'romantic', 'wellness', 'nature', 'adventure', 'island'],
    bestMonths: [4, 5, 6, 7, 8, 9, 10], peakMonths: [7, 8, 12], avoidMonths: [1, 2],
    monthlyTempC: [30, 30, 31, 31, 30, 29, 28, 29, 30, 31, 31, 30], idealDays: [5, 8],
    accessibility: 'limited', accessibilityNotes: 'Temples and terraces involve many steps; pavements are uneven.',
    scene: 'island', palette: ['#80ED99', '#22577A', '#FFC300'], popularity: 96,
    costProfile: intl([2200, 6500, 18000], [1100, 2200, 5000], [600, 1400, 3200], 0.21, 3500,
      'Visa on arrival / e-VoA (IDR 500,000) plus the Bali tourist levy (IDR 150,000) at last review.'),
    attractions: [
      a('Tegallalang rice terraces', 'Sculpted terraces north of Ubud; go early.', 'nature', ['nature', 'romantic'], 'Ubud', -8.4312, 115.2793, 120, 'morning', 300),
      a('Sacred Monkey Forest Sanctuary', 'Temple forest home to long-tailed macaques.', 'nature', ['nature', 'family'], 'Ubud', -8.5188, 115.2585, 90, 'morning', 1000),
      a('Ubud Palace & Market', 'Royal palace and craft market in central Ubud.', 'culture', ['culture', 'shopping'], 'Ubud', -8.5069, 115.2625, 120, 'afternoon', 0),
      a('Tirta Empul water temple', 'Holy spring temple with purification pools.', 'spiritual', ['spiritual', 'culture'], 'Tampaksiring', -8.4155, 115.3153, 90, 'morning', 400),
      a('Uluwatu Temple & Kecak dance', 'Clifftop temple with a sunset fire dance.', 'culture', ['culture', 'spiritual', 'romantic'], 'Uluwatu', -8.8291, 115.0849, 180, 'evening', 1400),
      a('Mount Batur volcano trek', 'Guided hike up an active volcano; sunrise departures leave before dawn.', 'adventure', ['adventure', 'mountains'], 'Kintamani', -8.2420, 115.3750, 360, 'morning', 3500),
      a('Seminyak beach & sunset', 'Beach clubs and cafés on the west coast.', 'beach', ['beach', 'nightlife', 'romantic'], 'Seminyak', -8.6913, 115.1571, 180, 'evening', 0),
      a('Nusa Penida day trip', 'Fast boat to Kelingking Beach and Crystal Bay.', 'adventure', ['beach', 'adventure', 'nature'], 'Nusa Penida', -8.7278, 115.5444, 540, 'morning', 4500),
      a('Balinese cooking class', 'Market visit and hands-on cooking.', 'food', ['food', 'culture', 'family'], 'Ubud', -8.5000, 115.2700, 240, 'morning', 2500),
    ],
  },
  {
    slug: 'bangkok', name: 'Bangkok', region: 'Bangkok', countryCode: 'TH',
    tagline: 'Golden temples, street food and rooftop nights',
    description: 'Thailand’s capital is a whirl of glittering temples, canals, markets, malls and one of the world’s great street food cultures.',
    lat: 13.7563, lng: 100.5018, gatewayAirport: 'BKK', timeZone: 'Asia/Bangkok', languages: ['Thai', 'English'],
    tags: ['city', 'food', 'shopping', 'nightlife', 'culture', 'spiritual'],
    bestMonths: [11, 12, 1, 2], peakMonths: [12, 1], avoidMonths: [4, 9],
    monthlyTempC: [32, 33, 34, 35, 34, 33, 33, 32, 32, 32, 32, 31], idealDays: [3, 5],
    accessibility: 'moderate', accessibilityNotes: 'BTS Skytrain stations increasingly have lifts; pavements are uneven.',
    scene: 'city', palette: ['#FFB4A2', '#B5838D', '#6D6875'], popularity: 94,
    costProfile: intl([1800, 5000, 14000], [900, 1800, 4500], [400, 900, 2200], 0.177, 0,
      'Visa exemption for short tourist stays at last review; complete the free Thailand Digital Arrival Card before travel.'),
    attractions: [
      a('Grand Palace & Wat Phra Kaew', 'Royal palace and the Emerald Buddha (dress code applies).', 'heritage', ['heritage', 'spiritual', 'culture'], 'Rattanakosin', 13.7500, 100.4913, 150, 'morning', 1250),
      a('Wat Pho', 'The 46 m reclining Buddha and traditional massage school.', 'spiritual', ['spiritual', 'heritage', 'wellness'], 'Rattanakosin', 13.7465, 100.4930, 90, 'morning', 650),
      a('Wat Arun', 'Temple of Dawn on the Chao Phraya; cross by ferry.', 'spiritual', ['spiritual', 'heritage', 'romantic'], 'Thonburi', 13.7437, 100.4889, 75, 'afternoon', 250),
      a('Chatuchak Weekend Market', 'Thousands of stalls (Sat–Sun).', 'shopping', ['shopping', 'food'], 'Chatuchak', 13.7999, 100.5500, 180, 'morning', 0),
      a('Yaowarat (Chinatown) food night', 'Neon-lit street food crawl.', 'food', ['food', 'nightlife', 'culture'], 'Yaowarat', 13.7398, 100.5101, 150, 'evening', 1200),
      a('Chao Phraya river cruise', 'Evening dinner cruise past illuminated temples.', 'experience', ['romantic', 'family'], 'Riverside', 13.7270, 100.5130, 120, 'evening', 2800),
      a('Jim Thompson House', 'Teak houses and Thai silk history.', 'museum', ['culture', 'heritage'], 'Pathum Wan', 13.7494, 100.5283, 75, 'afternoon', 500),
    ],
  },
  {
    slug: 'phuket', name: 'Phuket', region: 'Phuket', countryCode: 'TH',
    tagline: 'Andaman Sea beaches and island-hopping',
    description: 'Thailand’s largest island with lively beaches, the Old Town’s Sino-Portuguese shophouses and boat trips to Phi Phi and Phang Nga Bay.',
    lat: 7.8804, lng: 98.3923, gatewayAirport: 'HKT', timeZone: 'Asia/Bangkok', languages: ['Thai', 'English'],
    tags: ['beach', 'island', 'nightlife', 'adventure', 'family', 'romantic'],
    bestMonths: [11, 12, 1, 2, 3, 4], peakMonths: [12, 1], avoidMonths: [9, 10],
    monthlyTempC: [32, 33, 33, 33, 32, 31, 31, 31, 30, 30, 31, 31], idealDays: [4, 6],
    accessibility: 'moderate', accessibilityNotes: 'Resort areas are accessible; boat transfers need assistance.',
    scene: 'beach', palette: ['#48CAE4', '#00B4D8', '#FFE5B4'], popularity: 88,
    costProfile: intl([2000, 6000, 18000], [1000, 2000, 4800], [700, 1400, 3000], 0.177, 0,
      'Visa exemption for short tourist stays at last review; complete the free Thailand Digital Arrival Card before travel.'),
    attractions: [
      a('Phi Phi Islands day trip', 'Speedboat to Maya Bay and snorkel stops.', 'adventure', ['beach', 'adventure', 'nature'], 'Phi Phi', 7.6780, 98.7660, 540, 'morning', 4500),
      a('Phuket Old Town', 'Colourful shophouses, cafés and Sunday market.', 'culture', ['culture', 'food', 'shopping'], 'Phuket Town', 7.8846, 98.3870, 150, 'afternoon', 0),
      a('Big Buddha', '45 m marble Buddha with island views.', 'spiritual', ['spiritual', 'family'], 'Chalong', 7.8276, 98.3128, 75, 'morning', 0),
      a('Kata & Karon beaches', 'Swimming and sunset beaches on the west coast.', 'beach', ['beach', 'family', 'romantic'], 'Kata', 7.8205, 98.2985, 180, 'afternoon', 0),
      a('Promthep Cape sunset', 'Southern headland viewpoint.', 'nature', ['romantic', 'nature'], 'Rawai', 7.7620, 98.3060, 60, 'evening', 0),
      a('Phang Nga Bay sea kayaking', 'Limestone karsts and sea caves.', 'adventure', ['adventure', 'nature'], 'Phang Nga', 8.2750, 98.5010, 480, 'morning', 4200),
    ],
  },
  {
    slug: 'dubai', name: 'Dubai', region: 'Dubai', countryCode: 'AE',
    tagline: 'Skyscrapers, desert dunes and souks',
    description: 'Record-breaking architecture, beach clubs, old Dubai’s creek and souks, and desert safaris on the city’s doorstep.',
    lat: 25.2048, lng: 55.2708, gatewayAirport: 'DXB', timeZone: 'Asia/Dubai', languages: ['Arabic', 'English', 'Hindi'],
    tags: ['city', 'shopping', 'family', 'desert', 'adventure', 'nightlife'],
    bestMonths: [11, 12, 1, 2, 3], peakMonths: [12, 1], avoidMonths: [6, 7, 8],
    monthlyTempC: [24, 25, 29, 33, 38, 40, 41, 41, 39, 35, 30, 26], idealDays: [3, 5],
    accessibility: 'good', accessibilityNotes: 'Metro, malls and major attractions have excellent step-free access.',
    scene: 'desert', palette: ['#F6BD60', '#F28482', '#84A59D'], popularity: 93,
    costProfile: intl([4000, 9000, 25000], [1500, 3000, 7000], [600, 1500, 3500], 0.22, 7500,
      'Tourist e-visa required at last review (some travellers with valid US/UK/EU visas qualify for visa on arrival).'),
    attractions: [
      a('Burj Khalifa — At the Top', 'Observation decks on levels 124–125.', 'landmark', ['city', 'family', 'romantic'], 'Downtown', 25.1972, 55.2744, 120, 'evening', 4000),
      a('Dubai Mall & Fountain show', 'Shopping, aquarium and the evening fountain.', 'shopping', ['shopping', 'family', 'city'], 'Downtown', 25.1985, 55.2796, 180, 'evening', 0),
      a('Desert safari with dinner', 'Dune bashing, camel ride and BBQ camp.', 'adventure', ['adventure', 'desert', 'family'], 'Lahbab', 25.0400, 55.5900, 360, 'afternoon', 4000),
      a('Al Fahidi & Creek abra ride', 'Historic quarter, museums and a traditional abra ferry crossing.', 'heritage', ['heritage', 'culture'], 'Bur Dubai', 25.2637, 55.2972, 150, 'morning', 50),
      a('Gold & Spice Souks', 'Traditional markets in Deira.', 'shopping', ['shopping', 'culture'], 'Deira', 25.2697, 55.2963, 90, 'morning', 0),
      a('Museum of the Future', 'Immersive exhibitions in a landmark torus building.', 'museum', ['city', 'family'], 'Trade Centre', 25.2192, 55.2820, 120, 'afternoon', 3400),
      a('JBR beach & Marina walk', 'Beach, promenade and Ain Dubai views.', 'beach', ['beach', 'family', 'nightlife'], 'Dubai Marina', 25.0781, 55.1340, 150, 'evening', 0),
    ],
  },
  {
    slug: 'singapore', name: 'Singapore', region: 'Singapore', countryCode: 'SG',
    tagline: 'Garden city of hawker food and skyline icons',
    description: 'Ultra-efficient city-state with futuristic gardens, hawker centres, diverse neighbourhoods and family attractions on Sentosa.',
    lat: 1.3521, lng: 103.8198, gatewayAirport: 'SIN', timeZone: 'Asia/Singapore', languages: ['English', 'Mandarin', 'Malay', 'Tamil'],
    tags: ['city', 'family', 'food', 'shopping', 'nature'],
    bestMonths: [2, 3, 4, 5, 6, 7, 8, 9], peakMonths: [6, 12], avoidMonths: [],
    monthlyTempC: [30, 31, 32, 32, 32, 31, 31, 31, 31, 31, 31, 30], idealDays: [3, 5],
    accessibility: 'good', accessibilityNotes: 'Among the most accessible cities in Asia; MRT is fully step-free.',
    scene: 'city', palette: ['#B8F2E6', '#5E6472', '#FFA69E'], popularity: 91,
    costProfile: intl([5500, 12000, 30000], [1500, 3000, 7000], [500, 1100, 2800], 0.2, 3000,
      'e-Visa via an authorised agent at last review; complete the free SG Arrival Card before travel.'),
    attractions: [
      a('Gardens by the Bay', 'Supertree Grove, Cloud Forest and Flower Dome.', 'nature', ['nature', 'family', 'city'], 'Marina Bay', 1.2816, 103.8636, 180, 'afternoon', 3200),
      a('Marina Bay light show', 'Free Spectra show at the waterfront.', 'experience', ['city', 'romantic', 'family'], 'Marina Bay', 1.2834, 103.8607, 60, 'evening', 0),
      a('Sentosa & Universal Studios', 'Theme park day on Sentosa island.', 'theme_park', ['family', 'adventure'], 'Sentosa', 1.2540, 103.8238, 480, 'morning', 6500),
      a('Hawker centre crawl', 'Maxwell & Lau Pa Sat for chicken rice and satay.', 'food', ['food', 'culture'], 'Chinatown', 1.2803, 103.8448, 120, 'evening', 900),
      a('Little India & Kampong Glam', 'Temples, mosques, murals and boutiques.', 'culture', ['culture', 'shopping', 'spiritual'], 'Little India', 1.3066, 103.8518, 150, 'morning', 0),
      a('Singapore Zoo / Night Safari', 'Open-concept zoo; night safari after dark.', 'nature', ['nature', 'family'], 'Mandai', 1.4043, 103.7930, 240, 'evening', 3700),
    ],
  },
  {
    slug: 'sri-lanka-south-coast', name: 'Galle & South Coast', region: 'Southern Province', countryCode: 'LK',
    tagline: 'Dutch forts, surf breaks and whale watching',
    description: 'Galle’s walled fort town, laid-back beaches at Unawatuna and Mirissa, tea country inland and blue-whale season offshore.',
    lat: 6.0329, lng: 80.2168, gatewayAirport: 'CMB', timeZone: 'Asia/Colombo', languages: ['Sinhala', 'Tamil', 'English'],
    tags: ['beach', 'heritage', 'nature', 'romantic', 'adventure'],
    bestMonths: [12, 1, 2, 3, 4], peakMonths: [12, 1], avoidMonths: [5, 6],
    monthlyTempC: [30, 31, 31, 31, 30, 29, 29, 29, 29, 29, 29, 29], idealDays: [4, 6],
    accessibility: 'moderate', accessibilityNotes: 'Galle Fort is flat but cobbled; beaches lack ramps.',
    scene: 'beach', palette: ['#FCD5CE', '#F08080', '#2EC4B6'], popularity: 70,
    costProfile: intl([2500, 6500, 17000], [900, 1800, 4000], [600, 1300, 2800], 0.28, 0,
      'ETA required before arrival. Fees for Indian nationals have been waived under a pilot scheme at last review — check the official ETA site.'),
    attractions: [
      a('Galle Fort walk', 'Ramparts, lighthouse and colonial streets (UNESCO).', 'heritage', ['heritage', 'culture', 'romantic'], 'Galle', 6.0260, 80.2170, 150, 'afternoon', 0),
      a('Unawatuna Beach', 'Sheltered swimming bay.', 'beach', ['beach', 'family'], 'Unawatuna', 6.0094, 80.2497, 180, 'afternoon', 0),
      a('Mirissa whale watching', 'Early boat trip in season (Nov–Apr).', 'nature', ['nature', 'adventure'], 'Mirissa', 5.9483, 80.4716, 300, 'morning', 6000),
      a('Japanese Peace Pagoda', 'Hilltop stupa overlooking Galle bay.', 'spiritual', ['spiritual', 'romantic'], 'Rumassala', 6.0170, 80.2390, 60, 'evening', 0),
      a('Koggala stilt fishermen', 'Iconic coastal scene (often staged for photos).', 'culture', ['culture'], 'Koggala', 5.9850, 80.3270, 45, 'evening', 300),
      a('Handunugoda tea estate', 'Tea tasting at a family estate.', 'nature', ['food', 'nature'], 'Tittagalla', 6.0000, 80.3000, 90, 'morning', 0),
    ],
  },
  {
    slug: 'maldives', name: 'Maldives', region: 'Kaafu Atoll', countryCode: 'MV',
    tagline: 'Overwater villas and house reefs',
    description: 'Coral atolls with world-class snorkelling. Choose between affordable local-island guesthouses (Maafushi, Thulusdhoo) and resort islands reached by speedboat or seaplane.',
    lat: 4.1755, lng: 73.5093, gatewayAirport: 'MLE', timeZone: 'Indian/Maldives', languages: ['Dhivehi', 'English'],
    tags: ['beach', 'island', 'romantic', 'wellness', 'adventure'],
    bestMonths: [11, 12, 1, 2, 3, 4], peakMonths: [12, 1, 2], avoidMonths: [6, 7],
    monthlyTempC: [30, 31, 31, 32, 31, 31, 30, 30, 30, 30, 30, 30], idealDays: [4, 6],
    accessibility: 'moderate', accessibilityNotes: 'Resorts can arrange assistance; boat and seaplane transfers involve steps.',
    scene: 'island', palette: ['#A0E7E5', '#00A6A6', '#FFF1D0'], popularity: 86,
    costProfile: intl([4500, 14000, 45000], [1500, 3500, 9000], [1500, 4000, 12000], 0.3, 0,
      'Free 30-day visa on arrival at last review; complete the IMUGA traveller declaration. Resorts also charge a per-night green tax.'),
    attractions: [
      a('House reef snorkelling', 'Turtles and reef fish right off the beach.', 'nature', ['nature', 'beach', 'adventure'], 'Resort island', 4.1800, 73.5100, 120, 'morning', 0),
      a('Sandbank picnic trip', 'Boat out to a sandbank for a few hours.', 'experience', ['beach', 'romantic'], 'South Malé Atoll', 3.9500, 73.4800, 180, 'afternoon', 3500),
      a('Dolphin sunset cruise', 'Traditional dhoni cruise at dusk.', 'nature', ['romantic', 'nature', 'family'], 'North Malé Atoll', 4.2500, 73.5300, 120, 'evening', 3000),
      a('Malé city walk', 'Fish market, Old Friday Mosque and Sultan Park.', 'culture', ['culture', 'heritage'], 'Malé', 4.1755, 73.5093, 120, 'morning', 0),
      a('Discover scuba dive', 'Beginner dive with a PADI centre.', 'adventure', ['adventure'], 'Resort island', 4.1900, 73.5200, 180, 'morning', 9000),
    ],
  },
  {
    slug: 'kathmandu', name: 'Kathmandu', region: 'Bagmati', countryCode: 'NP',
    tagline: 'Stupas, temple squares and Himalayan views',
    description: 'Seven UNESCO sites in one valley — Durbar squares, Boudhanath and Swayambhunath — plus mountain flights and day hikes. No visa needed for Indian citizens.',
    lat: 27.7172, lng: 85.324, gatewayAirport: 'KTM', timeZone: 'Asia/Kathmandu', languages: ['Nepali', 'Newari', 'English', 'Hindi'],
    tags: ['heritage', 'spiritual', 'mountains', 'culture', 'adventure'],
    bestMonths: [10, 11, 12, 2, 3, 4], peakMonths: [10, 11], avoidMonths: [7, 8],
    monthlyTempC: [19, 21, 25, 28, 29, 29, 28, 28, 28, 26, 23, 20], idealDays: [3, 5],
    accessibility: 'limited', accessibilityNotes: 'Temple sites have steps and uneven paving; traffic and dust in the city.',
    scene: 'mountain', palette: ['#FFC8DD', '#CDB4DB', '#457B9D'], popularity: 64,
    costProfile: intl([1500, 4500, 13000], [700, 1400, 3200], [350, 800, 2000], 0.243, 0,
      'No visa required for Indian citizens; carry a valid passport or Voter ID.'),
    attractions: [
      a('Boudhanath Stupa', 'One of the world’s largest stupas; evening kora.', 'spiritual', ['spiritual', 'heritage'], 'Boudha', 27.7215, 85.3620, 90, 'evening', 450),
      a('Swayambhunath (Monkey Temple)', 'Hilltop stupa with valley views.', 'spiritual', ['spiritual', 'heritage'], 'Swayambhu', 27.7149, 85.2904, 90, 'morning', 120),
      a('Kathmandu Durbar Square', 'Palaces and temples of the old kingdom.', 'heritage', ['heritage', 'culture'], 'Basantapur', 27.7045, 85.3070, 120, 'morning', 600),
      a('Pashupatinath Temple', 'Sacred Hindu temple on the Bagmati.', 'spiritual', ['spiritual', 'heritage'], 'Gaushala', 27.7105, 85.3488, 90, 'afternoon', 600),
      a('Bhaktapur day trip', 'Best-preserved medieval Newar town.', 'heritage', ['heritage', 'culture', 'food'], 'Bhaktapur', 27.6710, 85.4298, 240, 'morning', 900),
      a('Everest mountain flight', 'Early-morning scenic flight (weather permitting).', 'adventure', ['mountains', 'adventure'], 'Tribhuvan Airport', 27.6966, 85.3591, 180, 'morning', 18000),
    ],
  },
  {
    slug: 'da-nang-hoi-an', name: 'Da Nang & Hoi An', region: 'Central Vietnam', countryCode: 'VN',
    tagline: 'Lantern-lit old town and golden beaches',
    description: 'Modern Da Nang’s beaches and Marble Mountains, the Golden Bridge in Ba Na Hills, and UNESCO-listed Hoi An with its tailors and lantern-lit river.',
    lat: 16.0544, lng: 108.2022, gatewayAirport: 'DAD', timeZone: 'Asia/Ho_Chi_Minh', languages: ['Vietnamese', 'English'],
    tags: ['beach', 'heritage', 'food', 'culture', 'romantic', 'family'],
    bestMonths: [2, 3, 4, 5, 6, 7, 8], peakMonths: [6, 7], avoidMonths: [10, 11],
    monthlyTempC: [25, 26, 29, 31, 33, 34, 34, 34, 32, 29, 27, 25], idealDays: [4, 6],
    accessibility: 'moderate', accessibilityNotes: 'Hoi An old town is flat and partly pedestrianised.',
    scene: 'heritage', palette: ['#FFD6A5', '#FF9F1C', '#2EC4B6'], popularity: 69,
    costProfile: intl([1500, 4200, 12000], [700, 1500, 3800], [400, 900, 2200], 0.155, 2200,
      'e-Visa (USD 25 single entry) at last review — apply only on the official portal.'),
    attractions: [
      a('Hoi An Ancient Town', 'Japanese Bridge, assembly halls and lantern streets.', 'heritage', ['heritage', 'culture', 'romantic'], 'Hoi An', 15.8770, 108.3270, 180, 'evening', 1000),
      a('Ba Na Hills & Golden Bridge', 'Cable car to the hand-held bridge.', 'landmark', ['family', 'mountains'], 'Ba Na', 15.9950, 107.9960, 360, 'morning', 2600),
      a('Marble Mountains', 'Limestone hills with caves and pagodas.', 'spiritual', ['spiritual', 'nature'], 'Ngu Hanh Son', 16.0040, 108.2640, 120, 'morning', 150),
      a('My Khe Beach', 'Long sandy city beach.', 'beach', ['beach', 'family'], 'Da Nang', 16.0610, 108.2470, 150, 'afternoon', 0),
      a('Hoi An cooking class & basket boat', 'Market tour, coconut boat ride and cooking.', 'food', ['food', 'culture', 'family'], 'Cam Thanh', 15.8840, 108.3600, 240, 'morning', 2200),
      a('Dragon Bridge fire show', 'Weekend fire and water show (Sat–Sun 21:00).', 'experience', ['city', 'family'], 'Da Nang', 16.0612, 108.2270, 45, 'evening', 0),
    ],
  },
  {
    slug: 'kuala-lumpur', name: 'Kuala Lumpur', region: 'Federal Territory', countryCode: 'MY',
    tagline: 'Petronas towers, hawker stalls and rainforest',
    description: 'Malaysia’s capital mixes skyline icons, Batu Caves, colonial quarters, superb food courts and day trips to Genting or Malacca.',
    lat: 3.139, lng: 101.6869, gatewayAirport: 'KUL', timeZone: 'Asia/Kuala_Lumpur', languages: ['Malay', 'English', 'Tamil', 'Mandarin'],
    tags: ['city', 'food', 'shopping', 'family', 'culture'],
    bestMonths: [1, 2, 5, 6, 7, 8], peakMonths: [12], avoidMonths: [11],
    monthlyTempC: [32, 33, 33, 33, 33, 33, 32, 32, 32, 32, 32, 32], idealDays: [3, 4],
    accessibility: 'moderate', accessibilityNotes: 'Malls and LRT are accessible; Batu Caves has 272 steps.',
    scene: 'city', palette: ['#CAFFBF', '#9BF6FF', '#3A0CA3'], popularity: 75,
    costProfile: intl([2200, 5500, 15000], [800, 1600, 4000], [400, 800, 2000], 0.2, 0,
      'Visa exemption for Indian tourists for short stays at last review; complete the free MDAC arrival card.'),
    attractions: [
      a('Petronas Twin Towers skybridge', 'Skybridge and observation deck.', 'landmark', ['city', 'family'], 'KLCC', 3.1579, 101.7116, 90, 'morning', 1900),
      a('Batu Caves', 'Limestone temple caves and the giant Murugan statue.', 'spiritual', ['spiritual', 'culture'], 'Gombak', 3.2379, 101.6840, 120, 'morning', 0),
      a('Jalan Alor night food street', 'Satay, noodles and durian stalls.', 'food', ['food', 'nightlife'], 'Bukit Bintang', 3.1460, 101.7090, 120, 'evening', 800),
      a('Merdeka Square & Central Market', 'Colonial buildings and crafts.', 'heritage', ['heritage', 'shopping'], 'Old KL', 3.1478, 101.6953, 120, 'afternoon', 0),
      a('KL Bird Park & Lake Gardens', 'Walk-in aviary in Perdana Botanical Gardens.', 'nature', ['nature', 'family'], 'Tasik Perdana', 3.1430, 101.6880, 150, 'morning', 1300),
      a('Genting Highlands day trip', 'Cable car, cool air and theme park.', 'theme_park', ['family', 'mountains'], 'Genting', 3.4236, 101.7932, 420, 'morning', 3500),
    ],
  },
];
