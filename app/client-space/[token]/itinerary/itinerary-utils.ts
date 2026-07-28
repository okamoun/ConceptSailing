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
