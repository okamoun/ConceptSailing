'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';
import {
  getAllAvailabilityEntries,
  createAvailabilityEntry,
  updateAvailabilityEntry,
  deleteAvailabilityEntry,
  type AvailabilityEntry,
} from '../../../lib/availability';
import {
  marinas,
  getMarinaById,
  distanceFromNeaPeramos,
  formatNavTime,
  DEFAULT_MARINA_ID,
} from '../../marinas-data';
import MarinaMap from '../MarinaMap';

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin';

const bg = {
  backgroundImage: `linear-gradient(rgba(30,58,138,0.5),rgba(59,130,246,0.6)),url('/images/boats/blueone/External_sailing.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
};

const STATUS_BADGE: Record<AvailabilityEntry['status'], string> = {
  requested: 'bg-amber-400/30 text-amber-200',
  blocked:   'bg-red-500/30 text-red-200',
  booked:    'bg-emerald-600/30 text-emerald-200',
};

interface ModalState {
  mode: 'add' | 'edit';
  entry?: AvailabilityEntry;
  startDate: string;
  endDate: string;
  status: AvailabilityEntry['status'];
  note: string;
  deliveryPoint: string;
  redeliveryPoint: string;
}

export default function AvailabilityAdminClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [entries, setEntries] = useState<AvailabilityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [modal, setModal] = useState<ModalState | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_SECRET) { setAuthed(true); setAuthError(''); }
    else setAuthError('Incorrect password.');
  }

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    getAllAvailabilityEntries()
      .then(setEntries)
      .catch(() => setError('Could not load availability entries.'))
      .finally(() => setLoading(false));
  }, [authed]);

  function handleDayClick(dateStr: string) {
    const existing = entries.find(e => dateStr >= e.startDate && dateStr <= e.endDate);
    if (existing) {
      setModal({
        mode: 'edit',
        entry: existing,
        startDate: existing.startDate,
        endDate: existing.endDate,
        status: existing.status,
        note: existing.note ?? '',
        deliveryPoint: existing.deliveryPoint ?? DEFAULT_MARINA_ID,
        redeliveryPoint: existing.redeliveryPoint ?? existing.deliveryPoint ?? DEFAULT_MARINA_ID,
      });
    } else {
      setModal({
        mode: 'add',
        startDate: dateStr,
        endDate: addDays(dateStr, 7),
        status: 'booked',
        note: '',
        deliveryPoint: DEFAULT_MARINA_ID,
        redeliveryPoint: DEFAULT_MARINA_ID,
      });
    }
  }

  async function handleSave() {
    if (!modal) return;
    if (!modal.startDate || !modal.endDate) return;
    if (modal.endDate < modal.startDate) {
      setError('End date must be on or after start date.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (modal.mode === 'add') {
        const id = await createAvailabilityEntry({
          startDate: modal.startDate,
          endDate: modal.endDate,
          status: modal.status,
          note: modal.note || undefined,
          deliveryPoint: modal.deliveryPoint,
          redeliveryPoint: modal.redeliveryPoint,
        });
        setEntries(prev => [...prev, {
          id,
          startDate: modal.startDate,
          endDate: modal.endDate,
          status: modal.status,
          note: modal.note || undefined,
          deliveryPoint: modal.deliveryPoint,
          redeliveryPoint: modal.redeliveryPoint,
          createdAt: null,
        }].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      } else if (modal.entry) {
        await updateAvailabilityEntry(modal.entry.id, {
          startDate: modal.startDate,
          endDate: modal.endDate,
          status: modal.status,
          note: modal.note || undefined,
          deliveryPoint: modal.deliveryPoint,
          redeliveryPoint: modal.redeliveryPoint,
        });
        setEntries(prev =>
          prev.map(e => e.id === modal.entry!.id
            ? { ...e, startDate: modal.startDate, endDate: modal.endDate, status: modal.status, note: modal.note || undefined, deliveryPoint: modal.deliveryPoint, redeliveryPoint: modal.redeliveryPoint }
            : e
          )
        );
      }
      setModal(null);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this availability entry?')) return;
    try {
      await deleteAvailabilityEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setModal(null);
    } catch {
      setError('Failed to delete. Please try again.');
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={bg}>
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-8 space-y-4">
          <h1 className="text-white font-bold text-xl text-center">Availability Admin</h1>
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

  return (
    <main className="min-h-screen px-4 py-10" style={bg}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl">Availability Calendar</h1>
            <p className="text-blue-200 text-xs mt-0.5">Click any future date to add or edit an entry</p>
          </div>
          <Link href="/admin" className="text-blue-300 hover:text-white text-sm transition-colors">
            ← Admin
          </Link>
        </div>

        {error && (
          <p className="text-red-300 text-sm bg-red-500/20 rounded-xl px-4 py-2">{error}</p>
        )}

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <AvailabilityCalendar
            entries={entries}
            mode="admin"
            month={month}
            onMonthChange={setMonth}
            onDayClick={handleDayClick}
          />
        )}

        {/* Full entry list */}
        {!loading && entries.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-white font-semibold text-sm">All Entries</h2>
            {entries.map(e => {
              const delMarina = getMarinaById(e.deliveryPoint ?? '');
              const relMarina = getMarinaById(e.redeliveryPoint ?? e.deliveryPoint ?? '');
              return (
              <div key={e.id} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-3 flex items-center gap-4">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_BADGE[e.status]}`}>
                  {e.status}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm">{e.startDate} → {e.endDate}</span>
                  {(delMarina || relMarina) && (
                    <p className="text-blue-300 text-xs mt-0.5 truncate">
                      {delMarina ? `↓ ${delMarina.name}` : ''}
                      {delMarina && relMarina && delMarina.id !== relMarina.id ? ` · ↑ ${relMarina.name}` : ''}
                    </p>
                  )}
                  {e.note && (
                    <p className="text-blue-300 text-xs italic truncate">{e.note}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setModal({ mode: 'edit', entry: e, startDate: e.startDate, endDate: e.endDate, status: e.status, note: e.note ?? '', deliveryPoint: e.deliveryPoint ?? DEFAULT_MARINA_ID, redeliveryPoint: e.redeliveryPoint ?? e.deliveryPoint ?? DEFAULT_MARINA_ID })}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="w-8 h-8 rounded-lg bg-red-600/50 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                    </svg>
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <p className="text-blue-200 text-sm text-center py-4">
            No entries yet. Click a future date on the calendar to add one.
          </p>
        )}

      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-blue-900/95 border border-white/20 rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-bold text-lg">
              {modal.mode === 'add' ? 'Add Availability Entry' : 'Edit Entry'}
            </h2>

            {/* Dates + Locations (2-column grid) */}
            <div className="grid grid-cols-2 gap-3 items-start">
              <div className="min-w-0">
                <label className="text-blue-200 text-xs font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={modal.startDate}
                  onChange={e => setModal(m => m ? { ...m, startDate: e.target.value } : m)}
                  className="w-full min-w-0 bg-white/10 border border-white/25 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>
              <MarinaSelectWithInfo
                label="Delivery"
                value={modal.deliveryPoint}
                onChange={v => setModal(m => m ? { ...m, deliveryPoint: v } : m)}
              />
              <div className="min-w-0">
                <label className="text-blue-200 text-xs font-medium block mb-1">End Date</label>
                <input
                  type="date"
                  value={modal.endDate}
                  min={modal.startDate}
                  onChange={e => setModal(m => m ? { ...m, endDate: e.target.value } : m)}
                  className="w-full min-w-0 bg-white/10 border border-white/25 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>
              <MarinaSelectWithInfo
                label="Redelivery"
                value={modal.redeliveryPoint}
                onChange={v => setModal(m => m ? { ...m, redeliveryPoint: v } : m)}
              />
            </div>

            {/* Status + Note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-blue-200 text-xs font-medium block mb-1">Status</label>
                <select
                  value={modal.status}
                  onChange={e => setModal(m => m ? { ...m, status: e.target.value as AvailabilityEntry['status'] } : m)}
                  className="w-full bg-blue-800 border border-white/25 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="requested">Requested</option>
                  <option value="blocked">Blocked</option>
                  <option value="booked">Booked</option>
                </select>
              </div>
              <div>
                <label className="text-blue-200 text-xs font-medium block mb-1">Note</label>
                <input
                  type="text"
                  value={modal.note}
                  onChange={e => setModal(m => m ? { ...m, note: e.target.value } : m)}
                  placeholder="Charter for Smith family"
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Map */}
            <MarinaMap
              delivery={getMarinaById(modal.deliveryPoint)}
              redelivery={getMarinaById(modal.redeliveryPoint)}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              {modal.mode === 'edit' && modal.entry && (
                <button
                  onClick={() => handleDelete(modal.entry!.id)}
                  className="w-10 h-10 rounded-xl bg-red-600/50 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                  title="Delete entry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => { setModal(null); setError(''); }}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}

