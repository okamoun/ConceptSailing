'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  getAllPhotoMeta,
  savePhotoMeta,
  mergeWithDefaults,
  type PhotoMeta,
} from '@/lib/photos';
import { type ImageCategory } from '@/app/constants/boat-images';

const CATEGORIES: ImageCategory[] = ['exterior', 'interior', 'cockpit', 'drone', 'activities', 'food'];

const CATEGORY_LABELS: Record<ImageCategory, string> = {
  exterior: '🌊 Exterior',
  interior: '🛏️ Interior',
  cockpit: '🍽️ Cockpit & Dining',
  drone: '🛩️ Aerial / Drone',
  activities: '🏄 Activities',
  food: '🥗 Culinary',
};

const CATEGORY_COLORS: Record<ImageCategory, string> = {
  exterior: 'bg-blue-600',
  interior: 'bg-amber-600',
  cockpit: 'bg-orange-600',
  drone: 'bg-purple-600',
  activities: 'bg-green-600',
  food: 'bg-red-600',
};

type FilterMode = 'all' | ImageCategory | 'key';

export default function PhotosClient() {
  const [photos, setPhotos] = useState<PhotoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const overrides = await getAllPhotoMeta();
      setPhotos(mergeWithDefaults(overrides));
    } catch {
      setError('Failed to load photo metadata.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCategoryChange(photo: PhotoMeta, category: ImageCategory) {
    const updated = { ...photo, category };
    setPhotos(prev => prev.map(p => p.id === photo.id ? updated : p));
    setSaving(photo.id);
    try {
      await savePhotoMeta(updated);
      flashSuccess(photo.id);
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(null);
    }
  }

  async function handleKeyPhotoToggle(photo: PhotoMeta) {
    const updated = { ...photo, keyPhoto: !photo.keyPhoto };
    setPhotos(prev => prev.map(p => p.id === photo.id ? updated : p));
    setSaving(photo.id);
    try {
      await savePhotoMeta(updated);
      flashSuccess(photo.id);
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(null);
    }
  }

  async function handleTitleChange(photo: PhotoMeta, title: string) {
    const updated = { ...photo, title };
    setPhotos(prev => prev.map(p => p.id === photo.id ? updated : p));
  }

  async function handleTitleBlur(photo: PhotoMeta) {
    setSaving(photo.id);
    try {
      await savePhotoMeta(photo);
      flashSuccess(photo.id);
    } catch {
      setError('Save failed.');
    } finally {
      setSaving(null);
    }
  }

  function flashSuccess(id: string) {
    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 1500);
  }

  const filtered = photos.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'key') return p.keyPhoto;
    return p.category === filter;
  });

  const keyCount = photos.filter(p => p.keyPhoto).length;

  return (
    <div className="min-h-screen bg-blue-950/80 px-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Photo Manager</h1>
          <p className="text-blue-300 text-sm">
            Assign categories and flag key photos shown in the Yacht screen slideshow.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-500/40 text-red-200 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-white/10 rounded-lg px-4 py-2 text-white text-sm">
            <span className="font-bold text-lg">{photos.length}</span>
            <span className="text-white/60 ml-1">total photos</span>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-4 py-2 text-yellow-200 text-sm">
            <span className="font-bold text-lg">{keyCount}</span>
            <span className="ml-1">key photos (yacht screen)</span>
          </div>
          {CATEGORIES.map(cat => {
            const count = photos.filter(p => p.category === cat).length;
            return (
              <div key={cat} className="bg-white/5 rounded-lg px-3 py-2 text-white/70 text-xs">
                {CATEGORY_LABELS[cat]} <span className="font-bold text-white">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'key', ...CATEGORIES] as (FilterMode)[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
                filter === f
                  ? 'bg-white text-blue-900'
                  : 'bg-white/10 text-white/70 hover:bg-white/20',
              ].join(' ')}
            >
              {f === 'all' ? `All (${photos.length})` :
               f === 'key' ? `⭐ Key Photos (${keyCount})` :
               `${CATEGORY_LABELS[f as ImageCategory]} (${photos.filter(p => p.category === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-blue-300 text-sm text-center py-20 animate-pulse">Loading photos…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(photo => (
              <div
                key={photo.id}
                className={[
                  'relative rounded-xl overflow-hidden border-2 transition-all duration-200 bg-black/30',
                  photo.keyPhoto
                    ? 'border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.4)]'
                    : 'border-white/10 hover:border-white/30',
                  successId === photo.id ? 'scale-[1.02]' : '',
                ].join(' ')}
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] bg-blue-900/50">
                  <Image
                    src={photo.src}
                    alt={photo.alt ?? photo.id}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    loading="lazy"
                  />

                  {/* Saving spinner overlay */}
                  {saving === photo.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Success flash */}
                  {successId === photo.id && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none">
                      <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Key photo badge */}
                  {photo.keyPhoto && (
                    <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      ⭐ KEY
                    </div>
                  )}

                  {/* Category badge */}
                  <div className={`absolute top-1.5 right-1.5 ${CATEGORY_COLORS[photo.category]} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full`}>
                    {photo.category}
                  </div>
                </div>

                {/* Controls */}
                <div className="p-2 space-y-2">
                  {/* Title input */}
                  <input
                    type="text"
                    value={photo.title ?? ''}
                    placeholder="Title…"
                    onChange={e => handleTitleChange(photo, e.target.value)}
                    onBlur={() => handleTitleBlur(photo)}
                    className="w-full bg-white/10 border border-white/15 text-white text-xs rounded px-2 py-1 placeholder-white/30 focus:outline-none focus:border-blue-400"
                  />

                  {/* Category select */}
                  <select
                    value={photo.category}
                    onChange={e => handleCategoryChange(photo, e.target.value as ImageCategory)}
                    className="w-full bg-blue-900 border border-white/15 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>

                  {/* Key photo toggle */}
                  <button
                    onClick={() => handleKeyPhotoToggle(photo)}
                    className={[
                      'w-full py-1.5 rounded text-xs font-semibold transition-colors',
                      photo.keyPhoto
                        ? 'bg-yellow-500 hover:bg-yellow-400 text-yellow-900'
                        : 'bg-white/10 hover:bg-white/20 text-white/70',
                    ].join(' ')}
                  >
                    {photo.keyPhoto ? '⭐ Key Photo (Yacht Screen)' : '☆ Set as Key Photo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-white/40 py-20 text-sm">No photos match this filter.</div>
        )}
      </div>
    </div>
  );
}
