// Remove fs and path imports for browser safety

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

const IMAGE_DIR_JPG = path.join(process.cwd(), 'public', 'adventures');
const IMAGE_DIR_PNG = path.join(process.cwd(), 'public', 'adventures/OpenAI');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAdventureImageUrl(adventureId: string, prompt: string, name: string): Promise<string> {
  // On client, just return the path
  if (typeof window !== 'undefined') {
    return `/adventures/${sanitizeFilename(name)}.png`;
  }

  // On server, dynamically import fs and path
  const fs = await import('fs');
  const path = await import('path');
  const IMAGE_DIR_JPG = path.join(process.cwd(), 'public', 'adventures');
  const IMAGE_DIR_PNG = path.join(process.cwd(), 'public', 'adventures/OpenAI');
  const fileName_jpg = sanitizeFilename(name) + '.jpg';
  const filePath_jpg = path.join(IMAGE_DIR_JPG, fileName_jpg);
  if (fs.existsSync(filePath_jpg)) {
    return `/adventures/${fileName_jpg}`;
  }

  const fileName = sanitizeFilename(name) + '.png';
  const filePath = path.join(IMAGE_DIR_PNG, fileName);
  if (fs.existsSync(filePath)) {
    return `/adventures/OpenAI/${fileName}`;
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
      return `/images/placeholder.png`;
    }
    if (!fs.existsSync(IMAGE_DIR_PNG)) {
      fs.mkdirSync(IMAGE_DIR_PNG, { recursive: true });
    }
    fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));
    return `/adventures/OpenAI/${fileName}`;
  } catch (error: unknown) {
    console.error('Image generation failed', error);
    return `/images/placeholder.png`;
  }
}
