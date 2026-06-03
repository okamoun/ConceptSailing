import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a luxury yacht charter experience designer for BlueOne, a Fountaine Pajot Aura 51 catamaran operating in the Greek islands.
Given a user prompt, return ONLY a valid JSON object with these fields:
  name (string), description (short tagline ≤ 120 chars), experience (marketing paragraph ≤ 400 chars),
  itinerary (array of exactly 7 days: { title: string, description: string, features: string[], lat: number, lng: number }),
  features (array of 6–10 strings).
Use real Greek island coordinates. Do not include any text outside the JSON.`;

export async function POST(request: NextRequest) {
  const { default: OpenAI } = await import('openai');

  let body: { prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: body.prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON', raw }, { status: 500 });
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'OpenAI request failed', details: msg }, { status: 500 });
  }
}
