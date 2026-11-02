import {
  addDays,
  estimateLocalTravelMinutes,
  minutesToTime,
  timeToMinutes,
  TRAVEL_PACES,
  type AttractionDto,
  type Coordinates,
  type ItineraryDay,
  type ItineraryStop,
} from '@trippilot/shared';
import type { ItineraryGenerator, ItineraryGeneratorInput, ItineraryGeneratorOutput } from './types';

const DAY_START: Record<string, string> = { relaxed: '09:30', balanced: '09:00', packed: '08:00' };
const LATEST_END = timeToMinutes('21:30');
const MAX_LEG_MINUTES = 100;
const LUNCH_AFTER = timeToMinutes('12:45');
const BEST_TIME_ORDER = { morning: 0, any: 1, afternoon: 2, evening: 3 } as const;

const travel = (a: Coordinates, b: Coordinates) => estimateLocalTravelMinutes(a, b);

function interestScore(a: AttractionDto, interests: string[], index: number): number {
  const overlap = a.tags.filter((t) => interests.includes(t)).length;
  // Earlier entries in the catalogue are the destination's headline sights.
  return overlap * 5 + Math.max(0, 6 - index) * 0.5;
}

/**
 * Deterministic, explainable itinerary planner over the sample catalogue.
 * Greedy geographic clustering keeps each day in one area, and every slot is
 * timed with conservative travel estimates so schedules stay achievable.
 */
export class SampleItineraryGenerator implements ItineraryGenerator {
  id = 'sample-rule-based-v1';
  label = 'TripPilot sample planner (rule-based)';
  kind = 'rule_based' as const;

  async generate(input: ItineraryGeneratorInput): Promise<ItineraryGeneratorOutput> {
    const { destination, nights, pace, interests, startDate } = input;
    const hotel: Coordinates = { lat: destination.lat, lng: destination.lng };
    const totalDays = nights + 1;
    const paceCfg = TRAVEL_PACES.find((p) => p.id === pace)!;
    const notes: string[] = [];

    const scored = destination.attractions
      .map((a, i) => ({ a, score: interestScore(a, interests, i) }))
      .sort((x, y) => y.score - x.score);
    const used = new Set<string>();

    const days: ItineraryDay[] = [];
    for (let d = 0; d < totalDays; d++) {
      const isArrival = d === 0;
      const isDeparture = d === totalDays - 1;
      const date = addDays(startDate, d);

      // Capacity (minutes of activity + travel) available today.
      let windowStart: string;
      let capacity: number;
      if (isArrival) {
        windowStart = '15:00';
        capacity = Math.min(240, paceCfg.activityMinutes * 0.45);
      } else if (isDeparture) {
        windowStart = DAY_START[pace]!;
        capacity = 150;
      } else {
        windowStart = DAY_START[pace]!;
        capacity = paceCfg.activityMinutes;
      }

      const picks = this.pickForDay(scored, used, hotel, capacity, { isArrival, isDeparture });
      picks.forEach((p) => used.add(p.id));
      const stops = this.schedule(picks, hotel, windowStart, { isArrival, isDeparture, date });
      const attractionStops = stops.filter((s) => s.kind === 'attraction');

      const areas = [...new Set(picks.map((p) => p.area))];
      const title = isArrival
        ? `Arrive in ${destination.name}`
        : isDeparture
          ? 'Departure day'
          : areas.length
            ? areas.slice(0, 2).join(' & ')
            : 'Free day';

      const dayNotes: string[] = [];
      const firstStop = attractionStops[0];
      if (!isArrival && firstStop && timeToMinutes(firstStop.startTime) >= timeToMinutes('13:00')) {
        dayNotes.push('Morning at leisure — today’s highlight is best later in the day.');
      }
      if (!isArrival && !isDeparture && attractionStops.length === 0) {
        dayNotes.push('Nothing scheduled — a free day to rest, revisit favourites or add your own plans.');
      }
      days.push({
        dayNumber: d + 1,
        date,
        title,
        area: areas[0],
        stops,
        totalActivityMinutes: attractionStops.reduce((s, x) => s + x.durationMinutes, 0),
        totalTravelMinutes: stops.reduce((s, x) => s + x.travelMinutesFromPrevious, 0),
        notes: dayNotes,
      });
    }

    const unused = scored.filter((s) => !used.has(s.a.id)).length;
    if (unused > 0) notes.push(`${unused} more attraction${unused > 1 ? 's' : ''} could fit a longer trip or faster pace.`);
    if (input.transport && input.transport.durationMinutes > 8 * 60) {
      notes.push('Your journey is long — the arrival day is kept deliberately light.');
    }
    return { days, notes };
  }

