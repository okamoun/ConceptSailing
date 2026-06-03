import { NextRequest, NextResponse } from 'next/server';
import type { AdventureItineraryDay } from '@/app/adventures-data';

const SYSTEM_PROMPT = `You are a luxury yacht charter itinerary designer for BlueOne, a Fountaine Pajot Aura 51 catamaran in the Greek islands.
Given a current itinerary (array of day objects) and a modification prompt, return ONLY a valid JSON array of updated day objects.
Each day must have: title (string), description (string), features (string[]), lat (number), lng (number).
Do not include any text outside the JSON array.`;

export async function POST(request: NextRequest) {
  const { default: OpenAI } = await import('openai');

  let body: { itinerary?: AdventureItineraryDay[]; prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }
  if (!Array.isArray(body.itinerary) || body.itinerary.length === 0) {
    return NextResponse.json({ error: 'Missing or empty itinerary' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const userContent = `Current itinerary:\n${JSON.stringify(body.itinerary, null, 2)}\n\nModification request: ${body.prompt}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON', raw }, { status: 500 });
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'AI returned unexpected format (expected array)', raw }, { status: 500 });
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'OpenAI request failed', details: msg }, { status: 500 });
  }
}
