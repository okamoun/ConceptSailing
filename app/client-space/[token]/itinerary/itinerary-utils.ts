import { haversineKm } from '../../../marinas-data';
import type { ClientItineraryStop } from '../../../../lib/clientSpace';

// Average cruising speed used to estimate sailing time between stops. The
// BlueOne Aura 51 comfortably averages this under sail or motor over a leg.
export const CRUISE_SPEED_KN = 7;

// Great-circle distance (nautical miles) between two stops, or null when
// either stop is missing coordinates. It's a straight-line estimate — real
// sailing routes are a little longer — hence the "approx" labelling in the UI.
export function legNm(a?: ClientItineraryStop, b?: ClientItineraryStop): number | null {
  if (!a || !b || typeof a.lat !== 'number' || typeof a.lng !== 'number' || typeof b.lat !== 'number' || typeof b.lng !== 'number') {
    return null;
  }
  return haversineKm(a.lat, a.lng, b.lat, b.lng) / 1.852;
}

// Total sailing distance (nm) across every leg with coordinates on both ends.
export function totalNm(stops: ClientItineraryStop[]): number {
  let sum = 0;
  for (let i = 1; i < stops.length; i++) {
    const nm = legNm(stops[i - 1], stops[i]);
    if (nm != null) sum += nm;
  }
  return sum;
}

// ---------------------------------------------------------------------------
// Dates & day grouping
// ---------------------------------------------------------------------------

// Add `days` calendar days to an ISO date ('YYYY-MM-DD'), returning ISO.
export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Whole days between two ISO dates (b - a).
export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
}

// Fill in a default date for any stop that doesn't have one: one stop per day
// from the charter start, clamped so extra stops pile onto the final day.
export function assignSequentialDates(
  stops: ClientItineraryStop[],
  startDate?: string,
  endDate?: string,
): ClientItineraryStop[] {
  if (!startDate) return stops;
  const maxOffset = endDate ? Math.max(0, daysBetween(startDate, endDate)) : stops.length - 1;
  return stops.map((s, i) => (s.date ? s : { ...s, date: addDays(startDate, Math.min(i, maxOffset)) }));
}

export interface ItineraryDay {
  date?: string;       // 'YYYY-MM-DD' when known
  dayNumber: number;   // 1-based day of the trip
  stops: ClientItineraryStop[];
}

// Sailing distance (nm) covered on a given day: the sum of each of the day's
// stops' inbound legs (including the leg arriving from the previous day).
export function dayNavNm(day: ItineraryDay, allStops: ClientItineraryStop[]): number {
  let sum = 0;
  for (const s of day.stops) {
    const gi = allStops.findIndex(x => x.id === s.id);
    if (gi > 0) {
      const nm = legNm(allStops[gi - 1], s);
      if (nm != null) sum += nm;
    }
  }
  return sum;
}

// Group consecutive stops that share a date into day buckets. Stops without a
// date fall back to one bucket each, sequenced from the charter start.
export function groupStopsByDay(stops: ClientItineraryStop[], startDate?: string): ItineraryDay[] {
  const groups: ItineraryDay[] = [];
  for (const s of stops) {
    const date = s.date || (startDate ? addDays(startDate, groups.length) : undefined);
    const last = groups[groups.length - 1];
    if (last && date && last.date === date) {
      last.stops.push(s);
    } else {
      groups.push({ date, dayNumber: 0, stops: [s] });
    }
  }
  groups.forEach((g, idx) => {
    g.dayNumber = startDate && g.date ? daysBetween(startDate, g.date) + 1 : idx + 1;
  });
  return groups;
}
