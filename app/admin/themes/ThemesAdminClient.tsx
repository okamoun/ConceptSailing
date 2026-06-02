'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import adventures from '@/app/adventures-data';
import type { Adventure } from '@/app/adventures-data';
import {
  getAllThemeMetadata,
  upsertThemeMetadata,
  initializeThemeDefaults,
  resetThemeDefaults,
  THEME_CATEGORIES,
  type ThemeMetadata,
  type ThemeCategory,
} from '@/lib/themes';

type ThemeRow = Adventure & { meta: ThemeMetadata };

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function RowCard({
  row,
  saving,
  success,
  isFirst,
  isLast,
  onCategoryChange,
  onVisibleToggle,
  onFeaturedToggle,
  onMoveUp,
  onMoveDown,
}: {
  row: ThemeRow;
  saving: boolean;
  success: boolean;
  isFirst: boolean;
  isLast: boolean;
  onCategoryChange: (cat: ThemeCategory) => void;
  onVisibleToggle: () => void;
  onFeaturedToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className={[
      'relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
      'bg-white/10 border-white/20',
      !row.meta.visible && 'opacity-50',
    ].filter(Boolean).join(' ')}>
      {/* Thumbnail */}
      <div className="relative h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden">
        <Image src={row.image} alt={row.name} fill className="object-cover" sizes="80px" />
      </div>

      {/* Name + ID */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-semibold truncate">{row.name}</div>
        <div className="text-blue-400 text-xs">#{row.id}</div>
      </div>

      {/* Order controls */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst || saving}
          title="Move up"
          className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <span className="text-white/50 text-xs w-6 text-center">{row.meta.order + 1}</span>
        <button
          onClick={onMoveDown}
          disabled={isLast || saving}
          title="Move down"
          className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Category selector */}
      <select
        value={row.meta.category}
        onChange={e => onCategoryChange(e.target.value as ThemeCategory)}
        disabled={saving}
        className="bg-blue-900 border border-white/15 text-white text-xs rounded px-2 py-1.5 flex-shrink-0 max-w-[160px] disabled:opacity-50"
      >
        {THEME_CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Visibility toggle */}
      <button
        onClick={onVisibleToggle}
        disabled={saving}
        title={row.meta.visible ? 'Hide from public page' : 'Show on public page'}
        className={[
          'w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 flex-shrink-0',
          row.meta.visible
            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
            : 'bg-white/10 text-white/40 hover:bg-white/20',
        ].join(' ')}
      >
        <EyeIcon visible={row.meta.visible} />
      </button>

      {/* Featured toggle */}
      <button
        onClick={onFeaturedToggle}
        disabled={saving}
        title={row.meta.featured ? 'Remove featured' : 'Mark as featured'}
        className={[
          'w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 flex-shrink-0',
          row.meta.featured
            ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
            : 'bg-white/10 text-white/40 hover:bg-white/20',
        ].join(' ')}
      >
        <StarIcon filled={row.meta.featured} />
      </button>

      {/* Saving / success overlay indicator */}
      {saving && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {success && !saving && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function ThemesAdminClient() {
  const [rows, setRows] = useState<ThemeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ThemeCategory | 'all'>('all');
  const [isUninitialized, setIsUninitialized] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const metaList = await getAllThemeMetadata();

      if (metaList.length === 0) {
        setIsUninitialized(true);
        // Show all adventures with placeholder metadata
        const placeholder: ThemeRow[] = adventures.map((adv, i) => ({
          ...adv,
          meta: {
            id: adv.id,
            category: 'Active & Sports' as ThemeCategory,
            order: i,
            visible: true,
            featured: false,
            updatedAt: null,
          },
        }));
        setRows(placeholder);
        return;
      }

      setIsUninitialized(false);
      const metaMap = new Map(metaList.map(m => [m.id, m]));

      const merged: ThemeRow[] = adventures.map((adv, i) => {
        const meta = metaMap.get(adv.id) ?? {
          id: adv.id,
          category: 'Active & Sports' as ThemeCategory,
          order: i,
          visible: true,
          featured: false,
          updatedAt: null,
        };
        return { ...adv, meta };
      });

      merged.sort((a, b) => {
        const catA = a.meta.category ?? '';
        const catB = b.meta.category ?? '';
        const catDiff = catA.localeCompare(catB);
        if (catDiff !== 0) return catDiff;
        return (a.meta.order ?? 0) - (b.meta.order ?? 0);
      });

      setRows(merged);
    } catch (e) {
      console.error('[ThemesAdmin] load failed:', e);
      setError('Failed to load theme metadata.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function flashSuccess(id: string) {
    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 1500);
  }

  async function saveField(id: string, patch: Partial<Omit<ThemeMetadata, 'id' | 'updatedAt'>>) {
    setError('');
    setRows(prev => prev.map(r => r.id === id ? { ...r, meta: { ...r.meta, ...patch } } : r));
    setSaving(id);
    try {
      await upsertThemeMetadata(id, patch);
      flashSuccess(id);
    } catch {
      setError('Save failed. Please try again.');
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function handleMoveUp(row: ThemeRow) {
    setError('');
    const sameCat = rows
      .filter(r => r.meta.category === row.meta.category)
      .sort((a, b) => a.meta.order - b.meta.order);
    const idx = sameCat.findIndex(r => r.id === row.id);
    if (idx <= 0) return;
    const prev = sameCat[idx - 1];
    setSaving(row.id);
    try {
      await Promise.all([
        upsertThemeMetadata(row.id, { order: prev.meta.order }),
        upsertThemeMetadata(prev.id, { order: row.meta.order }),
      ]);
      await load();
    } catch {
      setError('Reorder failed.');
    } finally {
      setSaving(null);
    }
  }

  async function handleMoveDown(row: ThemeRow) {
    setError('');
    const sameCat = rows
      .filter(r => r.meta.category === row.meta.category)
      .sort((a, b) => a.meta.order - b.meta.order);
    const idx = sameCat.findIndex(r => r.id === row.id);
    if (idx >= sameCat.length - 1) return;
    const next = sameCat[idx + 1];
    setSaving(row.id);
    try {
      await Promise.all([
        upsertThemeMetadata(row.id, { order: next.meta.order }),
        upsertThemeMetadata(next.id, { order: row.meta.order }),
      ]);
      await load();
    } catch {
      setError('Reorder failed.');
    } finally {
      setSaving(null);
    }
  }

  async function handleInitialize() {
    if (!confirm('Seed Firestore with the default category assignments? This only runs if the collection is currently empty.')) return;
    setError('');
    setInitializing(true);
    try {
      await initializeThemeDefaults();
      await load();
    } catch {
      setError('Initialization failed.');
    } finally {
      setInitializing(false);
    }
  }

  async function handleReset() {
    if (!confirm('Reset ALL themes to their default categories, order, visibility, and featured status? This will overwrite your current settings.')) return;
    setError('');
    setInitializing(true);
    try {
      await resetThemeDefaults();
      await load();
    } catch {
      setError('Reset failed.');
    } finally {
      setInitializing(false);
    }
  }

  const filteredRows = categoryFilter === 'all'
    ? rows
    : rows.filter(r => r.meta.category === categoryFilter);

  // Precompute first/last within each filtered group for order buttons
  const catRows = new Map<string, string[]>();
  rows.forEach(r => {
    const sorted = catRows.get(r.meta.category) ?? [];
    sorted.push(r.id);
    catRows.set(r.meta.category, sorted);
  });

  return (
    <div className="min-h-screen bg-blue-950/80 px-4 py-8 pt-16">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Themes Manager</h1>
            <p className="text-blue-300 text-sm">
              Control visibility, category, display order, and featured status for each experience.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {isUninitialized && (
              <button
                onClick={handleInitialize}
                disabled={initializing}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {initializing ? 'Initializing…' : 'Initialize Defaults'}
              </button>
            )}
            {!isUninitialized && (
              <button
                onClick={handleReset}
                disabled={initializing}
                title="Overwrite all theme assignments with the original defaults"
                className="bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {initializing ? 'Resetting…' : 'Reset to Defaults'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-500/40 text-red-200 text-sm rounded-lg px-4 py-3 flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={() => { setError(''); load(); }}
              className="text-red-300 hover:text-white text-xs underline whitespace-nowrap flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="bg-white/10 rounded-lg px-4 py-2 text-white text-sm">
            <span className="font-bold text-lg">{rows.length}</span>
            <span className="text-white/60 ml-1">total themes</span>
          </div>
          <div className="bg-green-500/20 border border-green-500/40 rounded-lg px-3 py-2 text-green-200 text-xs">
            <span className="font-bold">{rows.filter(r => r.meta.visible).length}</span> visible
          </div>
          <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white/50 text-xs">
            <span className="font-bold text-white/70">{rows.filter(r => !r.meta.visible).length}</span> hidden
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-3 py-2 text-yellow-200 text-xs">
            <span className="font-bold">{rows.filter(r => r.meta.featured).length}</span> featured
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', ...THEME_CATEGORIES] as const).map(cat => {
            const count = cat === 'all' ? rows.length : rows.filter(r => r.meta.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat as ThemeCategory | 'all')}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                  categoryFilter === cat
                    ? 'bg-white text-blue-900'
                    : 'bg-white/10 text-white/70 hover:bg-white/20',
                ].join(' ')}
              >
                {cat === 'all' ? 'All' : cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="text-blue-300 text-sm text-center py-20 animate-pulse">Loading themes…</div>
        ) : (
          <div className="space-y-2">
            {filteredRows.map(row => {
              const sameCatSorted = (catRows.get(row.meta.category) ?? [])
                .map(id => rows.find(r => r.id === id)!)
                .filter(Boolean)
                .sort((a, b) => a.meta.order - b.meta.order);
              const pos = sameCatSorted.findIndex(r => r.id === row.id);
              return (
                <RowCard
                  key={row.id}
                  row={row}
                  saving={saving === row.id}
                  success={successId === row.id}
                  isFirst={pos === 0}
                  isLast={pos === sameCatSorted.length - 1}
                  onCategoryChange={cat => saveField(row.id, { category: cat, order: 0 })}
                  onVisibleToggle={() => saveField(row.id, { visible: !row.meta.visible })}
                  onFeaturedToggle={() => saveField(row.id, { featured: !row.meta.featured })}
                  onMoveUp={() => handleMoveUp(row)}
                  onMoveDown={() => handleMoveDown(row)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
