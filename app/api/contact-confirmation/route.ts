import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CONTACT } from '../../config/contact';

export interface ContactConfirmationRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  const { name, email, phone, message } = (await request.json()) as ContactConfirmationRequest;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing name, email, or message' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are the guest-relations assistant for BlueOne, a luxury yacht charter (Fountaine Pajot Aura 51 catamaran) sailing the Greek islands, operated by ${CONTACT.company.name} out of ${CONTACT.company.location}.

A prospective guest has just submitted an information request through the website. Write a warm, concise confirmation email body (plain text, no subject line) acknowledging that we have received their request and will respond shortly. Requirements:
- Address the guest by their first name.
- Confirm we received their enquiry and briefly, naturally restate what they asked about so they know we read it.
- Keep an elegant, welcoming, professional tone that fits a luxury sailing brand. No emojis, no marketing hype.
- 2 short paragraphs maximum.
- Sign off as "The BlueOne Team" and include the contact phone ${CONTACT.phone.formatted} and email ${CONTACT.email} in the closing.
- Do not invent prices, dates, or availability.

Guest details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || 'not provided'}
- Their message: "${message}"`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const confirmation = response.choices[0]?.message?.content?.trim() ?? '';
    if (!confirmation) {
      return NextResponse.json({ error: 'No message returned from OpenAI' }, { status: 500 });
    }

    return NextResponse.json({ message: confirmation });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Confirmation generation failed', details: msg }, { status: 500 });
  }
}
