import { NextResponse } from 'next/server';
import adventures from '../../adventures-data';
import { getAdventureImageUrl } from '../../getAdventureImageUrl';
import path from 'path';
import fs from 'fs';

function isImageMissing(imagePath: string | undefined): boolean {
  if (!imagePath) return true;
  if (!imagePath.startsWith('/')) return true;
  const publicPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
  try {
    return !fs.existsSync(publicPath);
  } catch {
    return true;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const onlyId = url.searchParams.get('id') ?? undefined;
  const promptOverride = url.searchParams.get('prompt') ?? undefined;
  const force = (url.searchParams.get('force') ?? '').toLowerCase() === '1' || (url.searchParams.get('force') ?? '').toLowerCase() === 'true';
  const results: Array<{ id: string; name: string; before?: string; after: string; generated: boolean; error?: string }> = [];

  const list = onlyId ? adventures.filter(a => a.id === onlyId) : adventures;
  for (const adv of list) {
    try {
      let generated = false;
      let finalUrl = adv.image;

      if (force) {
        const sanitize = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const base = sanitize(adv.name);
        const jpgPath = path.join(process.cwd(), 'public', 'adventures', `${base}.jpg`);
        const pngPath = path.join(process.cwd(), 'public', 'adventures', `${base}.png`);
        const openaiPngPath = path.join(process.cwd(), 'public', 'adventures', 'OpenAI', `${base}.png`);
        for (const p of [jpgPath, pngPath, openaiPngPath]) {
          try {
            if (fs.existsSync(p)) fs.unlinkSync(p);
          } catch {}
        }
      }

      if (force || isImageMissing(adv.image)) {
        const safeYachtPrompt = `Photo-realistic luxury sailing catamaran on the Aegean Sea at golden hour, inspired by professional yacht photography. Emphasize elegant lines, blue water, soft sunset light, no text, no logos, family-friendly travel photo. Theme: ${adv.name}. Description details: ${adv.experience}`;
        const prompt = promptOverride ?? safeYachtPrompt;
        finalUrl = await getAdventureImageUrl(adv.id, prompt, adv.name);
        generated = true;
      }

      results.push({ id: adv.id, name: adv.name, before: adv.image, after: finalUrl, generated });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      results.push({ id: adv.id, name: adv.name, before: adv.image, after: adv.image, generated: false, error: message });
    }
  }

  return NextResponse.json({ ok: true, count: results.length, results });
}