function MarinaSelectWithInfo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const marina = getMarinaById(value);
  const distNm = marina ? distanceFromNeaPeramos(marina) : null;

  const filtered = query.trim()
    ? marinas.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.region.toLowerCase().includes(query.toLowerCase())
      )
    : marinas;

  return (
    <div className="relative min-w-0">
      <label className="text-blue-200 text-xs font-medium block mb-1">{label}</label>
      <input
        type="text"
        value={open ? query : (marina?.name ?? '')}
        placeholder={open ? 'Search…' : 'Select marina…'}
        onFocus={() => { setOpen(true); setQuery(''); }}
        onChange={e => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full bg-blue-800 border border-white/25 text-white placeholder-blue-400 text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-blue-400"
      />
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-blue-950 border border-white/20 rounded-lg shadow-xl max-h-44 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-blue-300 text-xs px-3 py-2">No results</p>
          )}
          {filtered.map(m => (
            <button
              key={m.id}
              type="button"
              onMouseDown={() => { onChange(m.id); setOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-800 transition-colors ${m.id === value ? 'text-white font-semibold' : 'text-blue-100'}`}
            >
              <span>{m.name}</span>
              <span className="text-blue-400 text-xs ml-2 flex-shrink-0">{m.region}</span>
            </button>
          ))}
        </div>
      )}
      {distNm !== null && distNm > 0.5 && (
        <p className="text-blue-300 text-xs mt-0.5 leading-tight">
          {distNm.toFixed(0)} nm · ~{formatNavTime(distNm)}
        </p>
      )}
    </div>
  );
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
