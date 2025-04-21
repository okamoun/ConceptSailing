import type { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { adventureId, prompt, name } = req.query;
  if (!adventureId || typeof adventureId !== 'string') {
    return res.status(400).json({ error: 'Missing adventureId' });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing adventure name' });
  }
  const fileName_jpg = sanitizeFilename(name) + '.jpg';
  const filePath_jpg = path.join(IMAGE_DIR_JPG, fileName_jpg);
  if (fs.existsSync(filePath_jpg)) {
    return res.status(200).json({ url: `/adventures/${fileName_jpg}` });
  }

  const fileName = sanitizeFilename(name) + '.png';
  const filePath = path.join(IMAGE_DIR_PNG, fileName);
  if (fs.existsSync(filePath)) {
    return res.status(200).json({ url: `/adventures/OpenAI/${fileName}` });
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
    if (!fs.existsSync(IMAGE_DIR_PNG)) {
      fs.mkdirSync(IMAGE_DIR_PNG, { recursive: true });
    }
    fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));
    return res.status(200).json({ url: `/adventures/OpenAI/${fileName}` });
  } catch (error: any) {
    return res.status(500).json({ error: 'Image generation failed', details: error.message });
  }
}