  private pickForDay(
    scored: { a: AttractionDto; score: number }[],
    used: Set<string>,
    hotel: Coordinates,
    capacity: number,
    flags: { isArrival: boolean; isDeparture: boolean },
  ): AttractionDto[] {
    const available = scored.filter((s) => !used.has(s.a.id));
    const fitsSlot = (a: AttractionDto) => {
      if (flags.isArrival) return a.durationMinutes <= 150 && a.bestTime !== 'morning' && travel(hotel, a) <= 45;
      if (flags.isDeparture) return a.durationMinutes <= 120 && a.bestTime !== 'evening' && travel(hotel, a) <= 40;
      return true;
    };

    // Full days may host a longer day trip; the scheduler still enforces the 21:30 cut-off.
    const slack = flags.isArrival || flags.isDeparture ? 30 : 120;
    const seed = available.find((s) => fitsSlot(s.a) && s.a.durationMinutes + travel(hotel, s.a) * 2 <= capacity + slack);
    if (!seed) return [];
    const picks = [seed.a];
    let remaining = capacity - seed.a.durationMinutes - travel(hotel, seed.a);
    if (flags.isDeparture) return picks; // one easy stop before leaving

    while (remaining > 45) {
      const last = picks[picks.length - 1]!;
      let best: { a: AttractionDto; cost: number } | null = null;
      for (const s of available) {
        if (picks.includes(s.a) || !fitsSlot(s.a)) continue;
        const leg = travel(last, s.a);
        if (leg > MAX_LEG_MINUTES) continue;
        const need = leg + s.a.durationMinutes;
        if (need > remaining) continue;
        // Prefer close-by, high-interest stops.
        const cost = leg - s.score * 8;
        if (!best || cost < best.cost) best = { a: s.a, cost };
      }
      if (!best) break;
      remaining -= travel(last, best.a) + best.a.durationMinutes;
      picks.push(best.a);
    }
    return picks.sort((x, y) => BEST_TIME_ORDER[x.bestTime] - BEST_TIME_ORDER[y.bestTime]);
  }

  private schedule(
    picks: AttractionDto[],
    hotel: Coordinates,
    windowStart: string,
    flags: { isArrival: boolean; isDeparture: boolean; date: string },
  ): ItineraryStop[] {
    const stops: ItineraryStop[] = [];
    let clock = timeToMinutes(windowStart);
    let prev: Coordinates = hotel;
    let hadLunch = flags.isArrival; // arrival day: lunch on the way
    let idx = 0;
    const id = () => `${flags.date}-${idx++}`;

    if (flags.isArrival) {
      stops.push({
        id: id(), kind: 'arrival', title: 'Arrive, transfer & check in',
        description: 'Standard hotel check-in is usually from 14:00.',
        startTime: '13:00', durationMinutes: 120, travelMinutesFromPrevious: 0,
        costPerPerson: 0, confidence: 'estimate',
      });
    }

    for (const a of picks) {
      const leg = travel(prev, a);
      if (!hadLunch && clock + leg >= LUNCH_AFTER) {
        stops.push({
          id: id(), kind: 'meal', title: 'Lunch break', description: 'Local restaurant near your last stop.',
          startTime: minutesToTime(clock), durationMinutes: 60, travelMinutesFromPrevious: 0,
          costPerPerson: 0, confidence: 'estimate',
        });
        clock += 60;
        hadLunch = true;
      }
      let start = clock + leg;
      if (a.bestTime === 'evening' && start < timeToMinutes('16:30')) {
        const gap = timeToMinutes('16:30') - start;
        const isFirst = !stops.some((s) => s.kind === 'attraction');
        if (gap >= 45 && !isFirst) {
          const coversLunch = !hadLunch && clock <= timeToMinutes('13:30') && clock + gap >= timeToMinutes('13:30');
          stops.push({
            id: id(), kind: 'free_time', title: coversLunch ? 'Lunch & free time' : 'Free time / rest at the hotel',
            startTime: minutesToTime(clock), durationMinutes: gap, travelMinutesFromPrevious: 0,
            costPerPerson: 0, confidence: 'estimate',
          });
          if (coversLunch) hadLunch = true;
        }
        start = timeToMinutes('16:30');
        clock = start - leg;
      }
      if (start + a.durationMinutes > LATEST_END) continue; // never schedule past 21:30
      stops.push({
        id: id(), kind: 'attraction', title: a.name, description: a.description,
        startTime: minutesToTime(start), durationMinutes: a.durationMinutes, travelMinutesFromPrevious: leg,
        location: { lat: a.lat, lng: a.lng, name: a.area }, costPerPerson: a.pricePerPerson,
        confidence: 'sample', tags: a.tags, attractionId: a.id,
      });
      clock = start + a.durationMinutes;
      prev = a;
    }

    if (flags.isDeparture) {
      const leaveAt = Math.max(clock + (picks.length ? 20 : 0), timeToMinutes('11:00'));
      stops.push({
        id: id(), kind: 'departure', title: 'Check out & transfer for your journey home',
        description: 'Allow at least 2 hours at the airport for domestic and 3 hours for international flights.',
        startTime: minutesToTime(leaveAt), durationMinutes: 60, travelMinutesFromPrevious: picks.length ? travel(prev, hotel) : 0,
        costPerPerson: 0, confidence: 'estimate',
      });
      // Make sure the departure doesn't overlap the travel back from the last stop.
      const last = stops[stops.length - 1]!;
      const prevStop = stops[stops.length - 2];
      if (prevStop) {
        const earliest = timeToMinutes(prevStop.startTime) + prevStop.durationMinutes + last.travelMinutesFromPrevious;
        if (timeToMinutes(last.startTime) < earliest) last.startTime = minutesToTime(earliest);
      }
    }
    return stops;
  }
}
