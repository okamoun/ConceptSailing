'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllCharters,
  deleteCharter,
  updateCharter,
  type Charter,
  type CharterStatus,
  CHARTER_STATUS_LABEL,
  CHARTER_STATUS_PRIORITY,
} from '../../lib/availability';
import {
  getAllContacts,
  deleteContact,
  type ContactSubmission,
} from '../../lib/submissions';
import { getAllReviews, adminDeleteReview, updateReviewOrder } from '../../lib/reviews';
import type { Review } from '../../lib/reviews';
import StarRating from '../components/StarRating';
import MarinaMap from './MarinaMap';
import { marinasByRegion, getMarinaById, DEFAULT_MARINA_ID } from '../marinas-data';

type Tab = 'charters' | 'contacts' | 'reviews';

const STATUS_BADGE: Record<CharterStatus, string> = {
  web_request:     'bg-sky-500/30 text-sky-200',
  broker_request:  'bg-amber-500/30 text-amber-200',
  serious_request: 'bg-orange-500/30 text-orange-200',
  confirmed:       'bg-emerald-500/30 text-emerald-200',
  signed:          'bg-emerald-800/30 text-emerald-100',
  canceled:        'bg-gray-500/30 text-gray-300',
  owner_use:       'bg-purple-500/30 text-purple-200',
  maintenance:     'bg-red-500/30 text-red-200',
};

