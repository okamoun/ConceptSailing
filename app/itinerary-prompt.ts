import { featureIconMap } from './feature-icons';
import adventures from './adventures-data';
import { getMarinaById } from './marinas-data';

export interface ItineraryPromptCharter {
  startDate?: string;
  endDate?: string;
  embarkationPoint?: string;    // free-text embarkation comment from the booking
  disembarkationPort?: string;  // free-text disembarkation comment
  deliveryPoint?: string;       // marina id (delivery)
  redeliveryPoint?: string;     // marina id (redelivery)
  passengers?: number;
  boat?: string;
  selectedTheme?: string;       // Adventure.id chosen at booking
  holidayDescription?: string;  // the client's free-text wishes/comments
}

// Number of days a trip spans, inclusive; falls back to 7 when unknown.
export function tripDays(start?: string, end?: string): number {
  if (!start || !end) return 7;
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return days > 0 ? days + 1 : 7;
}

function fmtLongDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function monthName(iso?: string): string {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { month: 'long' });
}

// Resolve an embarkation/disembarkation location from the booking: prefer the
// free-text comment, fall back to the named marina behind the marina id.
function resolvePlace(freeText?: string, marinaId?: string): string {
  const text = freeText?.trim();
  if (text) return text;
  if (marinaId) return getMarinaById(marinaId)?.name ?? marinaId;
  return '';
}

// Build the OpenAI prompt for AI itinerary generation. Pulls the full booking
// context — dates, embarkation/disembarkation, guests, the chosen theme and
// the client's comments. Shared by the client (so the user can preview/edit it)
// and the API route (the default when no edited prompt is sent), keeping the
// two exactly in sync.
export function buildItineraryPrompt(charter: ItineraryPromptCharter): string {
  const days = tripDays(charter.startDate, charter.endDate);
  const knownFeatures = Object.keys(featureIconMap);

  const embark = resolvePlace(charter.embarkationPoint, charter.deliveryPoint) || 'Athens (Alimos Marina)';
  const disembark = resolvePlace(charter.disembarkationPort, charter.redeliveryPoint) || embark;

  const datesLine = charter.startDate
    ? `- Dates: ${fmtLongDate(charter.startDate)}${charter.endDate ? ` to ${fmtLongDate(charter.endDate)}` : ''} (${days} day(s), sailing in ${monthName(charter.startDate)})`
    : `- Duration: ${days} day(s)`;

  const theme = charter.selectedTheme ? adventures.find(a => a.id === charter.selectedTheme) : undefined;
  const themeBlock = theme
    ? `\nChosen experience theme: "${theme.name}" — ${theme.description}
${theme.experience}${theme.features?.length ? `\nTheme highlights: ${theme.features.join(', ')}.` : ''}
Plan the itinerary in the spirit of this theme.`
    : '';

  const preferences = charter.holidayDescription?.trim() || 'a relaxed mix of sailing, swimming and local culture';

  return `You are the itinerary planner for BlueOne, a luxury Fountaine Pajot Aura 51 catamaran chartering in the Greek islands.
Design a day-by-day sailing itinerary using real Greek-island geography (accurate town/island names and coordinates).

Trip details (from the client's booking):
${datesLine}
- Embarkation: ${embark}
- Disembarkation: ${disembark}
- Guests: ${charter.passengers ?? 2}${charter.boat ? `\n- Yacht: ${charter.boat}` : ''}
- Client wishes / comments: ${preferences}${themeBlock}

Return ONLY a JSON object of the form:
{ "stops": [ { "title": string, "description": string, "features": string[], "lat": number, "lng": number } ] }

Rules:
- Produce roughly one stop per day (${days} stops), starting near ${embark} and ending near ${disembark}.
- Keep the daily sailing distances realistic for the season and the ${days}-day window.
- "lat"/"lng" must be the real coordinates of each stop.
- "features" are 1-3 short activity highlights. Prefer these existing labels wherever one fits, only inventing a new label when none is suitable: ${knownFeatures.join(', ')}.
- No markdown, no explanation — JSON only.`;
}
