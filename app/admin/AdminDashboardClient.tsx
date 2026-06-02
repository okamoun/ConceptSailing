'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  getAllCharters,
  deleteCharter,
  updateCharter,
  type Charter,
  type CharterStatus,
  type ProposalStatus,
  CHARTER_STATUS_LABEL,
  CHARTER_STATUS_PRIORITY,
  proposalRef,
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
type SortDir = 'asc' | 'desc';
type CharterSortCol = 'status' | 'name' | 'startDate' | 'passengers' | 'createdAt';

const STATUS_BADGE: Record<CharterStatus, string> = {
  web_request:     'bg-sky-500/30 text-sky-200',
  broker_request:  'bg-amber-500/30 text-amber-200',
  serious_request: 'bg-orange-500/30 text-orange-200',
  proposal_sent:   'bg-violet-500/30 text-violet-200',
  confirmed:       'bg-emerald-500/30 text-emerald-200',
  signed:          'bg-emerald-800/40 text-emerald-100',
  canceled:        'bg-gray-500/30 text-gray-300',
  owner_use:       'bg-purple-500/30 text-purple-200',
  maintenance:     'bg-red-500/30 text-red-200',
};

const PROPOSAL_BADGE: Record<ProposalStatus, string> = {
  draft:     'bg-gray-500/30 text-gray-300',
  sent:      'bg-sky-500/30 text-sky-200',
  viewed:    'bg-indigo-500/30 text-indigo-200',
  commented: 'bg-amber-500/30 text-amber-200',
  approved:  'bg-emerald-500/30 text-emerald-200',
  rejected:  'bg-red-500/30 text-red-200',
};

