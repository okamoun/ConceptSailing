'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  type CustomExperience,
} from '@/lib/experiences';
import type { AdventureItineraryDay } from '@/app/adventures-data';

const EMPTY_ITINERARY: AdventureItineraryDay[] = Array.from({ length: 7 }, () => ({
  title: '',
  description: '',
  features: [],
  lat: undefined,
  lng: undefined,
}));

function emptyForm(): Omit<CustomExperience, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    experience: '',
    itinerary: EMPTY_ITINERARY.map(d => ({ ...d })),
    features: [],
    image: '',
    partnerName: '',
    partnerUrl: '',
    prompt: '',
    aiGenerated: false,
  };
}

interface Props {
  id: string;
}

export default function ExperienceEditorClient({ id }: Props) {
  const isNew = id === 'new';
  const router = useRouter();

  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // AI generation state
  const [genPrompt, setGenPrompt] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [modPrompt, setModPrompt] = useState('');
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError] = useState('');

  // Image generation state
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState('');

  const load = useCallback(async () => {
    if (isNew) return;
    try {
      const exp = await getExperienceById(id);
      if (!exp) {
        setError('Experience not found.');
        return;
      }
      setForm({
        name: exp.name,
        description: exp.description,
        experience: exp.experience,
        itinerary: exp.itinerary?.length ? exp.itinerary : EMPTY_ITINERARY.map(d => ({ ...d })),
        features: exp.features ?? [],
        image: exp.image ?? '',
        partnerName: exp.partnerName ?? '',
        partnerUrl: exp.partnerUrl ?? '',
        prompt: exp.prompt ?? '',
        aiGenerated: exp.aiGenerated ?? false,
      });
    } catch {
      setError('Failed to load experience.');
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => { load(); }, [load]);

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function setItineraryDay(idx: number, patch: Partial<AdventureItineraryDay>) {
    setForm(prev => {
      const updated = [...prev.itinerary];
      updated[idx] = { ...updated[idx], ...patch };
      return { ...prev, itinerary: updated };
    });
  }

  function setItineraryDayFeatures(idx: number, raw: string) {
    const features = raw.split(',').map(f => f.trim()).filter(Boolean);
    setItineraryDay(idx, { features });
  }

  // Generate full experience from prompt
  async function handleGenerate() {
    if (!genPrompt.trim()) return;
    setGenLoading(true);
    setGenError('');
    try {
      const res = await fetch('/api/generate-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: genPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error ?? 'Generation failed.');
        return;
      }
      setForm(prev => ({
        ...prev,
        name: data.name ?? prev.name,
        description: data.description ?? prev.description,
        experience: data.experience ?? prev.experience,
        itinerary: Array.isArray(data.itinerary) && data.itinerary.length
          ? data.itinerary
          : prev.itinerary,
        features: Array.isArray(data.features) && data.features.length
          ? data.features
          : prev.features,
        prompt: genPrompt,
        aiGenerated: true,
      }));
    } catch {
      setGenError('Network error during generation.');
    } finally {
      setGenLoading(false);
    }
  }

  // Modify itinerary only
  async function handleModifyItinerary() {
    if (!modPrompt.trim()) return;
    setModLoading(true);
    setModError('');
    try {
      const res = await fetch('/api/modify-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: form.itinerary, prompt: modPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModError(data.error ?? 'Modification failed.');
        return;
      }
      if (Array.isArray(data)) {
        setField('itinerary', data);
      } else {
        setModError('Unexpected response format.');
      }
    } catch {
      setModError('Network error during modification.');
    } finally {
      setModLoading(false);
    }
  }

  // Generate image
  async function handleGenerateImage() {
    if (!form.name) {
      setImgError('Set a name first.');
      return;
    }
    setImgLoading(true);
    setImgError('');
    try {
      const prompt = `Luxury yacht sailing adventure: ${form.name}. ${form.description}. Greek islands, Mediterranean, luxury catamaran, cinematic photography.`;
      const name = form.name;
      const adventureId = isNew ? 'custom-new' : `custom-${id}`;
      const url = `/api/adventure-image?adventureId=${encodeURIComponent(adventureId)}&prompt=${encodeURIComponent(prompt)}&name=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setImgError(data.error ?? 'Image generation failed.');
        return;
      }
      setField('image', data.url);
    } catch {
      setImgError('Network error during image generation.');
    } finally {
      setImgLoading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        experience: form.experience.trim(),
        itinerary: form.itinerary,
        features: form.features,
        image: form.image?.trim() || undefined,
        partnerName: form.partnerName?.trim() || undefined,
        partnerUrl: form.partnerUrl?.trim() || undefined,
        prompt: form.prompt?.trim() || undefined,
        aiGenerated: form.aiGenerated,
      };

      if (isNew) {
        const newId = await createExperience(payload);
        setSuccess('Experience created!');
        router.replace(`/admin/experiences/${newId}`);
      } else {
        await updateExperience(id, payload);
        setSuccess('Saved!');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteExperience(id);
      router.push('/admin/experiences');
    } catch {
      setError('Delete failed.');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-950/80 flex items-center justify-center">
        <p className="text-blue-300 animate-pulse">Loading…</p>
      </div>
    );
  }

  const sectionClass = 'bg-white/10 border border-white/20 rounded-xl p-5 space-y-4';
  const labelClass = 'block text-blue-200 text-xs font-medium mb-1';
  const inputClass = 'w-full bg-white/10 border border-white/20 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400';
  const textareaClass = `${inputClass} resize-none`;
  const btnPrimary = 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors';
  const btnSecondary = 'bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors';

  return (
    <div className="min-h-screen bg-blue-950/80 px-4 py-8 pt-16">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/experiences')}
              className="text-blue-400 hover:text-white text-xs mb-1 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Experiences
            </button>
            <h1 className="text-2xl font-bold text-white">
              {isNew ? 'New Experience' : `Edit: ${form.name || '…'}`}
            </h1>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <a
                href={`/themes/custom-${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={btnSecondary}
              >
                Preview
              </a>
            )}
            <button onClick={handleSave} disabled={saving} className={btnPrimary}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-900/50 hover:bg-red-800/60 disabled:opacity-50 text-red-300 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/40 text-red-200 text-sm rounded-lg px-4 py-3">{error}</div>
        )}
        {success && (
          <div className="bg-green-900/50 border border-green-500/40 text-green-200 text-sm rounded-lg px-4 py-3">{success}</div>
        )}

        {/* AI Generation */}
        <details className={sectionClass} open={isNew}>
          <summary className="cursor-pointer text-white font-semibold text-sm flex items-center gap-2">
            <span className="bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs px-2 py-0.5 rounded-full">AI</span>
            AI Generation
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Generate full experience from prompt</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. A romantic sunset cruise around Santorini with wine tasting"
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                />
                <button
                  onClick={handleGenerate}
                  disabled={genLoading || !genPrompt.trim()}
                  className={`${btnPrimary} whitespace-nowrap flex items-center gap-2`}
                >
                  {genLoading && (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {genLoading ? 'Generating…' : 'Generate'}
                </button>
              </div>
              {genError && <p className="text-red-300 text-xs mt-1">{genError}</p>}
            </div>

            <div>
              <label className={labelClass}>Modify itinerary only</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Add a dolphin watching day, replace day 4 with wine tasting on Santorini"
                  value={modPrompt}
                  onChange={e => setModPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleModifyItinerary()}
                />
                <button
                  onClick={handleModifyItinerary}
                  disabled={modLoading || !modPrompt.trim()}
                  className={`${btnSecondary} whitespace-nowrap flex items-center gap-2`}
                >
                  {modLoading && (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {modLoading ? 'Modifying…' : 'Modify Itinerary'}
                </button>
              </div>
              {modError && <p className="text-red-300 text-xs mt-1">{modError}</p>}
            </div>
          </div>
        </details>

        {/* Basic fields */}
        <div className={sectionClass}>
          <h2 className="text-white font-semibold text-sm">Basic Info</h2>

          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Experience name"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Short tagline (≤ 120 chars)</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Short tagline"
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              maxLength={150}
            />
          </div>

          <div>
            <label className={labelClass}>Marketing paragraph</label>
            <textarea
              className={textareaClass}
              rows={4}
              placeholder="Longer marketing description"
              value={form.experience}
              onChange={e => setField('experience', e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Features (comma-separated)</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Sailing, Island hopping, Snorkeling"
              value={form.features.join(', ')}
              onChange={e => setField('features', e.target.value.split(',').map(f => f.trim()).filter(Boolean))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Partner name (optional)</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Meerapfel"
                value={form.partnerName ?? ''}
                onChange={e => setField('partnerName', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Partner URL (optional)</label>
              <input
                type="url"
                className={inputClass}
                placeholder="https://partner.com"
                value={form.partnerUrl ?? ''}
                onChange={e => setField('partnerUrl', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className={sectionClass}>
          <h2 className="text-white font-semibold text-sm">Image</h2>

          {form.image && (
            <div className="relative h-40 w-full rounded-lg overflow-hidden">
              <Image src={form.image} alt="Experience image" fill className="object-cover" sizes="600px" />
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className={labelClass}>Image path</label>
              <input
                type="text"
                className={inputClass}
                placeholder="/adventures/OpenAI/my_experience.png"
                value={form.image ?? ''}
                onChange={e => setField('image', e.target.value)}
              />
            </div>
            <button
              onClick={handleGenerateImage}
              disabled={imgLoading || !form.name}
              className={`${btnSecondary} whitespace-nowrap flex items-center gap-2`}
            >
              {imgLoading && (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {imgLoading ? 'Generating…' : 'Generate Image'}
            </button>
          </div>
          {imgError && <p className="text-red-300 text-xs">{imgError}</p>}
        </div>

        {/* Itinerary */}
        <div className={sectionClass}>
          <h2 className="text-white font-semibold text-sm">Day-by-Day Itinerary ({form.itinerary.length} days)</h2>
          <div className="space-y-4">
            {form.itinerary.map((day, i) => (
              <div key={i} className="bg-white/5 border border-white/15 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder={`Day ${i + 1} title`}
                    value={day.title}
                    onChange={e => setItineraryDay(i, { title: e.target.value })}
                  />
                </div>
                <textarea
                  className={textareaClass}
                  rows={2}
                  placeholder="Day description"
                  value={day.description}
                  onChange={e => setItineraryDay(i, { description: e.target.value })}
                />
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Features (comma-separated)"
                  value={(day.features ?? []).join(', ')}
                  onChange={e => setItineraryDayFeatures(i, e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-blue-300 text-xs mb-0.5 block">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className={inputClass}
                      placeholder="e.g. 37.9838"
                      value={day.lat ?? ''}
                      onChange={e => setItineraryDay(i, { lat: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <label className="text-blue-300 text-xs mb-0.5 block">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className={inputClass}
                      placeholder="e.g. 23.7275"
                      value={day.lng ?? ''}
                      onChange={e => setItineraryDay(i, { lng: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setField('itinerary', [...form.itinerary, { title: '', description: '', features: [] }])}
              className={btnSecondary}
            >
              + Add Day
            </button>
            {form.itinerary.length > 1 && (
              <button
                onClick={() => setField('itinerary', form.itinerary.slice(0, -1))}
                className="bg-white/5 hover:bg-white/10 text-white/50 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                − Remove Last Day
              </button>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-4 pb-8">
          <button onClick={() => router.push('/admin/experiences')} className={btnSecondary}>
            Cancel
          </button>
          <div className="flex gap-2">
            {!isNew && (
              <button onClick={handleDelete} disabled={deleting} className="bg-red-900/50 hover:bg-red-800/60 disabled:opacity-50 text-red-300 text-sm px-4 py-2 rounded-lg transition-colors">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
            <button onClick={handleSave} disabled={saving} className={btnPrimary}>
              {saving ? 'Saving…' : isNew ? 'Create Experience' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
