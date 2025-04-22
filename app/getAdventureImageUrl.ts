// Remove fs and path imports for browser safety

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export async function getAdventureImageUrl(adventureId: string, prompt: string, name: string): Promise<string> {
  // On client, just return the path
  if (typeof window !== 'undefined') {
    return `/adventures/${sanitizeFilename(name)}.png`;
  }
  // On server, use an absolute URL for fetch
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/adventure-image?adventureId=${adventureId}&prompt=${encodeURIComponent(prompt)}&name=${encodeURIComponent(name)}`);
  if (!res.ok) {
    // If the API route is not found or returns an error, fallback to a placeholder image
    console.error('Failed to generate image:', res.status, res.statusText);
    return `/images/placeholder.png`;
  }
  try {
    const data = await res.json();
    return data.url;
  } catch {
    // If response is not JSON, fallback to placeholder
    return `/images/placeholder.png`;
  }
}
