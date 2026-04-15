'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getReviewByToken,
  confirmReview,
  updateReview,
  deleteReview,
} from '../../../lib/reviews';
import type { Review } from '../../../lib/reviews';
import StarRating from '../../components/StarRating';

type Action = 'confirm' | 'edit' | 'delete';

interface Props {
  token: string;
  action: Action;
}

export default function ManageClient({ token, action }: Props) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); setError('Invalid link.'); return; }
    getReviewByToken(token)
      .then(r => {
        if (!r) { setError('Review not found. This link may be expired or already used.'); return; }
        setReview(r);
        setEditTitle(r.title);
        setEditDescription(r.description);
        setEditRating(r.rating);
        setEditName(r.name);
      })
      .catch(() => setError('Failed to load review.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleConfirm() {
    if (!review) return;
    setSaving(true);
    try {
      await confirmReview(review.id);
      setDone(true);
    } catch {
      setError('Failed to confirm. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!review) return;
    setSaving(true);
    try {
      await deleteReview(review.id);
      setDone(true);
    } catch {
      setError('Failed to delete. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!review) return;
    setSaving(true);
    try {
      await updateReview(review.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        rating: editRating,
        name: editName.trim(),
      });
      setDone(true);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const bg = {
    backgroundImage: `linear-gradient(rgba(30,58,138,0.4),rgba(59,130,246,0.5)),url('/images/boats/blueone/External_sailing.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16" style={bg}>
      <div className="w-full max-w-lg bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-8 space-y-5">

        {loading && (
          <p className="text-blue-100 text-sm text-center animate-pulse">Loading…</p>
        )}

        {!loading && error && (
          <div className="text-center space-y-4">
            <p className="text-red-300 text-sm">{error}</p>
            <Link href="/reviews" className="text-blue-200 hover:text-white text-sm underline">
              ← Back to Reviews
            </Link>
          </div>
        )}

        {!loading && !error && done && (
          <div className="text-center space-y-4">
            <div className="text-4xl">
              {action === 'delete' ? '🗑️' : action === 'edit' ? '✏️' : '✅'}
            </div>
            <h2 className="text-white font-bold text-lg">
              {action === 'delete' ? 'Review deleted.' : action === 'edit' ? 'Review updated! Check your email to re-confirm.' : 'Review confirmed! It\'s now live.'}
            </h2>
            <Link href="/reviews" className="text-blue-200 hover:text-white text-sm underline">
              ← Back to Reviews
            </Link>
          </div>
        )}

        {!loading && !error && !done && review && (
          <>
            {action === 'confirm' && (
              <div className="space-y-4">
                <h2 className="text-white font-bold text-lg">Confirm your review</h2>
                <div className="bg-white/10 rounded-xl p-4 space-y-1">
                  <p className="text-white text-sm font-semibold">{review.title}</p>
                  <StarRating value={review.rating} readonly size="sm" />
                  <p className="text-blue-100 text-xs leading-relaxed">{review.description}</p>
                  <p className="text-blue-300 text-xs mt-1">— {review.name}</p>
                </div>
                <p className="text-blue-200 text-xs">Once confirmed, your review will be visible to all visitors.</p>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="btn-primary w-full py-3 text-sm disabled:opacity-60"
                >
                  {saving ? 'Confirming…' : 'Yes, publish my review'}
                </button>
                <Link href={`/reviews/manage?token=${token}&action=edit`} className="block text-center text-blue-200 hover:text-white text-xs underline">
                  Edit first
                </Link>
                <Link href={`/reviews/manage?token=${token}&action=delete`} className="block text-center text-red-300 hover:text-red-200 text-xs underline">
                  Delete this review
                </Link>
              </div>
            )}

            {action === 'edit' && (
              <form onSubmit={handleEdit} className="space-y-4">
                <h2 className="text-white font-bold text-lg">Edit your review</h2>
                <div>
                  <label className="text-blue-100 text-xs font-medium block mb-1">Name</label>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-blue-100 text-xs font-medium block mb-1">Rating</label>
                  <StarRating value={editRating} onChange={setEditRating} size="lg" />
                </div>
                <div>
                  <label className="text-blue-100 text-xs font-medium block mb-1">Title</label>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-blue-100 text-xs font-medium block mb-1">Review</label>
                  <textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    rows={5}
                    className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                    required
                  />
                </div>
                <p className="text-blue-200 text-xs">After saving, you will need to re-confirm via a new email link.</p>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full py-3 text-sm disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            )}

            {action === 'delete' && (
              <div className="space-y-4">
                <h2 className="text-white font-bold text-lg">Delete your review</h2>
                <div className="bg-white/10 rounded-xl p-4 space-y-1">
                  <p className="text-white text-sm font-semibold">{review.title}</p>
                  <p className="text-blue-100 text-xs line-clamp-3">{review.description}</p>
                </div>
                <p className="text-red-300 text-xs">This action is permanent and cannot be undone.</p>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="w-full py-3 text-sm bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
                >
                  {saving ? 'Deleting…' : 'Yes, delete my review'}
                </button>
                <Link href={`/reviews/manage?token=${token}&action=confirm`} className="block text-center text-blue-200 hover:text-white text-xs underline">
                  ← Keep it
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