export default function AdminDashboardClient() {
  const [tab, setTab] = useState<Tab>('charters');

  const [charters, setCharters] = useState<Charter[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected row IDs
  const [selectedCharterId, setSelectedCharterId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  // Charter filter / sort
  const [charterSearch, setCharterSearch] = useState('');
  const [charterStatusFilter, setCharterStatusFilter] = useState<CharterStatus | 'all'>('all');
  const [charterSort, setCharterSort] = useState<{ col: CharterSortCol; dir: SortDir }>({ col: 'startDate', dir: 'asc' });

  // Contact search
  const [contactSearch, setContactSearch] = useState('');

  // Review filter
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  // Charter detail edit state
  const [editDelivery, setEditDelivery] = useState(DEFAULT_MARINA_ID);
  const [editRedelivery, setEditRedelivery] = useState(DEFAULT_MARINA_ID);
  const [savingLocations, setSavingLocations] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllCharters(), getAllContacts(), getAllReviews()])
      .then(([c, ct, r]) => { setCharters(c); setContacts(ct); setReviews(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derived selected items (always in sync with latest data)
  const currentCharter = charters.find(c => c.id === selectedCharterId) ?? null;
  const currentContact = contacts.find(c => c.id === selectedContactId) ?? null;
  const currentReview  = reviews.find(r => r.id === selectedReviewId)   ?? null;

  // Filtered + sorted charters
  const filteredCharters = useMemo(() => {
    let rows = [...charters];
    if (charterStatusFilter !== 'all') rows = rows.filter(c => c.status === charterStatusFilter);
    if (charterSearch) {
      const q = charterSearch.toLowerCase();
      rows = rows.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      switch (charterSort.col) {
        case 'status':     va = CHARTER_STATUS_PRIORITY[a.status]; vb = CHARTER_STATUS_PRIORITY[b.status]; break;
        case 'name':       va = (a.name ?? '').toLowerCase();       vb = (b.name ?? '').toLowerCase();      break;
        case 'passengers': va = a.passengers ?? 0;                  vb = b.passengers ?? 0;                 break;
        case 'createdAt':  va = a.createdAt?.toMillis() ?? 0;       vb = b.createdAt?.toMillis() ?? 0;      break;
        default:           va = a.startDate;                        vb = b.startDate;
      }
      if (va < vb) return charterSort.dir === 'asc' ? -1 : 1;
      if (va > vb) return charterSort.dir === 'asc' ?  1 : -1;
      return 0;
    });
    return rows;
  }, [charters, charterStatusFilter, charterSearch, charterSort]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q)
    );
  }, [contacts, contactSearch]);

  const filteredReviews = useMemo(() =>
    reviews.filter(r => reviewFilter === 'all' || r.status === reviewFilter),
    [reviews, reviewFilter]
  );

  function toggleCharterSort(col: CharterSortCol) {
    setCharterSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' });
  }

  function selectCharter(c: Charter) {
    if (selectedCharterId === c.id) { setSelectedCharterId(null); return; }
    setSelectedCharterId(c.id);
    setEditDelivery(c.deliveryPoint ?? DEFAULT_MARINA_ID);
    setEditRedelivery(c.redeliveryPoint ?? c.deliveryPoint ?? DEFAULT_MARINA_ID);
  }

  async function handleDeleteCharter(id: string) {
    if (!confirm('Delete this charter entry?')) return;
    await deleteCharter(id);
    setCharters(prev => prev.filter(c => c.id !== id));
    if (selectedCharterId === id) setSelectedCharterId(null);
  }

  async function handleSaveLocations(charterId: string) {
    setSavingLocations(true);
    try {
      await updateCharter(charterId, { deliveryPoint: editDelivery, redeliveryPoint: editRedelivery });
      setCharters(prev => prev.map(c =>
        c.id === charterId ? { ...c, deliveryPoint: editDelivery, redeliveryPoint: editRedelivery } : c
      ));
    } finally {
      setSavingLocations(false);
    }
  }

  async function handleStatusChange(charterId: string, newStatus: CharterStatus) {
    setSavingStatus(true);
    try {
      await updateCharter(charterId, { status: newStatus });
      setCharters(prev => prev.map(c => c.id === charterId ? { ...c, status: newStatus } : c));
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleDeleteContact(id: string) {
    if (!confirm('Delete this contact submission?')) return;
    await deleteContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selectedContactId === id) setSelectedContactId(null);
  }

  async function handleDeleteReview(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    await adminDeleteReview(id);
    setReviews(prev => prev.filter(r => r.id !== id));
    if (selectedReviewId === id) setSelectedReviewId(null);
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

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'charters', label: 'Charters', count: charters.length },
    { id: 'contacts', label: 'Contacts', count: contacts.length },
    { id: 'reviews',  label: 'Reviews',  count: reviews.length  },
  ];

  return (
    <main className="px-4 py-6 min-h-screen">
      <div className="max-w-screen-xl mx-auto space-y-4">

        <div>
          <h1 className="text-white font-bold text-2xl">Dashboard</h1>
          <p className="text-blue-200 text-xs mt-0.5">All charters, contacts and reviews</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/20">
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

        {loading && <p className="text-blue-200 text-sm text-center animate-pulse py-12">Loading…</p>}

        {/* ── CHARTERS TAB ── */}
        {!loading && tab === 'charters' && (
          <div className="flex gap-4 items-start">

            {/* Table side */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Filter bar */}
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Search name, email, phone…"
                  value={charterSearch}
                  onChange={e => setCharterSearch(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 flex-1 min-w-40 placeholder:text-blue-400/70 focus:outline-none focus:border-blue-400"
                />
                <select
                  value={charterStatusFilter}
                  onChange={e => setCharterStatusFilter(e.target.value as CharterStatus | 'all')}
                  className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
                >
                  <option value="all" className="bg-blue-900">All statuses</option>
                  {(Object.keys(CHARTER_STATUS_LABEL) as CharterStatus[]).map(s => (
                    <option key={s} value={s} className="bg-blue-900">{CHARTER_STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/10 text-blue-300 text-xs uppercase tracking-wide">
                        <SortTh col="status"     current={charterSort} onSort={toggleCharterSort}>Status</SortTh>
                        <SortTh col="name"       current={charterSort} onSort={toggleCharterSort}>Client</SortTh>
                        <SortTh col="startDate"  current={charterSort} onSort={toggleCharterSort}>Dates</SortTh>
                        <SortTh col="passengers" current={charterSort} onSort={toggleCharterSort}>Pax</SortTh>
                        <th className="px-3 py-2.5 text-left">Proposal</th>
                        <SortTh col="createdAt"  current={charterSort} onSort={toggleCharterSort}>Received</SortTh>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCharters.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-blue-300 text-sm py-10">No charters match the current filter.</td>
                        </tr>
                      )}
                      {filteredCharters.map(c => (
                        <tr
                          key={c.id}
                          onClick={() => selectCharter(c)}
                          className={`border-t border-white/10 cursor-pointer transition-colors ${
                            selectedCharterId === c.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_BADGE[c.status]}`}>
                              {CHARTER_STATUS_LABEL[c.status]}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 max-w-36">
                            <div className="text-white font-medium truncate">{c.name ?? <span className="text-blue-500 italic text-xs">—</span>}</div>
                            {c.email && <div className="text-blue-400 text-xs truncate">{c.email}</div>}
                          </td>
                          <td className="px-3 py-2.5 text-blue-200 text-xs whitespace-nowrap">
                            {c.startDate}
                            <span className="text-blue-400 block">→ {c.endDate}</span>
                          </td>
                          <td className="px-3 py-2.5 text-blue-200 text-center">{c.passengers ?? '—'}</td>
                          <td className="px-3 py-2.5">
                            {c.proposal ? (
                              <a
                                href={`/admin/proposals/${c.id}`}
                                onClick={e => e.stopPropagation()}
                                className={`text-xs font-medium px-2 py-0.5 rounded-full hover:brightness-125 transition-colors ${PROPOSAL_BADGE[c.proposal.status]}`}
                              >
                                {c.proposal.status}
                              </a>
                            ) : (
                              <a
                                href={`/admin/proposals/${c.id}`}
                                onClick={e => e.stopPropagation()}
                                className="text-xs text-blue-400 hover:text-blue-200 transition-colors"
                              >
                                + create
                              </a>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-blue-400 text-xs whitespace-nowrap">
                            {c.createdAt?.toDate?.()?.toLocaleDateString() ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-blue-400 text-xs">{filteredCharters.length} of {charters.length} charters</p>
            </div>

            {/* Charter detail panel */}
            {currentCharter && (
              <div className="w-96 flex-shrink-0 bg-white/10 border border-white/20 rounded-xl p-5 space-y-4 sticky top-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[currentCharter.status]}`}>
                      {CHARTER_STATUS_LABEL[currentCharter.status]}
                    </span>
                    <h2 className="text-white font-semibold mt-1 truncate">{currentCharter.name ?? 'Unknown client'}</h2>
                  </div>
                  <button onClick={() => setSelectedCharterId(null)} className="text-blue-400 hover:text-white transition-colors flex-shrink-0 text-lg leading-none">✕</button>
                </div>

                {/* Info grid */}
                <div className="space-y-1.5">
                  {currentCharter.email    && <DRow label="Email"      value={currentCharter.email} />}
                  {currentCharter.phone    && <DRow label="Phone"      value={currentCharter.phone} />}
                  <DRow label="Dates"      value={`${currentCharter.startDate} → ${currentCharter.endDate}`} />
                  {currentCharter.passengers != null && <DRow label="Passengers" value={String(currentCharter.passengers)} />}
                  {currentCharter.boat     && <DRow label="Boat"       value={currentCharter.boat} />}
                  {currentCharter.selectedTheme && <DRow label="Theme" value={currentCharter.selectedTheme} />}
                  {getMarinaById(currentCharter.deliveryPoint ?? '') && (
                    <DRow label="Delivery" value={getMarinaById(currentCharter.deliveryPoint!)!.name} />
                  )}
                  {getMarinaById(currentCharter.redeliveryPoint ?? '') && (
                    <DRow label="Redelivery" value={getMarinaById(currentCharter.redeliveryPoint!)!.name} />
                  )}
                </div>

                {currentCharter.holidayDescription && (
                  <p className="text-blue-100 text-xs italic leading-relaxed border-l-2 border-blue-500/40 pl-3">
                    &ldquo;{currentCharter.holidayDescription}&rdquo;
                  </p>
                )}
                {currentCharter.note && (
                  <p className="text-blue-300 text-xs italic">Note: {currentCharter.note}</p>
                )}

                {/* Status change */}
                <div>
                  <label className="text-blue-400 text-xs block mb-1">Status</label>
                  <select
                    value={currentCharter.status}
                    disabled={savingStatus}
                    onChange={e => handleStatusChange(currentCharter.id, e.target.value as CharterStatus)}
                    className="w-full bg-slate-800 border border-white/25 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                  >
                    {(Object.keys(CHARTER_STATUS_LABEL) as CharterStatus[]).map(s => (
                      <option key={s} value={s} className="bg-blue-900">{CHARTER_STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>

                {/* Delivery locations */}
                <div className="space-y-2">
                  <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide">Delivery Locations</p>
                  <MarinaSelectField label="Delivery" value={editDelivery} onChange={setEditDelivery} />
                  <MarinaSelectField label="Redelivery" value={editRedelivery} onChange={setEditRedelivery} />
                  <MarinaMap delivery={getMarinaById(editDelivery)} redelivery={getMarinaById(editRedelivery)} />
                  <button
                    onClick={() => handleSaveLocations(currentCharter.id)}
                    disabled={savingLocations}
                    className="w-full py-2 text-xs font-semibold bg-blue-500/60 hover:bg-blue-500/80 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingLocations ? 'Saving…' : 'Save Locations'}
                  </button>
                </div>

                {/* Proposal link */}
                <div>
                  {currentCharter.proposal ? (
                    <a
                      href={`/admin/proposals/${currentCharter.id}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:brightness-125 transition-colors ${PROPOSAL_BADGE[currentCharter.proposal.status]}`}
                    >
                      📋 {proposalRef(currentCharter.id)} · {currentCharter.proposal.status}
                    </a>
                  ) : (
                    <a
                      href={`/admin/proposals/${currentCharter.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-blue-300 hover:text-white transition-colors"
                    >
                      + Create Proposal
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <p className="text-blue-400 text-xs">Created: {currentCharter.createdAt?.toDate?.()?.toLocaleString() ?? '—'}</p>
                  <button
                    onClick={() => handleDeleteCharter(currentCharter.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-600/50 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CONTACTS TAB ── */}
        {!loading && tab === 'contacts' && (
          <div className="flex gap-4 items-start">

            <div className="flex-1 min-w-0 space-y-3">
              <input
                type="text"
                placeholder="Search name, email or message…"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 placeholder:text-blue-400/70 focus:outline-none focus:border-blue-400"
              />

              <div className="rounded-xl border border-white/20 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/10 text-blue-300 text-xs uppercase tracking-wide">
                      <th className="px-3 py-2.5 text-left">Name</th>
                      <th className="px-3 py-2.5 text-left">Email</th>
                      <th className="px-3 py-2.5 text-left hidden sm:table-cell">Phone</th>
                      <th className="px-3 py-2.5 text-left hidden md:table-cell">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-blue-300 text-sm py-10">No contacts found.</td>
                      </tr>
                    )}
                    {filteredContacts.map(c => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedContactId(selectedContactId === c.id ? null : c.id)}
                        className={`border-t border-white/10 cursor-pointer transition-colors ${
                          selectedContactId === c.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="px-3 py-2.5 text-white font-medium">{c.name}</td>
                        <td className="px-3 py-2.5 text-blue-300">{c.email}</td>
                        <td className="px-3 py-2.5 text-blue-400 hidden sm:table-cell">{c.phone ?? '—'}</td>
                        <td className="px-3 py-2.5 text-blue-400 text-xs hidden md:table-cell">
                          {c.createdAt?.toDate?.()?.toLocaleDateString() ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-blue-400 text-xs">{filteredContacts.length} of {contacts.length} contacts</p>
            </div>

            {/* Contact detail panel */}
            {currentContact && (
              <div className="w-96 flex-shrink-0 bg-white/10 border border-white/20 rounded-xl p-5 space-y-4 sticky top-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="bg-purple-500/30 text-purple-200 text-xs font-semibold px-2 py-0.5 rounded-full">Contact</span>
                    <h2 className="text-white font-semibold mt-1 truncate">{currentContact.name}</h2>
                  </div>
                  <button onClick={() => setSelectedContactId(null)} className="text-blue-400 hover:text-white transition-colors flex-shrink-0 text-lg leading-none">✕</button>
                </div>

                <div className="space-y-1.5">
                  <DRow label="Email" value={currentContact.email} />
                  {currentContact.phone && <DRow label="Phone" value={currentContact.phone} />}
                  <DRow label="Received" value={currentContact.createdAt?.toDate?.()?.toLocaleString() ?? '—'} />
                </div>

                <div>
                  <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-2">Message</p>
                  <p className="text-blue-100 text-sm leading-relaxed">{currentContact.message}</p>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleDeleteContact(currentContact.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-600/50 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {!loading && tab === 'reviews' && (
          <div className="flex gap-4 items-start">

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex gap-2">
                {(['all', 'pending', 'confirmed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setReviewFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      reviewFilter === f ? 'bg-white/25 text-white' : 'text-blue-200 hover:text-white border border-white/20'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-white/20 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/10 text-blue-300 text-xs uppercase tracking-wide">
                      <th className="px-3 py-2.5 text-left">Status</th>
                      <th className="px-3 py-2.5 text-left">Rating</th>
                      <th className="px-3 py-2.5 text-left">Name</th>
                      <th className="px-3 py-2.5 text-left hidden md:table-cell">Title</th>
                      <th className="px-3 py-2.5 text-center">Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-blue-300 text-sm py-10">No reviews found.</td>
                      </tr>
                    )}
                    {filteredReviews.map(r => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReviewId(selectedReviewId === r.id ? null : r.id)}
                        className={`border-t border-white/10 cursor-pointer transition-colors ${
                          selectedReviewId === r.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            r.status === 'confirmed' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5"><StarRating value={r.rating} readonly size="sm" /></td>
                        <td className="px-3 py-2.5 text-white">{r.name}</td>
                        <td className="px-3 py-2.5 text-blue-200 hidden md:table-cell truncate max-w-48">{r.title}</td>
                        <td className="px-3 py-2.5 text-blue-400 text-center text-xs">{r.order ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-blue-400 text-xs">{filteredReviews.length} of {reviews.length} reviews</p>
            </div>

            {/* Review detail panel */}
            {currentReview && (
              <div className="w-96 flex-shrink-0 bg-white/10 border border-white/20 rounded-xl p-5 space-y-4 sticky top-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        currentReview.status === 'confirmed' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
                      }`}>
                        {currentReview.status}
                      </span>
                      <StarRating value={currentReview.rating} readonly size="sm" />
                    </div>
                    <h2 className="text-white font-semibold mt-1 truncate">{currentReview.name}</h2>
                    <p className="text-blue-300 text-xs">{currentReview.email}</p>
                  </div>
                  <button onClick={() => setSelectedReviewId(null)} className="text-blue-400 hover:text-white transition-colors flex-shrink-0 text-lg leading-none">✕</button>
                </div>

                <div>
                  <p className="text-white font-medium text-sm">{currentReview.title}</p>
                  <p className="text-blue-100 text-xs leading-relaxed mt-2">{currentReview.description}</p>
                </div>

                {currentReview.photos && currentReview.photos.length > 0 && (
                  <p className="text-blue-300 text-xs">{currentReview.photos.length} photo{currentReview.photos.length > 1 ? 's' : ''}</p>
                )}

                <div className="flex items-center gap-2">
                  <p className="text-blue-400 text-xs flex-1">Display order: {currentReview.order ?? 0}</p>
                  <button onClick={() => handleOrderChange(currentReview.id, 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center border border-white/20 transition-colors">
                    ↑
                  </button>
                  <button onClick={() => handleOrderChange(currentReview.id, -1)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center border border-white/20 transition-colors">
                    ↓
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <p className="text-blue-400 text-xs">{currentReview.createdAt?.toDate?.()?.toLocaleDateString() ?? '—'}</p>
                  <button
                    onClick={() => handleDeleteReview(currentReview.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-600/50 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


      </div>
    </main>
  );
}

function SortTh({
  children, col, current, onSort,
}: {
  children: React.ReactNode;
  col: CharterSortCol;
  current: { col: CharterSortCol; dir: SortDir };
  onSort: (col: CharterSortCol) => void;
}) {
  const active = current.col === col;
  return (
    <th
      className="px-3 py-2.5 text-left cursor-pointer select-none hover:text-white transition-colors"
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1">
        {children}
        <span className={active ? 'text-blue-300' : 'text-blue-600'}>
          {active ? (current.dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  );
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-blue-400 w-20 flex-shrink-0">{label}</span>
      <span className="text-white font-medium break-all">{value}</span>
    </div>
  );
}

function MarinaSelectField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const grouped = marinasByRegion();
  return (
    <div>
      <label className="text-blue-400 text-xs block mb-1">{label}</label>
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
