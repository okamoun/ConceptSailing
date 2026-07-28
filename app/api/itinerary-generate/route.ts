import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import adventures from '../../adventures-data';
import { featureIconMap } from '../../feature-icons';
import { makeItineraryStops, type ClientItinerary } from '../../../lib/clientSpace';

// The charter fields this route needs to seed an itinerary. The client passes
// its already-loaded Charter so the route never has to touch Firestore.
interface CharterInput {
  startDate?: string;   // 'YYYY-MM-DD'
  endDate?: string;     // 'YYYY-MM-DD'
  boat?: string;
  passengers?: number;
  embarkationPoint?: string;
  selectedTheme?: string;   // Adventure.id
  holidayDescription?: string;
}

// Number of nights between two ISO dates, floored at 1 when unknown.
function tripDays(start?: string, end?: string): number {
  if (!start || !end) return 7;
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return days > 0 ? days + 1 : 7;
}

export async function POST(request: NextRequest) {
  const { charter } = (await request.json()) as { charter?: CharterInput };

  if (!charter) {
    return NextResponse.json({ error: 'Missing charter' }, { status: 400 });
  }

  // Fast path: if the booking already has a theme, copy that theme's static
  // itinerary directly — no AI call, instant and free.
  if (charter.selectedTheme) {
    const adventure = adventures.find(a => a.id === charter.selectedTheme);
    if (adventure) {
      const itinerary: ClientItinerary = {
        source: 'theme',
        sourceThemeId: adventure.id,
        stops: makeItineraryStops(adventure.itinerary),
        generatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ itinerary });
    }
  }

  const days = tripDays(charter.startDate, charter.endDate);
  const knownFeatures = Object.keys(featureIconMap);

  const prompt = `You are the itinerary planner for BlueOne, a luxury Fountaine Pajot Aura 51 catamaran chartering in the Greek islands.
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

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    if (!raw) {
      return NextResponse.json({ error: 'Itinerary generation failed', details: 'Empty AI response' }, { status: 500 });
    }
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(jsonStr) as { stops?: Array<Record<string, unknown>> };
    const rawStops = Array.isArray(parsed.stops) ? parsed.stops : [];
    if (rawStops.length === 0) {
      return NextResponse.json({ error: 'Itinerary generation failed', details: 'No stops returned' }, { status: 500 });
    }

    const itinerary: ClientItinerary = {
      source: 'ai',
      stops: makeItineraryStops(
        rawStops.map(s => ({
          title: String(s.title ?? ''),
          description: String(s.description ?? ''),
          features: Array.isArray(s.features) ? (s.features as unknown[]).map(String) : [],
          lat: typeof s.lat === 'number' ? s.lat : undefined,
          lng: typeof s.lng === 'number' ? s.lng : undefined,
        })),
      ),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ itinerary });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Itinerary generation failed', details: msg }, { status: 500 });
  }
}
