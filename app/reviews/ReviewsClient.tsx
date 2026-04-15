'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { createReview, getConfirmedReviews } from '../../lib/reviews';
import type { Review } from '../../lib/reviews';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
const EMAILJS_REVIEW_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_REVIEW_TEMPLATE_ID || '';

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const MAX_PHOTOS = 4;
const MAX_FILE_MB = 5;
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.75;

function resizeAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) { height = Math.round((height * MAX_DIMENSION) / width); width = MAX_DIMENSION; }
        else { width = Math.round((width * MAX_DIMENSION) / height); height = MAX_DIMENSION; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getConfirmedReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.size <= MAX_FILE_MB * 1024 * 1024);
    const combined = [...photoFiles, ...valid].slice(0, MAX_PHOTOS);
    setPhotoFiles(combined);
    setPhotoPreviews(combined.map(f => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(idx: number) {
    const updated = photoFiles.filter((_, i) => i !== idx);
    setPhotoFiles(updated);
    setPhotoPreviews(updated.map(f => URL.createObjectURL(f)));
  }

  async function encodePhotos(): Promise<string[]> {
    if (photoFiles.length === 0) return [];
    return Promise.all(photoFiles.map(resizeAndEncode));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !title.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const token = generateToken();

      const photoUrls = await encodePhotos();

      await createReview({
        token,
        status: 'pending',
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        description: description.trim(),
        rating,
        photos: photoUrls,
        order: 0,
      });

      const base = window.location.origin;
      const confirmLink = `${base}/reviews/manage?token=${token}&action=confirm`;
      const editLink = `${base}/reviews/manage?token=${token}&action=edit`;
      const deleteLink = `${base}/reviews/manage?token=${token}&action=delete`;

      const message =
        `Hi ${name.trim()},\n\n` +
        `Thank you for submitting your review "${title.trim()}" on BlueOne.\n\n` +
        `Please use one of the links below to manage your review:\n\n` +
        `✅ CONFIRM (publish your review):\n${confirmLink}\n\n` +
        `✏️ EDIT (update your review):\n${editLink}\n\n` +
        `🗑️ DELETE (remove your review):\n${deleteLink}\n\n` +
        `These links are unique to your review. Do not share them.\n\n` +
        `— The BlueOne Team`;

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_REVIEW_TEMPLATE_ID,
        {
          to_name: name.trim(),
          to_email: email.trim(),
          email: email.trim(),
          reply_to: email.trim(),
          message,
        },
        EMAILJS_PUBLIC_KEY
      );

      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      console.error('Submission error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Submission failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="min-h-screen relative"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.4), rgba(59, 130, 246, 0.5)), url('/images/boats/blueone/External_sailing.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-12">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('/images/boats/blueone/External_sailing.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-blue-900/95" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-blue-300 uppercase tracking-widest text-xs font-semibold mb-2">Our Guests</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">What They Say</h1>
          <p className="text-blue-100 text-sm max-w-xl mx-auto">
            Authentic experiences shared by guests who sailed with BlueOne in the Greek islands.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Success banner */}
        {submitted && (
          <div className="bg-green-500/20 border border-green-400/40 text-green-100 rounded-xl p-4 text-sm text-center">
            Thank you! Check your inbox — we sent you a link to confirm your review.
          </div>
        )}

        {/* CTA to open form */}
        {!showForm && !submitted && (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3"
            >
              Share Your Experience
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}

        {/* Submission form */}
        {showForm && (
          <section className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Share Your Experience</h2>
              <button onClick={() => setShowForm(false)} className="text-blue-200 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-100 text-xs font-medium mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John & Sarah"
                    className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-100 text-xs font-medium mb-1">Email * <span className="text-blue-300 font-normal">(for confirmation, not shown publicly)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-100 text-xs font-medium mb-1">Overall Rating *</label>
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>

              <div>
                <label className="block text-blue-100 text-xs font-medium mb-1">Review Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="An unforgettable week in the Cyclades"
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-blue-100 text-xs font-medium mb-1">Your Review *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell others about your experience..."
                  rows={5}
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  required
                />
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-blue-100 text-xs font-medium mb-2">
                  Photos <span className="text-blue-300 font-normal">(optional, up to {MAX_PHOTOS}, max {MAX_FILE_MB}MB each)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/25 group">
                      <Image src={src} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        aria-label="Remove photo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {photoFiles.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-blue-200 hover:border-white/60 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {error && <p className="text-red-300 text-xs">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Submitting…
                    </>
                  ) : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 text-sm text-blue-200 hover:text-white border border-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Reviews grid */}
        {loading ? (
          <div className="text-center text-blue-200 py-12 text-sm">Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-blue-200 py-12 text-sm">
            No reviews yet — be the first to share your experience!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map(r => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