export default function AdminDashboardClient() {
  const { hasPermission } = useAuth();
  const canDashboard = hasPermission('dashboard');
  const canReviews = hasPermission('reviews');

  const defaultTab: Tab = canDashboard ? 'charters' : canReviews ? 'reviews' : 'charters';
  const [tab, setTab] = useState<Tab>(defaultTab);

  const [charters, setCharters] = useState<Charter[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editDelivery, setEditDelivery] = useState(DEFAULT_MARINA_ID);
  const [editRedelivery, setEditRedelivery] = useState(DEFAULT_MARINA_ID);
  const [savingLocations, setSavingLocations] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllCharters(), getAllContacts(), getAllReviews()])
      .then(([c, contacts, r]) => { setCharters(c); setContacts(contacts); setReviews(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteCharter(id: string) {
    if (!confirm('Delete this charter entry?')) return;
    await deleteCharter(id);
    setCharters(prev => prev.filter(c => c.id !== id));
  }

  function handleExpand(c: Charter) {
    if (expandedId === c.id) { setExpandedId(null); return; }
    setExpandedId(c.id);
    setEditDelivery(c.deliveryPoint ?? DEFAULT_MARINA_ID);
    setEditRedelivery(c.redeliveryPoint ?? c.deliveryPoint ?? DEFAULT_MARINA_ID);
  }

  async function handleSaveLocations(charterId: string) {
    setSavingLocations(true);
    try {
      await updateCharter(charterId, { deliveryPoint: editDelivery, redeliveryPoint: editRedelivery });
      setCharters(prev =>
        prev.map(c => c.id === charterId ? { ...c, deliveryPoint: editDelivery, redeliveryPoint: editRedelivery } : c)
      );
      setExpandedId(null);
    } finally {
      setSavingLocations(false);
    }
  }

  async function handleStatusChange(charterId: string, newStatus: CharterStatus) {
    setSavingStatus(charterId);
    try {
      await updateCharter(charterId, { status: newStatus });
      setCharters(prev => prev.map(c => c.id === charterId ? { ...c, status: newStatus } : c));
    } finally {
      setSavingStatus(null);
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

  // Sort charters by priority (highest first) then by date
  const sortedCharters = [...charters].sort((a, b) => {
    const pd = CHARTER_STATUS_PRIORITY[b.status] - CHARTER_STATUS_PRIORITY[a.status];
    if (pd !== 0) return pd;
    return a.startDate.localeCompare(b.startDate);
  });

  const allTabs: { id: Tab; label: string; count: number; allowed: boolean }[] = [
    { id: 'charters', label: 'Charters', count: charters.length, allowed: canDashboard },
    { id: 'contacts', label: 'Contacts', count: contacts.length, allowed: canDashboard },
    { id: 'reviews', label: 'Reviews', count: reviews.length, allowed: canReviews },
  ];
  const tabs = allTabs.filter(t => t.allowed);

  const visibleReviews = reviews.filter(r => reviewFilter === 'all' || r.status === reviewFilter);

  if (tabs.length === 0) {
    return (
      <main className="px-4 py-6 flex items-center justify-center min-h-64">
        <div className="text-center space-y-2">
          <p className="text-white font-semibold text-lg">Access denied</p>
          <p className="text-blue-300 text-sm">You do not have permission to view the dashboard.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <div>
          <h1 className="text-white font-bold text-2xl">Dashboard</h1>
          <p className="text-blue-200 text-xs mt-0.5">All charters, contacts and reviews</p>
        </div>

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

        {/* CHARTERS TAB */}
        {!loading && tab === 'charters' && (
          <div className="space-y-3">
            {sortedCharters.length === 0 && (
              <p className="text-blue-200 text-sm text-center py-8">No charter entries yet.</p>
            )}
            {sortedCharters.map(c => {
              const deliveryMarina = getMarinaById(c.deliveryPoint ?? '');
              const redeliveryMarina = getMarinaById(c.redeliveryPoint ?? c.deliveryPoint ?? '');
              const deliveryLabel = deliveryMarina?.name ?? c.deliveryPoint ?? c.embarkationPoint;
              const redeliveryLabel = redeliveryMarina?.name ?? c.redeliveryPoint ?? c.deliveryPoint ?? c.embarkationPoint;
              const isExpanded = expandedId === c.id;

              return (
                <div key={c.id} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>
                          {CHARTER_STATUS_LABEL[c.status]}
                        </span>
                        {c.name && <span className="text-white font-semibold text-sm">{c.name}</span>}
                        {c.email && <span className="text-blue-300 text-xs">{c.email}</span>}
                        {c.phone && <span className="text-blue-300 text-xs">{c.phone}</span>}
                      </div>

                      {/* Inline status change */}
                      <div className="mb-2">
                        <select
                          value={c.status}
                          disabled={savingStatus === c.id}
                          onChange={e => handleStatusChange(c.id, e.target.value as CharterStatus)}
                          className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                        >
                          {(Object.keys(CHARTER_STATUS_LABEL) as CharterStatus[]).map(s => (
                            <option key={s} value={s} className="bg-blue-900">{CHARTER_STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                        <Detail label="Start" value={c.startDate} />
                        <Detail label="End" value={c.endDate} />
                        {c.passengers != null && <Detail label="Passengers" value={String(c.passengers)} />}
                        {deliveryLabel && <Detail label="Delivery" value={deliveryLabel} />}
                        {redeliveryLabel && redeliveryLabel !== deliveryLabel && <Detail label="Redelivery" value={redeliveryLabel} />}
                        {c.boat && <Detail label="Boat" value={c.boat} />}
                        {c.selectedTheme && <Detail label="Theme" value={c.selectedTheme} />}
                      </div>
                      {c.holidayDescription && (
                        <p className="text-blue-100 text-xs leading-relaxed mt-2 italic">&ldquo;{c.holidayDescription}&rdquo;</p>
                      )}
                      {c.note && (
                        <p className="text-blue-300 text-xs mt-1 italic">Note: {c.note}</p>
                      )}
                      <p className="text-blue-400 text-xs mt-2">
                        Created: {c.createdAt?.toDate?.()?.toLocaleString() ?? '—'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleExpand(c)}
                        className={`w-8 h-8 rounded-lg border text-white flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-500/50 border-blue-400/50' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
                        title="Edit delivery locations"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCharter(c.id)}
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
                          onClick={() => handleSaveLocations(c.id)}
                          disabled={savingLocations}
                          className="px-4 py-2 text-xs font-semibold bg-blue-500/60 hover:bg-blue-500/80 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {savingLocations ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
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
