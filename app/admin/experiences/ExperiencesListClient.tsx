'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCustomExperiences, deleteExperience, type CustomExperience } from '@/lib/experiences';

export default function ExperiencesListClient() {
  const [experiences, setExperiences] = useState<CustomExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getAllCustomExperiences();
      list.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() ?? 0;
        const bTime = b.createdAt?.toMillis() ?? 0;
        return bTime - aTime;
      });
      setExperiences(list);
    } catch {
      setError('Failed to load experiences.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteExperience(id);
      setExperiences(prev => prev.filter(e => e.id !== id));
    } catch {
      setError('Failed to delete experience.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-blue-950/80 px-4 py-8 pt-16">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">AI Experiences</h1>
            <p className="text-blue-300 text-sm">
              Create and manage custom AI-generated sailing experiences.
            </p>
          </div>
          <Link
            href="/admin/experiences/new"
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Experience
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-500/40 text-red-200 text-sm rounded-lg px-4 py-3 flex items-center justify-between gap-4">
            <span>{error}</span>
            <button onClick={() => { setError(''); load(); }} className="text-red-300 hover:text-white text-xs underline whitespace-nowrap">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-blue-300 text-sm text-center py-20 animate-pulse">Loading experiences…</div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-blue-300 text-sm mb-4">No custom experiences yet.</p>
            <Link
              href="/admin/experiences/new"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Create your first experience
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map(exp => (
              <div
                key={exp.id}
                className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-xl px-4 py-3"
              >
                <div className="relative h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-blue-900/50">
                  {exp.image ? (
                    <Image src={exp.image} alt={exp.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-400 text-xs">No image</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-semibold truncate">{exp.name}</span>
                    {exp.aiGenerated && (
                      <span className="bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs px-2 py-0.5 rounded-full">AI</span>
                    )}
                  </div>
                  <p className="text-blue-300 text-xs truncate mt-0.5">{exp.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/themes/custom-${exp.id}`}
                    target="_blank"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/admin/experiences/${exp.id}`}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(exp.id, exp.name)}
                    disabled={deleting === exp.id}
                    className="bg-red-900/50 hover:bg-red-800/60 disabled:opacity-50 text-red-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {deleting === exp.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
