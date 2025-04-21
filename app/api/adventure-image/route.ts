import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const IMAGE_DIR_JPG = path.join(process.cwd(), 'public', 'adventures');
const IMAGE_DIR_PNG = path.join(process.cwd(), 'public', 'adventures/OpenAI');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adventureId = searchParams.get('adventureId');
  const prompt = searchParams.get('prompt');
  const name = searchParams.get('name');

  if (!adventureId) {
    return NextResponse.json({ error: 'Missing adventureId' }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Missing adventure name' }, { status: 400 });
  }
  const fileName_jpg = sanitizeFilename(name) + '.jpg';
  const filePath_jpg = path.join(IMAGE_DIR_JPG, fileName_jpg);
  if (fs.existsSync(filePath_jpg)) {
    return NextResponse.json({ url: `/adventures/${fileName_jpg}` }, { status: 200 });
  }

  const fileName = sanitizeFilename(name) + '.png';
  const filePath = path.join(IMAGE_DIR_PNG, fileName);
  if (fs.existsSync(filePath)) {
    return NextResponse.json({ url: `/adventures/OpenAI/${fileName}` }, { status: 200 });
  }

  try {
    const aiResponse = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'b64_json',
    });
    const imageData = aiResponse.data[0].b64_json;
    if (!imageData) {
      return NextResponse.json({ error: 'No image data returned from OpenAI' }, { status: 500 });
    }
    if (!fs.existsSync(IMAGE_DIR_PNG)) {
      fs.mkdirSync(IMAGE_DIR_PNG, { recursive: true });
    }
    fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));
    return NextResponse.json({ url: `/adventures/OpenAI/${fileName}` }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Image generation failed', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Image generation failed', details: String(error) }, { status: 500 });
  }
}
