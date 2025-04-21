import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const IMAGE_DIR = path.join(process.cwd(), 'public', 'adventures');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { adventureId, prompt } = req.query;
  if (!adventureId || typeof adventureId !== 'string') {
    return res.status(400).json({ error: 'Missing adventureId' });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const filePath = path.join(IMAGE_DIR, `${adventureId}.png`);
  if (fs.existsSync(filePath)) {
    return res.status(200).json({ url: `/adventures/${adventureId}.png` });
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
      return res.status(500).json({ error: 'No image data returned from OpenAI' });
    }
    if (!fs.existsSync(IMAGE_DIR)) {
      fs.mkdirSync(IMAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));
    return res.status(200).json({ url: `/adventures/${adventureId}.png` });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: 'Image generation failed', details: error.message });
    }
    return res.status(500).json({ error: 'Image generation failed', details: String(error) });
  }
}
