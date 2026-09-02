import { haversineKm } from '../../../marinas-data';
import type { ClientItineraryStop } from '../../../../lib/clientSpace';

// Average cruising speed used to estimate sailing time between stops. The
// BlueOne Aura 51 comfortably averages this under sail or motor over a leg.
export const CRUISE_SPEED_KN = 7;

// Straight-line great-circle distance (nautical miles) between two stops, or
// null when either stop is missing coordinates.
export function straightLegNm(a?: ClientItineraryStop, b?: ClientItineraryStop): number | null {
  if (!a || !b || typeof a.lat !== 'number' || typeof a.lng !== 'number' || typeof b.lat !== 'number' || typeof b.lng !== 'number') {
    return null;
  }
  return haversineKm(a.lat, a.lng, b.lat, b.lng) / 1.852;
}

// Sailing distance (nautical miles) of the leg a→b, or null when either stop
// is missing coordinates. Prefers the real sea-routed distance cached on the
// arriving stop `b` (see /api/itinerary-route) — `b.routedNm` is the routed
// length of its inbound leg, i.e. the a→b leg, since stops are always visited
// in order. Falls back to the straight-line estimate when no routed value has
// been computed yet or routing failed, so the UI is never blocked.
export function legNm(a?: ClientItineraryStop, b?: ClientItineraryStop): number | null {
  const straight = straightLegNm(a, b);
  if (straight == null) return null;
  if (b && typeof b.routedNm === 'number' && Number.isFinite(b.routedNm) && b.routedNm >= 0) {
    return b.routedNm;
  }
  return straight;
}

// The bundled Eurostat maritime network is coarse (~20 km resolution), so for
// the short legs typical in the Greek islands the snapped endpoints can sit
// closer together than the true stops, occasionally yielding a routed length
// *shorter* than the straight line between the real coordinates — which is
// never physically right. Clamp so the routed distance can only ever be longer
// than (or equal to) the straight-line distance: a genuine detour around land
// is kept, a snap artefact never makes a leg shorter than the rhumb line.
export function reconcileRoutedNm(routedNm: number, straightNm: number): number {
  return Math.max(routedNm, straightNm);
}

// Only draw a leg's routed polyline when the route is a genuine detour — its
// length is at least the straight-line distance. A coarse-network snap can
// produce a routed path *shorter* than the rhumb line; drawing that would
// contradict the (clamped) distance shown for the leg, so such legs are left to
// fall back to the dashed straight line on the map instead.
export function shouldDrawRoutedPath(routedLengthNm: number, straightNm: number): boolean {
  return Number.isFinite(routedLengthNm) && Number.isFinite(straightNm) && routedLengthNm >= straightNm;
}

// A compact signature of the ordered stop coordinates. Changes whenever a stop
// is added, removed, reordered, or its coordinates change — but not when an
// unrelated field (title, notes) is edited. Used to decide when sea routing
// needs recomputing without recomputing on every keystroke.
export function coordSignature(stops: ClientItineraryStop[]): string {
  return stops
    .map(s => (typeof s.lat === 'number' && typeof s.lng === 'number' ? `${s.id}:${s.lat},${s.lng}` : `${s.id}:-`))
    .join('|');
}

// Merge the { stopId → routedNm } and { stopId → routedPath } maps (from
// /api/itinerary-route) back onto the stops. A stop present in the maps gets
// its `routedNm`/`routedPath` set; a stop absent from a map has the stale
// value removed entirely (never left as `undefined` — Firestore rejects
// undefined field values).
export function applyRoutedNm(
  stops: ClientItineraryStop[],
  routed: Record<string, number>,
  paths: Record<string, { lat: number; lng: number }[]> = {},
): ClientItineraryStop[] {
  return stops.map(s => {
    const next = { ...s };

    const nm = routed[s.id];
    if (typeof nm === 'number' && Number.isFinite(nm)) next.routedNm = nm;
    else delete next.routedNm;

    const path = paths[s.id];
    if (Array.isArray(path) && path.length >= 2) next.routedPath = path;
    else delete next.routedPath;

    return next;
  });
}

// Signature of the routed data (distance + polyline length), to detect whether
// a fresh routing result actually changed anything before persisting it.
export function routedSignature(stops: ClientItineraryStop[]): string {
  return stops.map(s => `${s.id}:${s.routedNm ?? ''}:${s.routedPath?.length ?? ''}`).join('|');
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
