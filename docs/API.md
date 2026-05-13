# API Routes Reference

All API routes live under `app/api/` and follow the Next.js App Router `route.ts` convention.

---

## `GET /api/adventure-image`

Generates (or returns a cached) adventure image using OpenAI DALL-E.

**File:** `app/api/adventure-image/route.ts`

### Query Parameters

| Parameter | Required | Description |
|---|---|---|
| `adventureId` | Yes | Unique ID of the adventure |
| `name` | Yes | Adventure name — used to derive the cache filename |
| `prompt` | Yes | Image generation prompt passed to OpenAI |

### Behaviour

1. Sanitises `name` into a safe filename (lowercase alphanumeric + underscores)
2. Checks `public/adventures/<name>.jpg` — returns immediately if found
3. Checks `public/adventures/OpenAI/<name>.png` — returns immediately if found
4. Calls OpenAI `images.generate` (512×512, `b64_json` format)
5. Writes the result to `public/adventures/OpenAI/<name>.png`
6. Returns the public URL

### Responses

```jsonc
// 200 — cache hit or successful generation
{ "url": "/adventures/OpenAI/wind_sports_adventure.png" }

// 400 — missing parameter
{ "error": "Missing adventureId" }

// 500 — OpenAI failure
{ "error": "Image generation failed", "details": "..." }
```

### Environment variable required
`OPENAI_API_KEY` (server-side only — no `NEXT_PUBLIC_` prefix)

---

## `GET /api/generate-missing-experience-images`

Bulk-generates images for all adventures that are missing a cached image file. Intended for admin/maintenance use.

**File:** `app/api/generate-missing-experience-images/route.ts`

### Query Parameters

| Parameter | Required | Default | Description |
|---|---|---|---|
| `id` | No | — | Limit generation to a single adventure by ID |
| `prompt` | No | Auto-generated | Override the image prompt for all processed adventures |
| `force` | No | `false` | Set to `1` or `true` to delete existing cached images and regenerate |

### Behaviour

1. Loads all adventures from `app/adventures-data.ts`
2. Filters to `id` if provided
3. For each adventure, checks whether the image file exists on disk
4. If missing (or `force=true`), deletes any existing cached file then calls `getAdventureImageUrl()` which internally hits `/api/adventure-image`
5. Returns a summary of every adventure processed

### Response

```jsonc
{
  "ok": true,
  "count": 12,
  "results": [
    {
      "id": "1",
      "name": "Wind Sports Adventure",
      "before": "/adventures/wind_sports_adventure.jpg",
      "after": "/adventures/wind_sports_adventure.jpg",
      "generated": false
    },
    {
      "id": "2",
      "name": "Birthday Celebration at Sea",
      "before": undefined,
      "after": "/adventures/OpenAI/birthday_celebration_at_sea.png",
      "generated": true
    }
  ]
}
```

### Environment variable required
`OPENAI_API_KEY`

---

## Helper: `getAdventureImageUrl`

**File:** `app/getAdventureImageUrl.ts`

Not an HTTP route — a server-side TypeScript helper called internally by API routes.

```ts
getAdventureImageUrl(adventureId: string, prompt: string, name: string): Promise<string>
```

Fetches `/api/adventure-image` with the given parameters and returns the resolved image URL. Used by `generate-missing-experience-images` to avoid duplicating the caching logic.
