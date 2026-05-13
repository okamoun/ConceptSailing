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
      });
    } else {
      setModal({
        mode: 'add',
        startDate: dateStr,
        endDate: dateStr,
        status: 'booked',
        note: '',
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
        });
        setEntries(prev => [...prev, {
          id,
          startDate: modal.startDate,
          endDate: modal.endDate,
          status: modal.status,
          note: modal.note || undefined,
          createdAt: null,
        }].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      } else if (modal.entry) {
        await updateAvailabilityEntry(modal.entry.id, {
          startDate: modal.startDate,
          endDate: modal.endDate,
          status: modal.status,
          note: modal.note || undefined,
        });
        setEntries(prev =>
          prev.map(e => e.id === modal.entry!.id
            ? { ...e, startDate: modal.startDate, endDate: modal.endDate, status: modal.status, note: modal.note || undefined }
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
            {entries.map(e => (
              <div key={e.id} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-3 flex items-center gap-4">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_BADGE[e.status]}`}>
                  {e.status}
                </span>
                <span className="text-white text-sm flex-1">
                  {e.startDate} → {e.endDate}
                </span>
                {e.note && (
                  <span className="text-blue-300 text-xs italic truncate max-w-xs">{e.note}</span>
                )}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setModal({ mode: 'edit', entry: e, startDate: e.startDate, endDate: e.endDate, status: e.status, note: e.note ?? '' })}
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
            ))}
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
          <div className="w-full max-w-md bg-blue-900/95 border border-white/20 rounded-2xl p-6 space-y-5 shadow-2xl">
            <h2 className="text-white font-bold text-lg">
              {modal.mode === 'add' ? 'Add Availability Entry' : 'Edit Entry'}
            </h2>

            {/* Start date */}
            <div>
              <label className="text-blue-200 text-xs font-medium block mb-1">Start Date</label>
              <input
                type="date"
                value={modal.startDate}
                onChange={e => setModal(m => m ? { ...m, startDate: e.target.value } : m)}
                className="w-full bg-white/10 border border-white/25 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* End date */}
            <div>
              <label className="text-blue-200 text-xs font-medium block mb-1">End Date</label>
              <input
                type="date"
                value={modal.endDate}
                min={modal.startDate}
                onChange={e => setModal(m => m ? { ...m, endDate: e.target.value } : m)}
                className="w-full bg-white/10 border border-white/25 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Status */}
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

            {/* Note */}
            <div>
              <label className="text-blue-200 text-xs font-medium block mb-1">Note (optional)</label>
              <input
                type="text"
                value={modal.note}
                onChange={e => setModal(m => m ? { ...m, note: e.target.value } : m)}
                placeholder="e.g. Charter for Smith family"
                className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

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
