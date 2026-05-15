'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';
import {
  getAllCharters,
  createCharter,
  updateCharter,
  deleteCharter,
  type Charter,
  type CharterStatus,
  CHARTER_STATUS_LABEL,
} from '../../../lib/availability';
import {
  marinas,
  getMarinaById,
  distanceFromNeaPeramos,
  formatNavTime,
  DEFAULT_MARINA_ID,
} from '../../marinas-data';
import MarinaMap from '../MarinaMap';

const STATUS_BADGE: Record<CharterStatus, string> = {
  web_request:     'bg-sky-400/30 text-sky-200',
  broker_request:  'bg-amber-400/30 text-amber-200',
  serious_request: 'bg-orange-500/30 text-orange-200',
  confirmed:       'bg-emerald-500/30 text-emerald-200',
  signed:          'bg-emerald-800/30 text-emerald-100',
  canceled:        'bg-gray-500/30 text-gray-300',
  owner_use:       'bg-purple-500/30 text-purple-200',
  maintenance:     'bg-red-500/30 text-red-200',
};

const CLIENT_STATUSES: CharterStatus[] = [
  'web_request', 'broker_request', 'serious_request', 'confirmed', 'signed',
];

interface ModalState {
  mode: 'add' | 'edit';
  entry?: Charter;
  startDate: string;
  endDate: string;
  status: CharterStatus;
  // client info
  name: string;
  email: string;
  phone: string;
  passengers: string;
  boat: string;
  // location
  deliveryPoint: string;
  redeliveryPoint: string;
  // misc
  note: string;
  selectedTheme: string;
  holidayDescription: string;
}

