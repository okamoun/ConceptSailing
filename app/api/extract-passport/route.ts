import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface PassportExtraction {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
}

const NATIONALITY_LIST = [
  'American', 'Australian', 'Austrian', 'Belgian', 'Brazilian', 'British', 'Canadian',
  'Chinese', 'Danish', 'Dutch', 'Finnish', 'French', 'German', 'Greek', 'Irish',
  'Israeli', 'Italian', 'Japanese', 'Norwegian', 'Polish', 'Portuguese', 'Russian',
  'South African', 'Spanish', 'Swedish', 'Swiss', 'Turkish', 'Other',
];

export async function POST(request: NextRequest) {
  const { imageBase64, mimeType } = await request.json() as {
    imageBase64: string;
    mimeType: string;
  };

  if (!imageBase64) {
    return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `You are a passport OCR assistant. Extract the following fields from the passport or identity document image and return ONLY a JSON object with these keys (omit any key you cannot read clearly):
- firstName: given name(s)
- lastName: surname/family name
- gender: must be exactly "Male", "Female", or "Other"
- dateOfBirth: in YYYY-MM-DD format
- nationality: must be one of these values exactly: ${NATIONALITY_LIST.join(', ')}
- passportNumber: the document/passport number

Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '';
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const data: PassportExtraction = JSON.parse(jsonStr);

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Extraction failed', details: msg }, { status: 500 });
  }
}
