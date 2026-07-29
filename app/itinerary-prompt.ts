import { featureIconMap } from './feature-icons';

export interface ItineraryPromptCharter {
  startDate?: string;
  endDate?: string;
  embarkationPoint?: string;
  passengers?: number;
  holidayDescription?: string;
}

// Number of days a trip spans, inclusive; falls back to 7 when unknown.
export function tripDays(start?: string, end?: string): number {
  if (!start || !end) return 7;
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return days > 0 ? days + 1 : 7;
}

// Build the OpenAI prompt for AI itinerary generation. Shared by the client
// (so the user can preview/edit it) and the API route (the default when the
// client doesn't send an edited prompt), keeping the two exactly in sync.
export function buildItineraryPrompt(charter: ItineraryPromptCharter): string {
  const days = tripDays(charter.startDate, charter.endDate);
  const knownFeatures = Object.keys(featureIconMap);
  return `You are the itinerary planner for BlueOne, a luxury Fountaine Pajot Aura 51 catamaran chartering in the Greek islands.
Design a day-by-day sailing itinerary using real Greek-island geography (accurate town/island names and coordinates).

Trip details:
- Duration: ${days} day(s)
- Embarkation point: ${charter.embarkationPoint || 'Athens (Alimos Marina)'}
- Guests: ${charter.passengers ?? 2}
- Guest preferences: ${charter.holidayDescription || 'a relaxed mix of sailing, swimming and local culture'}

Return ONLY a JSON object of the form:
{ "stops": [ { "title": string, "description": string, "features": string[], "lat": number, "lng": number } ] }

Rules:
- Produce roughly one stop per day (${days} stops), starting and ending near the embarkation point.
- "lat"/"lng" must be the real coordinates of each stop.
- "features" are 1-3 short activity highlights. Prefer these existing labels wherever one fits, only inventing a new label when none is suitable: ${knownFeatures.join(', ')}.
- No markdown, no explanation — JSON only.`;
}
