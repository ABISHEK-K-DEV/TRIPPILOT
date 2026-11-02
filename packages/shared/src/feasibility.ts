import { MAX_DAY_MINUTES } from './constants';
import { timeToMinutes } from './time';
import type { FeasibilityIssue, ItineraryDay, TravelPace } from './types';

export const LATEST_END_MINUTES = 22 * 60 + 30; // 22:30
export const MAX_SINGLE_LEG_MINUTES = 150;

/**
 * Validate a day-by-day plan for impossible schedules: overlapping stops,
 * unrealistic travel legs, overloaded days and very late finishes.
 */
export function checkItineraryFeasibility(days: ItineraryDay[], pace: TravelPace): FeasibilityIssue[] {
  const issues: FeasibilityIssue[] = [];
  const cap = MAX_DAY_MINUTES[pace];

  for (const day of days) {
    let prevEnd: number | null = null;
    let scheduled = 0;
    for (const stop of day.stops) {
      const start = timeToMinutes(stop.startTime);
      if (prevEnd !== null && start < prevEnd + stop.travelMinutesFromPrevious) {
        issues.push({
          dayNumber: day.dayNumber,
          severity: 'error',
          message: `"${stop.title}" starts before you can get there from the previous stop.`,
        });
      }
      if (stop.travelMinutesFromPrevious > MAX_SINGLE_LEG_MINUTES) {
        issues.push({
          dayNumber: day.dayNumber,
          severity: 'warning',
          message: `Getting to "${stop.title}" takes about ${Math.round(stop.travelMinutesFromPrevious / 60)}h — consider splitting the day.`,
        });
      }
      prevEnd = start + stop.durationMinutes;
      if (stop.kind !== 'arrival' && stop.kind !== 'departure' && stop.kind !== 'free_time') {
        scheduled += stop.durationMinutes + stop.travelMinutesFromPrevious;
      }
    }
    if (prevEnd !== null && prevEnd > LATEST_END_MINUTES) {
      issues.push({ dayNumber: day.dayNumber, severity: 'warning', message: 'This day finishes very late.' });
    }
    if (scheduled > cap) {
      issues.push({
        dayNumber: day.dayNumber,
        severity: 'warning',
        message: `Day ${day.dayNumber} has ${Math.round(scheduled / 60)}h planned — more than a ${pace} pace allows.`,
      });
    }
  }
  return issues;
}
