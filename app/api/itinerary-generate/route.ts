import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import adventures from '../../adventures-data';
import { makeItineraryStops, type ClientItinerary } from '../../../lib/clientSpace';
import { buildItineraryPrompt } from '../../itinerary-prompt';

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

// Assign one stop per day from the charter start, clamped so any extra stops
// land on the final day. No-op when the charter has no start date.
function withDates(
  stops: ReturnType<typeof makeItineraryStops>,
  start?: string,
  end?: string,
): ReturnType<typeof makeItineraryStops> {
  if (!start) return stops;
  const maxOffset = end
    ? Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000))
    : stops.length - 1;
  return stops.map((s, i) => {
    const d = new Date(start + 'T00:00:00');
    d.setDate(d.getDate() + Math.min(i, maxOffset));
    return { ...s, date: d.toISOString().slice(0, 10) };
  });
}

export async function POST(request: NextRequest) {
  const { charter, prompt: promptOverride } = (await request.json()) as {
    charter?: CharterInput;
    prompt?: string;
  };

  if (!charter) {
    return NextResponse.json({ error: 'Missing charter' }, { status: 400 });
  }

  const hasOverride = typeof promptOverride === 'string' && promptOverride.trim().length > 0;

  // Fast path: when the booking has a theme and the client hasn't supplied an
  // edited prompt, copy that theme's static itinerary directly — no AI call.
  // An explicit prompt always means the user wants AI generation instead.
  if (!hasOverride && charter.selectedTheme) {
    const adventure = adventures.find(a => a.id === charter.selectedTheme);
    if (adventure) {
      const itinerary: ClientItinerary = {
        source: 'theme',
        sourceThemeId: adventure.id,
        stops: withDates(makeItineraryStops(adventure.itinerary), charter.startDate, charter.endDate),
        generatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ itinerary });
    }
  }

  // Use the client's edited prompt when provided, otherwise build the default.
  const prompt = hasOverride ? (promptOverride as string) : buildItineraryPrompt(charter);

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
      stops: withDates(
        makeItineraryStops(
          rawStops.map(s => ({
            title: String(s.title ?? ''),
            description: String(s.description ?? ''),
            features: Array.isArray(s.features) ? (s.features as unknown[]).map(String) : [],
            lat: typeof s.lat === 'number' ? s.lat : undefined,
            lng: typeof s.lng === 'number' ? s.lng : undefined,
          })),
        ),
        charter.startDate,
        charter.endDate,
      ),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ itinerary });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Itinerary generation failed', details: msg }, { status: 500 });
  }
}
