import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { featureIconMap } from '../../feature-icons';
import { newStopId, type ClientItineraryStop } from '../../../lib/clientSpace';

// Coerce whatever the AI hands back into well-formed stops. Keeps the original
// id when the AI echoes it so React keys / map markers stay stable; otherwise
// mints a new one. Omits lat/lng when absent so Firestore never sees undefined.
function normaliseStops(rawStops: Array<Record<string, unknown>>): ClientItineraryStop[] {
  return rawStops.map((s, i) => {
    const stop: ClientItineraryStop = {
      id: typeof s.id === 'string' && s.id ? s.id : newStopId(),
      order: typeof s.order === 'number' ? s.order : i,
      title: String(s.title ?? ''),
      description: String(s.description ?? ''),
      features: Array.isArray(s.features) ? (s.features as unknown[]).map(String) : [],
    };
    if (typeof s.lat === 'number') stop.lat = s.lat;
    if (typeof s.lng === 'number') stop.lng = s.lng;
    return stop;
  });
}

export async function POST(request: NextRequest) {
  const { stops, message } = (await request.json()) as {
    stops?: ClientItineraryStop[];
    message?: string;
  };

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  }

  const currentStops = Array.isArray(stops) ? stops : [];
  const knownFeatures = Object.keys(featureIconMap);

  const prompt = `You are the itinerary planner for BlueOne, a luxury catamaran chartering in the Greek islands.
Here is the client's current itinerary as JSON:
${JSON.stringify(currentStops, null, 2)}

The client asks: "${message.trim()}"

Apply their request to the itinerary and return ONLY a JSON object of the form:
{ "stops": [ { "id": string, "order": number, "title": string, "description": string, "features": string[], "lat": number, "lng": number } ], "reply": string }

Rules:
- Keep each unchanged stop's existing "id". Real Greek-island geography only, with accurate "lat"/"lng".
- If the request does not call for any itinerary change, return the stops exactly as given and explain that in "reply".
- "reply" is one or two short, friendly sentences confirming what you changed (or that nothing changed).
- Prefer these activity labels for "features" when one fits: ${knownFeatures.join(', ')}.
- No markdown, no explanation outside the JSON.`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    if (!raw) {
      return NextResponse.json({ error: 'Itinerary chat failed', details: 'Empty AI response' }, { status: 500 });
    }
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(jsonStr) as { stops?: Array<Record<string, unknown>>; reply?: string };

    const revised = Array.isArray(parsed.stops) && parsed.stops.length > 0
      ? normaliseStops(parsed.stops)
      : currentStops;
    const reply = typeof parsed.reply === 'string' && parsed.reply.trim()
      ? parsed.reply.trim()
      : 'I have updated your itinerary.';

    return NextResponse.json({ stops: revised, reply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Itinerary chat failed', details: msg }, { status: 500 });
  }
}
