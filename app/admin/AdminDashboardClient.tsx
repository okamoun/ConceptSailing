'use client';

import React, { useEffect, useState } from 'react';
import {
  getAllBookings,
  getAllContacts,
  deleteBooking,
  deleteContact,
  updateBookingLocations,
  type BookingSubmission,
  type ContactSubmission,
} from '../../lib/submissions';
import { getAllReviews, adminDeleteReview, updateReviewOrder } from '../../lib/reviews';
import type { Review } from '../../lib/reviews';
import StarRating from '../components/StarRating';
import MarinaMap from './MarinaMap';
import { marinasByRegion, getMarinaById, DEFAULT_MARINA_ID } from '../marinas-data';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin';

type Tab = 'bookings' | 'contacts' | 'reviews';

const bg = {
  backgroundImage: `linear-gradient(rgba(30,58,138,0.5),rgba(59,130,246,0.6)),url('/images/boats/blueone/External_sailing.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
};

export default function AdminDashboardClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<Tab>('bookings');

  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [editDelivery, setEditDelivery] = useState(DEFAULT_MARINA_ID);
  const [editRedelivery, setEditRedelivery] = useState(DEFAULT_MARINA_ID);
  const [savingLocations, setSavingLocations] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_SECRET) { setAuthed(true); setAuthError(''); }
    else setAuthError('Incorrect password.');
  }

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([getAllBookings(), getAllContacts(), getAllReviews()])
      .then(([b, c, r]) => { setBookings(b); setContacts(c); setReviews(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authed]);

  async function handleDeleteBooking(id: string) {
    if (!confirm('Delete this booking?')) return;
    await deleteBooking(id);
    setBookings(prev => prev.filter(b => b.id !== id));
  }

  function handleExpandBooking(b: BookingSubmission) {
    if (expandedBookingId === b.id) {
      setExpandedBookingId(null);
      return;
    }
    setExpandedBookingId(b.id);
    setEditDelivery(b.deliveryPoint ?? DEFAULT_MARINA_ID);
    setEditRedelivery(b.redeliveryPoint ?? b.deliveryPoint ?? DEFAULT_MARINA_ID);
  }

  async function handleSaveLocations(bookingId: string) {
    setSavingLocations(true);
    try {
      await updateBookingLocations(bookingId, editDelivery, editRedelivery);
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, deliveryPoint: editDelivery, redeliveryPoint: editRedelivery } : b)
      );
      setExpandedBookingId(null);
    } finally {
      setSavingLocations(false);
    }
  }

  async function handleDeleteContact(id: string) {
    if (!confirm('Delete this contact submission?')) return;
    await deleteContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }

  async function handleDeleteReview(id: string) {
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

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={bg}>
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-8 space-y-4">
          <h1 className="text-white font-bold text-xl text-center">Admin Dashboard</h1>
          <div>
            <label className="text-blue-100 text-xs font-medium block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              autoFocus
            />
          </div>
          {authError && <p className="text-red-300 text-xs">{authError}</p>}
          <button type="submit" className="btn-primary w-full py-3 text-sm">Enter</button>
        </form>
      </main>
    );
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'bookings', label: 'Bookings', count: bookings.length },
    { id: 'contacts', label: 'Contacts', count: contacts.length },
    { id: 'reviews', label: 'Reviews', count: reviews.length },
  ];

  const visibleReviews = reviews.filter(r => reviewFilter === 'all' || r.status === reviewFilter);

  return (
    <main className="min-h-screen px-4 py-10" style={bg}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white font-bold text-2xl">Admin Dashboard</h1>
            <p className="text-blue-200 text-xs mt-0.5">All form submissions and reviews</p>
          </div>
          <a
            href="/admin/availability"
            className="flex-shrink-0 flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Availability
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/20 pb-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                tab === t.id
                  ? 'bg-white/20 text-white border border-white/30 border-b-0'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              {t.label}
              <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
            </button>
          ))}
        </div>

        {loading && <p className="text-blue-200 text-sm text-center animate-pulse">Loading…</p>}

        {/* BOOKINGS TAB */}
        {!loading && tab === 'bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 && (
              <p className="text-blue-200 text-sm text-center py-8">No booking submissions yet.</p>
            )}
            {bookings.map(b => {
              const deliveryMarina = getMarinaById(b.deliveryPoint ?? '');
              const redeliveryMarina = getMarinaById(b.redeliveryPoint ?? b.deliveryPoint ?? '');
              const deliveryLabel = deliveryMarina?.name ?? b.deliveryPoint ?? b.embarkationPoint;
              const redeliveryLabel = redeliveryMarina?.name ?? b.redeliveryPoint ?? b.deliveryPoint ?? b.embarkationPoint;
              const isExpanded = expandedBookingId === b.id;

              return (
                <div key={b.id} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full">Booking</span>
                        <span className="text-white font-semibold text-sm">{b.name}</span>
                        <span className="text-blue-300 text-xs">{b.email}</span>
                        {b.phone && <span className="text-blue-300 text-xs">{b.phone}</span>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 mt-2">
                        <Detail label="Boat" value={b.boat} />
                        <Detail label="Date" value={b.date} />
                        <Detail label="Passengers" value={String(b.passengers)} />
                        <Detail label="Delivery" value={deliveryLabel} />
                        <Detail label="Redelivery" value={redeliveryLabel} />
                        {b.selectedTheme && <Detail label="Theme" value={b.selectedTheme} />}
                      </div>
                      {b.holidayDescription && (
                        <p className="text-blue-100 text-xs leading-relaxed mt-2 italic">&ldquo;{b.holidayDescription}&rdquo;</p>
                      )}
                      <p className="text-blue-400 text-xs mt-2">
                        Submitted: {b.createdAt?.toDate?.()?.toLocaleString() ?? '—'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleExpandBooking(b)}
                        className={`w-8 h-8 rounded-lg border text-white flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-500/50 border-blue-400/50' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
                        title="Edit delivery locations"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="w-8 h-8 rounded-lg bg-red-600/50 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/15 space-y-3">
                      <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Edit Delivery Locations</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <MarinaSelectField label="Place of Delivery" value={editDelivery} onChange={setEditDelivery} />
                        <MarinaSelectField label="Place of Redelivery" value={editRedelivery} onChange={setEditRedelivery} />
                      </div>
                      <MarinaMap
                        delivery={getMarinaById(editDelivery)}
                        redelivery={getMarinaById(editRedelivery)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveLocations(b.id)}
                          disabled={savingLocations}
                          className="px-4 py-2 text-xs font-semibold bg-blue-500/60 hover:bg-blue-500/80 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {savingLocations ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => setExpandedBookingId(null)}
                          className="px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CONTACTS TAB */}
        {!loading && tab === 'contacts' && (
          <div className="space-y-3">
            {contacts.length === 0 && (
              <p className="text-blue-200 text-sm text-center py-8">No contact submissions yet.</p>
            )}
            {contacts.map(c => (
              <div key={c.id} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="bg-purple-500/30 text-purple-200 text-xs font-semibold px-2 py-0.5 rounded-full">Contact</span>
                      <span className="text-white font-semibold text-sm">{c.name}</span>
                      <span className="text-blue-300 text-xs">{c.email}</span>
                      {c.phone && <span className="text-blue-300 text-xs">{c.phone}</span>}
                    </div>
                    <p className="text-blue-100 text-sm leading-relaxed mt-2">{c.message}</p>
                    <p className="text-blue-400 text-xs mt-2">
                      Submitted: {c.createdAt?.toDate?.()?.toLocaleString() ?? '—'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="w-8 h-8 rounded-lg bg-red-600/50 hover:bg-red-500 text-white flex items-center justify-center transition-colors flex-shrink-0"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS TAB */}
        {!loading && tab === 'reviews' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {(['all', 'pending', 'confirmed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${reviewFilter === f ? 'bg-white/25 text-white' : 'text-blue-200 hover:text-white border border-white/20'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {visibleReviews.length === 0 && (
              <p className="text-blue-200 text-sm text-center py-8">No reviews found.</p>
            )}
            {visibleReviews.map(r => (
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
                      Created: {r.createdAt?.toDate?.()?.toLocaleString() ?? '—'} · Order: {r.order ?? 0}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => handleOrderChange(r.id, 1)} title="Increase order"
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center border border-white/20 transition-colors">↑</button>
                    <button onClick={() => handleOrderChange(r.id, -1)} title="Decrease order"
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center border border-white/20 transition-colors">↓</button>
                    <button onClick={() => handleDeleteReview(r.id)} title="Delete"
                      className="w-8 h-8 rounded-lg bg-red-600/50 hover:bg-red-500 text-white flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-blue-400 text-xs">{label}: </span>
      <span className="text-white text-xs font-medium">{value}</span>
    </div>
  );
}

function MarinaSelectField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const grouped = marinasByRegion();
  return (
    <div>
      <label className="text-blue-300 text-xs block mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-white/25 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
      >
        {Object.entries(grouped).map(([region, regionMarinas]) => (
          <optgroup key={region} label={region}>
            {regionMarinas.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
