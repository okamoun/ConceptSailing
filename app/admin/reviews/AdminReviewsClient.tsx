'use client';

import { useEffect, useState } from 'react';
import { getAllReviews, adminDeleteReview, updateReviewOrder } from '../../../lib/reviews';
import type { Review } from '../../../lib/reviews';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminReviewsClient() {
  const { hasPermission } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  useEffect(() => {
    setLoading(true);
    getAllReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    await adminDeleteReview(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  async function handleOrderChange(id: string, delta: number) {
    const idx = reviews.findIndex(r => r.id === id);
    if (idx < 0) return;
    const newOrder = (reviews[idx].order ?? 0) + delta;
    await updateReviewOrder(id, newOrder);
    setReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, order: newOrder } : r);
      return [...updated].sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
    });
  }

  const visible = reviews.filter(r => filter === 'all' || r.status === filter);

  if (!hasPermission('reviews')) {
    return (
      <main className="px-4 py-6 flex items-center justify-center min-h-64">
        <div className="text-center space-y-2">
          <p className="text-white font-semibold text-lg">Access denied</p>
          <p className="text-blue-300 text-sm">You do not have permission to view this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl">Reviews Admin</h1>
            <p className="text-blue-200 text-xs mt-0.5">{reviews.length} total reviews</p>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'confirmed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-white/25 text-white' : 'text-blue-200 hover:text-white border border-white/20'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-blue-200 text-sm text-center animate-pulse">Loading…</p>}

        {!loading && visible.length === 0 && (
          <p className="text-blue-200 text-sm text-center">No reviews found.</p>
        )}

        <div className="space-y-3">
          {visible.map((r) => (
            <div key={r.id} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'confirmed' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'}`}>
                      {r.status}
                    </span>
                    <StarRating value={r.rating} readonly size="sm" />
                    <span className="text-blue-300 text-xs">{r.name} · {r.email}</span>
                  </div>
                  <p className="text-white text-sm font-semibold">{r.title}</p>
                  <p className="text-blue-100 text-xs leading-relaxed mt-1 line-clamp-3">{r.description}</p>
                  {r.photos && r.photos.length > 0 && (
                    <p className="text-blue-300 text-xs mt-1">{r.photos.length} photo{r.photos.length > 1 ? 's' : ''}</p>
                  )}
                  <p className="text-blue-400 text-xs mt-1">
                    Created: {r.createdAt?.toDate?.()?.toLocaleString() ?? '—'} · Order weight: {r.order ?? 0}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOrderChange(r.id, 1)}
                    title="Increase order (show earlier)"
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center border border-white/20 transition-colors"
                  >↑</button>
                  <button
                    onClick={() => handleOrderChange(r.id, -1)}
                    title="Decrease order (show later)"
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center border border-white/20 transition-colors"
                  >↓</button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    title="Delete review"
                    className="w-8 h-8 rounded-lg bg-red-600/50 hover:bg-red-500 text-white text-sm flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