export default function AvailabilityAdminClient() {
  const { hasPermission } = useAuth();
  const [entries, setEntries] = useState<Charter[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [modal, setModal] = useState<ModalState | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllCharters()
      .then(setEntries)
      .catch(() => setError('Could not load entries.'))
      .finally(() => setLoading(false));
  }, []);

  function openAddModal(dateStr: string) {
    setModal({
      mode: 'add',
      startDate: dateStr,
      endDate: addDays(dateStr, 7),
      status: 'confirmed',
      name: '', email: '', phone: '', passengers: '', boat: '',
      deliveryPoint: DEFAULT_MARINA_ID,
      redeliveryPoint: DEFAULT_MARINA_ID,
      note: '', selectedTheme: '', holidayDescription: '',
    });
  }

  function openEditModal(entry: Charter) {
    setModal({
      mode: 'edit',
      entry,
      startDate: entry.startDate,
      endDate: entry.endDate,
      status: entry.status,
      name: entry.name ?? '',
      email: entry.email ?? '',
      phone: entry.phone ?? '',
      passengers: entry.passengers != null ? String(entry.passengers) : '',
      boat: entry.boat ?? '',
      deliveryPoint: entry.deliveryPoint ?? DEFAULT_MARINA_ID,
      redeliveryPoint: entry.redeliveryPoint ?? entry.deliveryPoint ?? DEFAULT_MARINA_ID,
      note: entry.note ?? '',
      selectedTheme: entry.selectedTheme ?? '',
      holidayDescription: entry.holidayDescription ?? '',
    });
  }

  function handleDayClick(dateStr: string) {
    const existing = entries.find(e => dateStr >= e.startDate && dateStr <= e.endDate);
    if (existing) openEditModal(existing);
    else openAddModal(dateStr);
  }

  function modalToData(m: ModalState): Omit<Charter, 'id' | 'createdAt'> {
    const hasClient = CLIENT_STATUSES.includes(m.status);
    return {
      status: m.status,
      startDate: m.startDate,
      endDate: m.endDate,
      ...(hasClient && m.name ? { name: m.name } : {}),
      ...(hasClient && m.email ? { email: m.email } : {}),
      ...(hasClient && m.phone ? { phone: m.phone } : {}),
      ...(hasClient && m.passengers ? { passengers: Number(m.passengers) } : {}),
      ...(m.boat ? { boat: m.boat } : {}),
      deliveryPoint: m.deliveryPoint,
      redeliveryPoint: m.redeliveryPoint,
      ...(m.note ? { note: m.note } : {}),
      ...(m.selectedTheme ? { selectedTheme: m.selectedTheme } : {}),
      ...(m.holidayDescription ? { holidayDescription: m.holidayDescription } : {}),
    };
  }

  async function handleSave() {
    if (!modal) return;
    if (!modal.startDate || !modal.endDate) return;
    if (modal.endDate < modal.startDate) { setError('End date must be on or after start date.'); return; }
    setSaving(true);
    setError('');
    try {
      const data = modalToData(modal);
      if (modal.mode === 'add') {
        const id = await createCharter(data);
        setEntries(prev => [...prev, { id, ...data, createdAt: null }]
          .sort((a, b) => a.startDate.localeCompare(b.startDate)));
      } else if (modal.entry) {
        await updateCharter(modal.entry.id, data);
        setEntries(prev =>
          prev.map(e => e.id === modal.entry!.id ? { ...e, ...data } : e)
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
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteCharter(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setModal(null);
    } catch {
      setError('Failed to delete. Please try again.');
    }
  }

  const showClientFields = modal ? CLIENT_STATUSES.includes(modal.status) : false;

  if (!hasPermission('availability')) {
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
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white font-bold text-2xl">Charter Calendar</h1>
            <p className="text-blue-200 text-xs mt-0.5">Click any date on the calendar to add or edit a charter entry</p>
          </div>
          <button
            onClick={() => openAddModal(new Date().toISOString().slice(0, 10))}
            className="flex-shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </button>
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

        {!loading && entries.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-white font-semibold text-sm">All Entries</h2>
            {entries.map(e => {
              const delMarina = getMarinaById(e.deliveryPoint ?? '');
              const relMarina = getMarinaById(e.redeliveryPoint ?? e.deliveryPoint ?? '');
              return (
                <div key={e.id} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-3 flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[e.status]}`}>
                    {CHARTER_STATUS_LABEL[e.status]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm">{e.startDate} → {e.endDate}</span>
                    {e.name && <span className="text-blue-200 text-xs ml-2">{e.name}</span>}
                    {(delMarina || relMarina) && (
                      <p className="text-blue-300 text-xs mt-0.5 truncate">
                        {delMarina ? `↓ ${delMarina.name}` : ''}
                        {delMarina && relMarina && delMarina.id !== relMarina.id ? ` · ↑ ${relMarina.name}` : ''}
                      </p>
                    )}
                    {e.note && <p className="text-blue-300 text-xs italic truncate">{e.note}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(e)}
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
          <div className="w-full max-w-lg bg-blue-900/95 border border-white/20 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-bold text-lg">
              {modal.mode === 'add' ? 'Add Charter Entry' : 'Edit Entry'}
            </h2>

            {/* Status */}
            <div>
              <label className="text-blue-200 text-xs font-medium block mb-1">Status</label>
              <select
                value={modal.status}
                onChange={e => setModal(m => m ? { ...m, status: e.target.value as CharterStatus } : m)}
                className="w-full bg-blue-800 border border-white/25 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                {(Object.keys(CHARTER_STATUS_LABEL) as CharterStatus[]).map(s => (
                  <option key={s} value={s}>{CHARTER_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>

            {/* Dates + Location */}
            <div className="grid grid-cols-2 gap-3 items-start">
              <div className="min-w-0">
                <label className="text-blue-200 text-xs font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={modal.startDate}
                  onChange={e => setModal(m => m ? { ...m, startDate: e.target.value } : m)}
                  className="w-full bg-blue-800 border border-white/25 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-blue-400 [color-scheme:dark]"
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
                  className="w-full bg-blue-800 border border-white/25 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-blue-400 [color-scheme:dark]"
                />
              </div>
              <MarinaSelectWithInfo
                label="Redelivery"
                value={modal.redeliveryPoint}
                onChange={v => setModal(m => m ? { ...m, redeliveryPoint: v } : m)}
              />
            </div>

            {/* Client fields — shown for charter statuses with a client */}
            {showClientFields && (
              <div className="space-y-3 pt-1 border-t border-white/10">
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide">Client Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name" value={modal.name} onChange={v => setModal(m => m ? { ...m, name: v } : m)} />
                  <Field label="Email" type="email" value={modal.email} onChange={v => setModal(m => m ? { ...m, email: v } : m)} />
                  <Field label="Phone" type="tel" value={modal.phone} onChange={v => setModal(m => m ? { ...m, phone: v } : m)} />
                  <Field label="Passengers" type="number" value={modal.passengers} onChange={v => setModal(m => m ? { ...m, passengers: v } : m)} />
                  <div className="col-span-2">
                    <Field label="Boat" value={modal.boat} onChange={v => setModal(m => m ? { ...m, boat: v } : m)} />
                  </div>
                </div>
                <div>
                  <label className="text-blue-200 text-xs font-medium block mb-1">Holiday Description</label>
                  <textarea
                    value={modal.holidayDescription}
                    onChange={e => setModal(m => m ? { ...m, holidayDescription: e.target.value } : m)}
                    rows={2}
                    className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400 resize-none"
                    placeholder="Client wishes / description…"
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="text-blue-200 text-xs font-medium block mb-1">Note</label>
              <input
                type="text"
                value={modal.note}
                onChange={e => setModal(m => m ? { ...m, note: e.target.value } : m)}
                placeholder="Internal note…"
                className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
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

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-blue-200 text-xs font-medium block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400"
      />
    </div>
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
