// Remove fs and path imports for browser safety

import OpenAI from 'openai';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

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
  const fileName_jpg = sanitizeFilename(name) + '.jpg';
  const filePath_jpg = path.join(process.cwd(), 'public', 'adventures', fileName_jpg);
  if (fs.existsSync(filePath_jpg)) {
    return `/adventures/${fileName_jpg}`;
  }

  const fileName = sanitizeFilename(name) + '.png';
  const filePath = path.join(process.cwd(), 'public', 'adventures/OpenAI', fileName);
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
    if (!fs.existsSync(path.join(process.cwd(), 'public', 'adventures/OpenAI'))) {
      fs.mkdirSync(path.join(process.cwd(), 'public', 'adventures/OpenAI'), { recursive: true });
    }
    fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));
    return `/adventures/OpenAI/${fileName}`;
  } catch (error: unknown) {
    console.error('Image generation failed', error);
    return `/images/placeholder.png`;
  }
}
