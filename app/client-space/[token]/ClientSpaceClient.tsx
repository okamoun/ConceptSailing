'use client';

import { useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import Image from 'next/image';
import {
  getClientPreparation,
  getCharterByClientSpaceToken,
  saveCrew,
  saveTravel,
  saveActivities,
  saveFood,
  saveBeverages,
  saveSpecial,
  saveChecklist,
  saveStep,
  saveSnapshot,
  getHistory,
  restoreSnapshot,
  CHECKLIST_CATEGORIES,
  type ClientPreparation,
  type CrewMember,
  type TravelLogistics,
  type TravelGroup,
  type ActivityPreferences,
  type FoodPreferences,
  type BeveragePreferences,
  type SpecialRequests,
  type PrepSnapshot,
} from '../../../lib/clientSpace';
import type { Charter } from '../../../lib/availability';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';
import { getMarinaById, marinasByRegion } from '../../marinas-data';
import { CONTACT } from '../../config/contact';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function nightCount(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}

function fmtDateTime(ts: PrepSnapshot['savedAt'] | null | undefined): string {
  if (!ts) return '—';
  const d = ts.toDate?.() ?? new Date();
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// Debounced auto-save hook. Skips the first render. Returns 'idle' | 'saving' | 'saved'.
function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  delay = 1800
): 'idle' | 'saving' | 'saved' {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const dataStr = JSON.stringify(data);
  const prevStr = useRef(dataStr);
  const saveFnRef = useRef(saveFn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  saveFnRef.current = saveFn;

  useEffect(() => {
    if (dataStr === prevStr.current) return;
    prevStr.current = dataStr;
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');
    const snapshot = dataStr;
    timerRef.current = setTimeout(async () => {
      try {
        await saveFnRef.current(JSON.parse(snapshot) as T);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2500);
      } catch {
        setStatus('idle');
      }
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [dataStr, delay]);

  return status;
}

const STEPS = [
  'Your Charter',
  'Crew Details',
  'Travel & Logistics',
  'Activities & Health',
  'Food Preferences',
  'Beverages & Bar',
  'Special Requests',
];

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const NATIONALITIES = [
  'American', 'Australian', 'Austrian', 'Belgian', 'Brazilian', 'British', 'Canadian',
  'Chinese', 'Danish', 'Dutch', 'Finnish', 'French', 'German', 'Greek', 'Irish',
  'Israeli', 'Italian', 'Japanese', 'Norwegian', 'Polish', 'Portuguese', 'Russian',
  'South African', 'Spanish', 'Swedish', 'Swiss', 'Turkish', 'Other',
];

const ACTIVITY_OPTIONS = [
  'Sailing', 'Swimming', 'Snorkelling', 'Fishing', 'Water Skiing', 'Kayaking',
  'Island Hiking', 'Local Cuisine Tour', 'Sun Bathing', 'Beach Combing',
  'Yoga on Deck', 'Star Gazing', 'Shopping', 'Nightlife', 'Scuba Diving',
  'Paddleboarding', 'Windsurfing',
];

const WARM_BEVERAGES = [
  'Espresso', 'Cappuccino', 'Filter Coffee', 'Hot Chocolate',
  'Green Tea', 'Black Tea', 'Chamomile / Mint Infusions', 'Decaf Coffee',
];

const BREAKFAST_STYLES = [
  { id: 'light', label: 'Light / Cold' },
  { id: 'american', label: 'American (pancakes, muffins)' },
  { id: 'full', label: 'Full Cooked (eggs, bacon, sausage)' },
];

const BREAKFAST_ITEMS = [
  'Eggs', 'Bacon', 'Yoghurt', 'Fruits', 'Cereals', 'Cold Cuts',
  'Honey', 'Jam', 'Soy / Almond Milk', 'Vegetables', 'Butter', 'Bread',
];

const MEAL_STYLES = ['Light', 'Heavy', 'Hot'];

const SODA_TYPES = [
  'Coke 0.5 l', 'Diet Coke 0.5 l', 'Sprite 0.5 l', 'Pepsi 0.5 l',
  'Orange Juice 1.0 l', 'Apple Juice 1.0 l', 'Cranberry Juice 1.0 l',
  'Tonic Water 1.5 l', 'Tomato Juice 1.0 l', 'Water Still 0.5 l', 'Water Sparkling 0.5 l',
  'Others',
];

const WINE_TYPES = ['White Wine', 'Red Wine', 'Rosé Wine', 'Champagne / Sparkling'];

const SPIRIT_TYPES = [
  'Vodka', 'Gin', 'Rum', 'Whisky / Scotch', 'Tequila',
  'Beer (local)', 'Beer (imported)', 'Liqueurs',
];

const FOOD_CATEGORIES = ['Seafood', 'Fish', 'Meat', 'Fruit', 'Vegetables', 'Dairy', 'Other'] as const;
const CUISINE_TYPES = ['Greek', 'Italian', 'French', 'Asian', 'Fusion', 'Mediterranean', 'Other'] as const;

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-emerald-600 text-white text-sm rounded-xl shadow-xl animate-fade-in-up">
      {msg}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable field components
// ---------------------------------------------------------------------------

const inputBase = 'w-full appearance-none !bg-transparent !border-0 !border-b !border-blue-300/60 !rounded-none !px-0 !shadow-none py-1.5 text-xs text-blue-900 placeholder:text-blue-300/70 transition-all focus:outline-none focus:!border-blue-600 focus:!shadow-none';

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">{children}</label>;
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputBase}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputBase} resize-none leading-relaxed`}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={inputBase}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function PillToggle({ options, value, onChange }: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(value === o.id ? '' : o.id)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
            value === o.id
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MultiChip({ options, values, onChange }: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
            values.includes(o)
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function PassengerNotes({ crew, notes, onChange }: {
  crew: CrewMember[];
  notes: Record<string, string>;
  onChange: (notes: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  if (crew.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
      >
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Per passenger details
        {Object.values(notes).some(Boolean) && (
          <span className="ml-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center">
            {Object.values(notes).filter(Boolean).length}
          </span>
        )}
      </button>
      {open && (
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-blue-100">
          {crew.map((m, i) => {
            const name = [m.firstName, m.lastName].filter(Boolean).join(' ') || `Passenger ${i + 1}`;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-blue-600 w-28 flex-shrink-0 truncate">{name}</span>
                <input
                  type="text"
                  value={notes[String(i)] ?? ''}
                  onChange={e => onChange({ ...notes, [String(i)]: e.target.value })}
                  placeholder="Specific note…"
                  className="flex-1 !bg-transparent !border-0 !border-b !border-blue-300/60 !rounded-none !px-0 !shadow-none py-1.5 text-xs text-blue-900 placeholder:text-blue-300/70 focus:outline-none focus:!border-blue-600 focus:!shadow-none transition-all"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AutoSaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' }) {
  if (status === 'idle') return null;
  return (
    <span className={`text-[10px] font-medium transition-all ${status === 'saved' ? 'text-emerald-400' : 'text-blue-300 animate-pulse'}`}>
      {status === 'saving' ? '⟳ saving…' : '✓ saved'}
    </span>
  );
}

function SectionCard({ title, autoSave, children }: { title: string; autoSave?: 'idle' | 'saving' | 'saved'; children: ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-3 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">{title}</h3>
        {autoSave && <AutoSaveIndicator status={autoSave} />}
      </div>
      {children}
    </div>
  );
}

function SaveButton({ onClick, saving, label = 'Save & Continue' }: {
  onClick: () => void; saving: boolean; label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="btn-primary px-5 py-2 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {saving ? 'Saving…' : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-shrink-0">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-all ${
            i === current ? 'bg-white text-blue-700 font-semibold' : i < current ? 'bg-white/25 text-white' : 'bg-white/8 text-blue-300'
          }`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
              i < current ? 'bg-emerald-400 text-white' : i === current ? 'bg-blue-600 text-white' : 'bg-white/15 text-blue-400'
            }`}>
              {i < current ? '✓' : i + 1}
            </span>
            <span className="hidden md:inline">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`w-3 h-px ${i < current ? 'bg-emerald-400/50' : 'bg-white/15'}`} />}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 0: Charter overview
// ---------------------------------------------------------------------------

function BookingOverview({ charter }: { charter: Charter }) {
  const delivery = getMarinaById(charter.deliveryPoint ?? '');
  const redelivery = getMarinaById(charter.redeliveryPoint ?? charter.deliveryPoint ?? '');
  const nights = charter.startDate && charter.endDate ? nightCount(charter.startDate, charter.endDate) : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          { label: 'Start', value: charter.startDate ? fmtDate(charter.startDate) : '—' },
          { label: 'End', value: charter.endDate ? `${fmtDate(charter.endDate)}${nights ? ` · ${nights}n` : ''}` : '—' },
          { label: 'Vessel', value: charter.boat ?? 'Fountaine Pajot Aura 51' },
          { label: 'Guests', value: charter.passengers ? `${charter.passengers} pax` : '—' },
          { label: 'Embarkation', value: delivery?.name ?? charter.embarkationPoint ?? '—' },
          { label: 'Disembarkation', value: redelivery?.name ?? delivery?.name ?? '—' },
          ...(charter.selectedTheme ? [{ label: 'Theme', value: charter.selectedTheme }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/60 rounded-lg px-3 py-2">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">{label}</p>
            <p className="text-xs font-medium text-blue-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>
      {charter.holidayDescription && (
        <div className="bg-blue-50/60 rounded-lg px-3 py-2">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">Holiday Vision</p>
          <p className="text-xs text-blue-800 italic mt-0.5">&ldquo;{charter.holidayDescription}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Crew
// ---------------------------------------------------------------------------

function CrewStep({ count, initial, token, onSave, onAutoSave }: {
  count: number;
  initial: CrewMember[];
  token: string;
  onSave: (crew: CrewMember[]) => Promise<void>;
  onAutoSave: (crew: CrewMember[]) => Promise<void>;
}) {
  const empty = (): CrewMember => ({
    firstName: '', lastName: '', gender: '', dateOfBirth: '',
    nationality: '', passportNumber: '', dietaryRestrictions: '', medicalNotes: '',
  });

  const [crew, setCrew] = useState<CrewMember[]>(() => {
    const base = Array.from({ length: count }, (_, i) => initial[i] ?? empty());
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(0);
  const autoStatus = useAutoSave(crew, onAutoSave);

  function update(i: number, field: keyof CrewMember, val: string) {
    setCrew(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  }

  const [uploading, setUploading] = useState<Record<number, boolean>>({});

  async function uploadPassport(i: number, file: File) {
    setUploading(prev => ({ ...prev, [i]: true }));
    try {
      const storageRef = ref(storage, `clientPreparations/${token}/passport/${i}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setCrew(prev => prev.map((m, idx) => idx === i ? { ...m, passportImageUrl: url } : m));
    } finally {
      setUploading(prev => ({ ...prev, [i]: false }));
    }
  }

  async function handleSave() {
    setSaving(true);
    try { await onSave(crew); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end mb-1"><AutoSaveIndicator status={autoStatus} /></div>
      {crew.map((m, i) => (
        <div key={i} className="bg-white/70 border border-blue-100 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setExpanded(expanded === i ? -1 : i)}
            className="w-full flex items-center justify-between px-3 py-2 text-left"
          >
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Passenger {i + 1}</span>
              <p className="text-xs font-semibold text-blue-900 mt-0.5">
                {m.firstName || m.lastName ? `${m.firstName} ${m.lastName}`.trim() : 'Fill in details below'}
              </p>
            </div>
            <svg className={`w-4 h-4 text-blue-400 transition-transform ${expanded === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded === i && (
            <div className="px-3 pb-3 space-y-2 border-t border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <div>
                  <FieldLabel>First Name</FieldLabel>
                  <TextInput value={m.firstName} onChange={v => update(i, 'firstName', v)} placeholder="First name" />
                </div>
                <div>
                  <FieldLabel>Last Name</FieldLabel>
                  <TextInput value={m.lastName} onChange={v => update(i, 'lastName', v)} placeholder="Last name" />
                </div>
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <SelectInput value={m.gender ?? ''} onChange={v => update(i, 'gender', v)} options={GENDERS} placeholder="Select…" />
                </div>
                <div>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <TextInput value={m.dateOfBirth ?? ''} onChange={v => update(i, 'dateOfBirth', v)} type="date" />
                </div>
                <div>
                  <FieldLabel>Nationality</FieldLabel>
                  <SelectInput value={m.nationality ?? ''} onChange={v => update(i, 'nationality', v)} options={NATIONALITIES} placeholder="Select…" />
                </div>
                <div>
                  <FieldLabel>Passport Number</FieldLabel>
                  <TextInput value={m.passportNumber ?? ''} onChange={v => update(i, 'passportNumber', v)} placeholder="Optional" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <FieldLabel>Passport Photo</FieldLabel>
                  <div className="flex items-center gap-3">
                    {m.passportImageUrl ? (
                      <a href={m.passportImageUrl} target="_blank" rel="noopener noreferrer">
                        <img src={m.passportImageUrl} alt="Passport" className="w-16 h-10 object-cover rounded border border-blue-200" />
                      </a>
                    ) : (
                      <div className="w-16 h-10 rounded border border-blue-200/60 border-dashed flex items-center justify-center bg-blue-50/30">
                        <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-blue-200/60 text-xs text-blue-600 hover:bg-blue-50 transition-colors">
                      {uploading[i] ? 'Uploading…' : m.passportImageUrl ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        disabled={uploading[i]}
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadPassport(i, f); }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <FieldLabel>Dietary Restrictions</FieldLabel>
                <TextArea
                  value={m.dietaryRestrictions ?? ''}
                  onChange={v => update(i, 'dietaryRestrictions', v)}
                  placeholder="Vegetarian, gluten-free, nut allergy…"
                  rows={2}
                />
              </div>
              <div>
                <FieldLabel>Medical Notes</FieldLabel>
                <TextArea
                  value={m.medicalNotes ?? ''}
                  onChange={v => update(i, 'medicalNotes', v)}
                  placeholder="Any conditions the crew should be aware of (confidential)"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save Crew Details" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Travel & Logistics
// ---------------------------------------------------------------------------

function newGroup(id: string, memberIndices: number[], charter?: Charter): TravelGroup {
  return {
    id,
    memberIndices,
    ...(charter?.startDate ? { arrivalDate: charter.startDate } : {}),
    ...(charter?.endDate ? { departureDate: charter.endDate } : {}),
  };
}

function initGroups(initial: TravelLogistics, passengerCount: number, charter?: Charter): TravelGroup[] {
  if (initial.groups && initial.groups.length > 0) return initial.groups;
  const g = newGroup('g1', Array.from({ length: passengerCount }, (_, i) => i), charter);
  return [g];
}

function TableRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr className="border-t border-blue-100">
      <td className="py-2 pr-3 text-[10px] font-semibold text-blue-500 uppercase tracking-wide whitespace-nowrap w-32 align-top pt-2.5">
        {label}
      </td>
      {children}
    </tr>
  );
}

function TravelStep({ initial, crew, charter, onSave, onAutoSave }: {
  initial: TravelLogistics;
  crew: CrewMember[];
  charter: Charter;
  onSave: (travel: TravelLogistics) => Promise<void>;
  onAutoSave: (travel: TravelLogistics) => Promise<void>;
}) {
  const passengerCount = Math.max(crew.length, 1);
  const [groups, setGroups] = useState<TravelGroup[]>(() => initGroups(initial, passengerCount, charter));
  const [saving, setSaving] = useState(false);

  const defaultEmbark = getMarinaById(charter.deliveryPoint ?? '')?.name ?? charter.embarkationPoint ?? '';
  const defaultDisembark = getMarinaById(charter.redeliveryPoint ?? charter.deliveryPoint ?? '')?.name ?? charter.embarkationPoint ?? '';
  const [embarkationPoint, setEmbarkationPoint] = useState(initial.embarkationPoint ?? defaultEmbark);
  const [disembarkationPoint, setDisembarkationPoint] = useState(initial.disembarkationPoint ?? defaultDisembark);

  const regionedMarinas = marinasByRegion();

  const data: TravelLogistics = { groups, embarkationPoint, disembarkationPoint };
  const autoStatus = useAutoSave(data, onAutoSave);

  function updateGroup(id: string, patch: Partial<TravelGroup>) {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  }

  function addGroup() {
    const id = `g${Date.now()}`;
    setGroups(prev => [...prev, newGroup(id, [], charter)]);
  }

  function removeGroup(id: string) {
    if (groups.length <= 1) return;
    setGroups(prev => prev.filter(g => g.id !== id));
  }

  // Toggle a member between groups — exclusive: adding to one removes from others
  function toggleMember(groupId: string, idx: number) {
    setGroups(prev => {
      const inGroup = prev.find(g => g.id === groupId)?.memberIndices.includes(idx);
      return prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            memberIndices: inGroup
              ? g.memberIndices.filter(i => i !== idx)
              : [...g.memberIndices, idx].sort((a, b) => a - b),
          };
        }
        // Remove from other groups (exclusive)
        return { ...g, memberIndices: g.memberIndices.filter(i => i !== idx) };
      });
    });
  }

  function memberName(idx: number) {
    const m = crew[idx];
    if (!m) return `Passenger ${idx + 1}`;
    const name = [m.firstName, m.lastName].filter(Boolean).join(' ');
    return name || `Passenger ${idx + 1}`;
  }

  async function handleSave() {
    setSaving(true);
    try { await onSave(data); } finally { setSaving(false); }
  }

  const colCount = groups.length;

  return (
    <div className="space-y-4">
      {/* Embarkation / Disembarkation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>Embarkation Point</FieldLabel>
          <select
            value={embarkationPoint}
            onChange={e => setEmbarkationPoint(e.target.value)}
            className="!bg-transparent !border-0 !border-b !border-blue-300/60 !rounded-none !px-0 !shadow-none py-1.5 text-xs text-blue-900 transition-all focus:outline-none focus:!border-blue-600 w-full"
          >
            <option value="">Select marina…</option>
            {Object.entries(regionedMarinas).map(([region, ms]) => (
              <optgroup key={region} label={region}>
                {ms.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Disembarkation Point</FieldLabel>
          <select
            value={disembarkationPoint}
            onChange={e => setDisembarkationPoint(e.target.value)}
            className="!bg-transparent !border-0 !border-b !border-blue-300/60 !rounded-none !px-0 !shadow-none py-1.5 text-xs text-blue-900 transition-all focus:outline-none focus:!border-blue-600 w-full"
          >
            <option value="">Select marina…</option>
            {Object.entries(regionedMarinas).map(([region, ms]) => (
              <optgroup key={region} label={region}>
                {ms.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <AutoSaveIndicator status={autoStatus} />
        <button
          type="button"
          onClick={addGroup}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Travel Group
        </button>
      </div>

      {/* ── Mobile: stacked cards (< md) ── */}
      <div className="md:hidden space-y-4">
        {groups.map((g, gi) => (
          <div key={g.id} className="border-b border-blue-100/60 pb-4">
            {/* Group header */}
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-bold text-blue-900">Group {gi + 1}</span>
                <span className="ml-2 text-[11px] text-blue-400">
                  {g.memberIndices.length === 0 ? 'No members' : g.memberIndices.length === passengerCount ? 'All passengers' : `${g.memberIndices.length} passenger${g.memberIndices.length > 1 ? 's' : ''}`}
                </span>
              </div>
              {colCount > 1 && (
                <button type="button" onClick={() => removeGroup(g.id)} className="w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center text-[10px] transition-colors">✕</button>
              )}
            </div>

            <div className="space-y-4">
              {/* Members */}
              <div>
                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1.5">Members</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: passengerCount }, (_, idx) => {
                    const selected = g.memberIndices.includes(idx);
                    return (
                      <button key={idx} type="button" onClick={() => toggleMember(g.id, idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-200 text-blue-500 hover:border-blue-400'}`}
                      >{memberName(idx)}</button>
                    );
                  })}
                </div>
              </div>

              {/* Arrival */}
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 border-t border-blue-100 pt-3">Arrival</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <FieldLabel>Date</FieldLabel>
                    <TextInput value={g.arrivalDate ?? ''} onChange={v => updateGroup(g.id, { arrivalDate: v })} type="date" />
                  </div>
                  <div>
                    <FieldLabel>Time</FieldLabel>
                    <TextInput value={g.arrivalTime ?? ''} onChange={v => updateGroup(g.id, { arrivalTime: v })} type="time" />
                  </div>
                </div>
                <div className="mb-2">
                  <FieldLabel>Flight No.</FieldLabel>
                  <TextInput value={g.arrivalFlight ?? ''} onChange={v => updateGroup(g.id, { arrivalFlight: v })} placeholder="e.g. EZY1234" />
                  {g.arrivalFlight && (
                    <a
                      href={`https://flightaware.com/live/flight/${g.arrivalFlight.replace(/\s+/g, '').toUpperCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 mt-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Track flight live
                    </a>
                  )}
                </div>
                <div className="mb-2">
                  <FieldLabel>Hotel before boarding?</FieldLabel>
                  <PillToggle options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
                    value={g.stayingAtHotel ? 'yes' : g.stayingAtHotel === false ? 'no' : ''}
                    onChange={v => updateGroup(g.id, { stayingAtHotel: v === 'yes' })} />
                  {g.stayingAtHotel && (
                    <div className="mt-1.5">
                      <TextInput value={g.hotelName ?? ''} onChange={v => updateGroup(g.id, { hotelName: v })} placeholder="Hotel name & contact" />
                    </div>
                  )}
                </div>
                <div>
                  <FieldLabel>Transfer to marina?</FieldLabel>
                  <PillToggle options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
                    value={g.transferFromAirport ? 'yes' : g.transferFromAirport === false ? 'no' : ''}
                    onChange={v => updateGroup(g.id, { transferFromAirport: v === 'yes' })} />
                </div>
              </div>

              {/* Departure */}
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 border-t border-blue-100 pt-3">Departure</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <FieldLabel>Date</FieldLabel>
                    <TextInput value={g.departureDate ?? ''} onChange={v => updateGroup(g.id, { departureDate: v })} type="date" />
                  </div>
                  <div>
                    <FieldLabel>Time</FieldLabel>
                    <TextInput value={g.departureTime ?? ''} onChange={v => updateGroup(g.id, { departureTime: v })} type="time" />
                  </div>
                </div>
                <div className="mb-2">
                  <FieldLabel>Flight No.</FieldLabel>
                  <TextInput value={g.departureFlight ?? ''} onChange={v => updateGroup(g.id, { departureFlight: v })} placeholder="e.g. BA456" />
                  {g.departureFlight && (
                    <a
                      href={`https://flightaware.com/live/flight/${g.departureFlight.replace(/\s+/g, '').toUpperCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 mt-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Track flight live
                    </a>
                  )}
                </div>
                <div>
                  <FieldLabel>Transfer to airport?</FieldLabel>
                  <PillToggle options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
                    value={g.transferToAirport ? 'yes' : g.transferToAirport === false ? 'no' : ''}
                    onChange={v => updateGroup(g.id, { transferToAirport: v === 'yes' })} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: side-by-side table (md+) ── */}
      <div className="hidden md:block bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-blue-100">
              <th className="py-3 pr-4 w-36" />
              {groups.map((g, gi) => (
                <th key={g.id} className="py-2 px-2 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-blue-900">Group {gi + 1}</span>
                    {colCount > 1 && (
                      <button type="button" onClick={() => removeGroup(g.id)}
                        className="w-5 h-5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center text-[10px] transition-colors flex-shrink-0"
                        title="Remove group">✕</button>
                    )}
                  </div>
                  <p className="text-[10px] text-blue-400 mt-0.5">
                    {g.memberIndices.length === 0 ? 'No members assigned' : g.memberIndices.length === passengerCount ? 'All passengers' : `${g.memberIndices.length} passenger${g.memberIndices.length > 1 ? 's' : ''}`}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="px-4">

            <TableRow label="Members">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: passengerCount }, (_, idx) => {
                      const selected = g.memberIndices.includes(idx);
                      return (
                        <button key={idx} type="button" onClick={() => toggleMember(g.id, idx)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-200 text-blue-500 hover:border-blue-400'}`}
                        >{memberName(idx)}</button>
                      );
                    })}
                  </div>
                </td>
              ))}
            </TableRow>

            <tr className="border-t-2 border-blue-200">
              <td colSpan={colCount + 1} className="py-2 px-0">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Arrival</span>
              </td>
            </tr>

            <TableRow label="Date">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <TextInput value={g.arrivalDate ?? ''} onChange={v => updateGroup(g.id, { arrivalDate: v })} type="date" />
                </td>
              ))}
            </TableRow>

            <TableRow label="Time">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <TextInput value={g.arrivalTime ?? ''} onChange={v => updateGroup(g.id, { arrivalTime: v })} type="time" />
                </td>
              ))}
            </TableRow>

            <TableRow label="Flight No.">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <TextInput value={g.arrivalFlight ?? ''} onChange={v => updateGroup(g.id, { arrivalFlight: v })} placeholder="e.g. EZY1234" />
                  {g.arrivalFlight && (
                    <a
                      href={`https://flightaware.com/live/flight/${g.arrivalFlight.replace(/\s+/g, '').toUpperCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 mt-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Track flight live
                    </a>
                  )}
                </td>
              ))}
            </TableRow>

            <TableRow label="Hotel before boarding?">
              {groups.map(g => (
                <td key={g.id} className="py-2 px-3 align-top space-y-2">
                  <PillToggle options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
                    value={g.stayingAtHotel ? 'yes' : g.stayingAtHotel === false ? 'no' : ''}
                    onChange={v => updateGroup(g.id, { stayingAtHotel: v === 'yes' })} />
                  {g.stayingAtHotel && (
                    <TextInput value={g.hotelName ?? ''} onChange={v => updateGroup(g.id, { hotelName: v })} placeholder="Hotel name & contact" />
                  )}
                </td>
              ))}
            </TableRow>

            <TableRow label="Transfer to marina?">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <PillToggle options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
                    value={g.transferFromAirport ? 'yes' : g.transferFromAirport === false ? 'no' : ''}
                    onChange={v => updateGroup(g.id, { transferFromAirport: v === 'yes' })} />
                </td>
              ))}
            </TableRow>

            <tr className="border-t-2 border-blue-200">
              <td colSpan={colCount + 1} className="py-2 px-0">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Departure</span>
              </td>
            </tr>

            <TableRow label="Date">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <TextInput value={g.departureDate ?? ''} onChange={v => updateGroup(g.id, { departureDate: v })} type="date" />
                </td>
              ))}
            </TableRow>

            <TableRow label="Time">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <TextInput value={g.departureTime ?? ''} onChange={v => updateGroup(g.id, { departureTime: v })} type="time" />
                </td>
              ))}
            </TableRow>

            <TableRow label="Flight No.">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <TextInput value={g.departureFlight ?? ''} onChange={v => updateGroup(g.id, { departureFlight: v })} placeholder="e.g. BA456" />
                  {g.departureFlight && (
                    <a
                      href={`https://flightaware.com/live/flight/${g.departureFlight.replace(/\s+/g, '').toUpperCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 mt-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Track flight live
                    </a>
                  )}
                </td>
              ))}
            </TableRow>

            <TableRow label="Transfer to airport?">
              {groups.map(g => (
                <td key={g.id} className="py-1.5 px-2 align-top">
                  <PillToggle options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
                    value={g.transferToAirport ? 'yes' : g.transferToAirport === false ? 'no' : ''}
                    onChange={v => updateGroup(g.id, { transferToAirport: v === 'yes' })} />
                </td>
              ))}
            </TableRow>

          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save Travel Details" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Activities & Health
// ---------------------------------------------------------------------------

function ActivitiesStep({ initial, onSave, onAutoSave }: {
  initial: ActivityPreferences;
  onSave: (data: ActivityPreferences) => Promise<void>;
  onAutoSave: (data: ActivityPreferences) => Promise<void>;
}) {
  const [data, setData] = useState<ActivityPreferences>(initial);
  const [saving, setSaving] = useState(false);
  const autoStatus = useAutoSave(data, onAutoSave);
  function set<K extends keyof ActivityPreferences>(k: K, v: ActivityPreferences[K]) {
    setData(prev => ({ ...prev, [k]: v }));
  }
  async function handleSave() { setSaving(true); try { await onSave(data); } finally { setSaving(false); } }

  return (
    <div className="space-y-3">
      <SectionCard title="Group Style" autoSave={autoStatus}>
        <PillToggle
          options={[
            { id: 'active', label: 'Active & on the go' },
            { id: 'relaxed', label: 'Relaxed & laid-back' },
            { id: 'combination', label: 'A bit of both' },
          ]}
          value={data.groupStyle ?? ''}
          onChange={v => set('groupStyle', v as ActivityPreferences['groupStyle'])}
        />
      </SectionCard>

      <SectionCard title="Activities">
        <p className="text-xs text-blue-500">Select all that interest your group</p>
        <MultiChip
          options={ACTIVITY_OPTIONS}
          values={data.activities ?? []}
          onChange={v => set('activities', v)}
        />
        <div>
          <FieldLabel>Specific places or anchorages you&apos;d love to visit</FieldLabel>
          <TextInput
            value={data.specificPlaces ?? ''}
            onChange={v => set('specificPlaces', v)}
            placeholder="e.g. Santorini caldera, Blue Caves Zakynthos…"
          />
        </div>
      </SectionCard>

      <SectionCard title="Health & Experience">
        <div>
          <FieldLabel>Medical Information</FieldLabel>
          <TextArea
            value={data.healthNotes ?? ''}
            onChange={v => set('healthNotes', v)}
            placeholder="Heart conditions, severe allergies, mobility considerations — anything the crew should know (confidential)"
            rows={4}
          />
        </div>
        <div>
          <FieldLabel>Sailing & Chartering Experience</FieldLabel>
          <TextArea
            value={data.sailingExperience ?? ''}
            onChange={v => set('sailingExperience', v)}
            placeholder="Briefly describe your group's sailing background — helps us calibrate the pace"
            rows={3}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save Activities & Health" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Food preferences
// ---------------------------------------------------------------------------

function FoodStep({ initial, crew, onSave, onAutoSave }: {
  initial: FoodPreferences;
  crew: CrewMember[];
  onSave: (food: FoodPreferences) => Promise<void>;
  onAutoSave: (food: FoodPreferences) => Promise<void>;
}) {
  const [data, setData] = useState<FoodPreferences>(initial);
  const [saving, setSaving] = useState(false);
  const autoStatus = useAutoSave(data, onAutoSave);

  function setCategory(cat: string, field: 'likes' | 'dislikes' | 'allergies' | 'passengerNotes', val: string | Record<string, string>) {
    setData(prev => ({
      ...prev,
      [cat]: { ...(prev[cat as keyof FoodPreferences] as object ?? {}), [field]: val },
    }));
  }

  function set<K extends keyof FoodPreferences>(k: K, v: FoodPreferences[K]) {
    setData(prev => ({ ...prev, [k]: v }));
  }

  function toggleBreakfastStyle(id: string) {
    const current = data.breakfastStyle ?? [];
    set('breakfastStyle', current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }

  function toggleBreakfastItem(item: string) {
    const current = data.breakfastItems ?? [];
    set('breakfastItems', current.includes(item) ? current.filter(x => x !== item) : [...current, item]);
  }

  async function handleSave() { setSaving(true); try { await onSave(data); } finally { setSaving(false); } }

  type CatKey = Lowercase<typeof FOOD_CATEGORIES[number]>;

  return (
    <div className="space-y-3">
      <SectionCard title="Food Preferences by Category" autoSave={autoStatus}>
        <p className="text-xs text-blue-500">Help us plan menus tailored to your group</p>
        <div className="space-y-2">
          {FOOD_CATEGORIES.map(cat => {
            const key = cat.toLowerCase() as CatKey;
            const catData = (data[key as keyof FoodPreferences] as { likes?: string; dislikes?: string; allergies?: string }) ?? {};
            return (
              <div key={cat} className="border border-blue-100 rounded-lg p-2.5 space-y-2 bg-white/50">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">{cat}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <div>
                    <FieldLabel>Likes</FieldLabel>
                    <TextInput value={catData.likes ?? ''} onChange={v => setCategory(key, 'likes', v)} placeholder="e.g. grilled fish" />
                  </div>
                  <div>
                    <FieldLabel>Dislikes</FieldLabel>
                    <TextInput value={catData.dislikes ?? ''} onChange={v => setCategory(key, 'dislikes', v)} placeholder="e.g. anchovies" />
                  </div>
                  <div>
                    <FieldLabel>Allergies / Comments</FieldLabel>
                    <TextInput value={catData.allergies ?? ''} onChange={v => setCategory(key, 'allergies', v)} placeholder="e.g. shellfish allergy" />
                  </div>
                </div>
                <PassengerNotes
                  crew={crew}
                  notes={(catData as { passengerNotes?: Record<string, string> }).passengerNotes ?? {}}
                  onChange={notes => setCategory(key, 'passengerNotes', notes)}
                />
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Cuisine Preferences">
        <p className="text-xs text-blue-500 mb-2">Rate each cuisine from 1 (dislike) to 5 (love it)</p>
        <div className="space-y-2">
          {CUISINE_TYPES.map(cuisine => {
            const rating = (data.cuisineRatings ?? {})[cuisine] ?? 0;
            return (
              <div key={cuisine} className="flex items-center justify-between gap-3">
                <span className="text-xs text-blue-900 w-28 flex-shrink-0">{cuisine}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set('cuisineRatings', { ...(data.cuisineRatings ?? {}), [cuisine]: rating === n ? 0 : n })}
                      className={`w-7 h-7 rounded-full text-xs font-bold border transition-all ${
                        n <= rating
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/60 border-blue-200 text-blue-400 hover:border-blue-400'
                      }`}
                    >{n}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Breakfast">
        <div>
          <FieldLabel>Preferred style (select all that apply)</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            {BREAKFAST_STYLES.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleBreakfastStyle(s.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                  (data.breakfastStyle ?? []).includes(s.id)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Breakfast items</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            {BREAKFAST_ITEMS.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => toggleBreakfastItem(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                  (data.breakfastItems ?? []).includes(item)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-blue-200 text-blue-600 hover:border-blue-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard title="Lunch">
          <div>
            <FieldLabel>Style</FieldLabel>
            <PillToggle
              options={MEAL_STYLES.map(s => ({ id: s.toLowerCase(), label: s }))}
              value={data.lunchStyle ?? ''}
              onChange={v => set('lunchStyle', v)}
            />
          </div>
          <div>
            <FieldLabel>Dessert?</FieldLabel>
            <PillToggle
              options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
              value={data.lunchDessert === true ? 'yes' : data.lunchDessert === false ? 'no' : ''}
              onChange={v => set('lunchDessert', v === 'yes')}
            />
          </div>
          <div>
            <FieldLabel>Snacks / Hors d&apos;œuvres</FieldLabel>
            <TextInput value={data.lunchSnacks ?? ''} onChange={v => set('lunchSnacks', v)} placeholder="Cheese, crudités…" />
          </div>
        </SectionCard>

        <SectionCard title="Dinner">
          <div>
            <FieldLabel>Style</FieldLabel>
            <PillToggle
              options={MEAL_STYLES.map(s => ({ id: s.toLowerCase(), label: s }))}
              value={data.dinnerStyle ?? ''}
              onChange={v => set('dinnerStyle', v)}
            />
          </div>
          <div>
            <FieldLabel>Dessert?</FieldLabel>
            <PillToggle
              options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
              value={data.dinnerDessert === true ? 'yes' : data.dinnerDessert === false ? 'no' : ''}
              onChange={v => set('dinnerDessert', v === 'yes')}
            />
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save Food Preferences" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5: Beverages
// ---------------------------------------------------------------------------

function BeverageRow({ label, item, crew, onChange }: {
  label: string;
  item: { preferredBrand?: string; qty?: number; remarks?: string; passengerNotes?: Record<string, string> };
  crew: CrewMember[];
  onChange: (v: { preferredBrand?: string; qty?: number; remarks?: string; passengerNotes?: Record<string, string> }) => void;
}) {
  const inputCell = 'rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-xs text-blue-900 placeholder:text-blue-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200/60 transition-all shadow-sm hover:border-blue-300 w-full';
  return (
    <div className="py-2.5 border-b border-blue-50 last:border-0">
      <div className="grid grid-cols-[2fr_1fr_2fr] gap-2 items-center">
        <span className="text-xs font-semibold text-blue-800">{label}</span>
        <input
          type="number"
          min={0}
          placeholder="Qty"
          value={item.qty ?? ''}
          onChange={e => onChange({ ...item, qty: e.target.value ? Number(e.target.value) : undefined })}
          className={inputCell}
        />
        <input
          type="text"
          placeholder="Brand / remarks"
          value={item.preferredBrand ?? ''}
          onChange={e => onChange({ ...item, preferredBrand: e.target.value })}
          className={inputCell}
        />
      </div>
      <PassengerNotes
        crew={crew}
        notes={item.passengerNotes ?? {}}
        onChange={notes => onChange({ ...item, passengerNotes: notes })}
      />
    </div>
  );
}

function BeveragesStep({ initial, crew, onSave, onAutoSave }: {
  initial: BeveragePreferences;
  crew: CrewMember[];
  onSave: (bev: BeveragePreferences) => Promise<void>;
  onAutoSave: (bev: BeveragePreferences) => Promise<void>;
}) {
  const [data, setData] = useState<BeveragePreferences>(initial);
  const [saving, setSaving] = useState(false);
  const autoStatus = useAutoSave(data, onAutoSave);

  function updateRow(group: 'sodas' | 'wines' | 'spirits', key: string, val: { preferredBrand?: string; qty?: number; remarks?: string }) {
    setData(prev => ({ ...prev, [group]: { ...(prev[group] ?? {}), [key]: val } }));
  }

  async function handleSave() { setSaving(true); try { await onSave(data); } finally { setSaving(false); } }

  return (
    <div className="space-y-3">
      <SectionCard title="Hot Beverages" autoSave={autoStatus}>
        <MultiChip
          options={WARM_BEVERAGES}
          values={data.warmBeverages ?? []}
          onChange={v => setData(prev => ({ ...prev, warmBeverages: v }))}
        />
        <div>
          <FieldLabel>Other (please specify)</FieldLabel>
          <TextInput
            value={data.warmBeveragesOther ?? ''}
            onChange={v => setData(prev => ({ ...prev, warmBeveragesOther: v }))}
            placeholder="Any other hot beverage preferences"
          />
        </div>
      </SectionCard>

      {([
        { title: 'Sodas, Juices & Water', group: 'sodas' as const, types: SODA_TYPES },
        { title: 'Wines & Sparkling', group: 'wines' as const, types: WINE_TYPES },
        { title: 'Spirits & Beer', group: 'spirits' as const, types: SPIRIT_TYPES },
      ]).map(({ title, group, types }) => (
        <SectionCard key={group} title={title}>
          <div className="grid grid-cols-3 sm:grid-cols-[2fr_1fr_2fr] gap-2 mb-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Item</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Qty</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Brand / Notes</span>
          </div>
          {types.map(t => (
            <BeverageRow
              key={t}
              label={t}
              item={(data[group] ?? {})[t] ?? {}}
              crew={crew}
              onChange={v => updateRow(group, t, v)}
            />
          ))}
        </SectionCard>
      ))}

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save Beverage Preferences" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 6: Special requests + checklist
// ---------------------------------------------------------------------------

function SpecialStep({ initial, checklistInit, onSave, onAutoSave, onChecklistChange }: {
  initial: SpecialRequests;
  checklistInit: Record<string, boolean>;
  onSave: (data: SpecialRequests) => Promise<void>;
  onAutoSave: (data: SpecialRequests) => Promise<void>;
  onChecklistChange: (checklist: Record<string, boolean>) => void;
}) {
  const [data, setData] = useState<SpecialRequests>(initial);
  const [checklist, setChecklist] = useState<Record<string, boolean>>(checklistInit);
  const [saving, setSaving] = useState(false);
  const autoStatus = useAutoSave(data, onAutoSave);

  function set<K extends keyof SpecialRequests>(k: K, v: SpecialRequests[K]) {
    setData(prev => ({ ...prev, [k]: v }));
  }

  function toggleItem(id: string) {
    const next = { ...checklist, [id]: !checklist[id] };
    setChecklist(next);
    onChecklistChange(next);
  }

  const totalItems = CHECKLIST_CATEGORIES.flatMap(c => c.items).length;
  const checked = Object.values(checklist).filter(Boolean).length;

  async function handleSave() { setSaving(true); try { await onSave(data); } finally { setSaving(false); } }

  return (
    <div className="space-y-3">
      <SectionCard title="Special Requests" autoSave={autoStatus}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel>Special Occasion</FieldLabel>
            <TextInput
              value={data.celebration ?? ''}
              onChange={v => set('celebration', v)}
              placeholder="Birthday, anniversary, honeymoon…"
            />
          </div>
          <div>
            <FieldLabel>Music Atmosphere</FieldLabel>
            <TextInput
              value={data.musicAtmosphere ?? ''}
              onChange={v => set('musicAtmosphere', v)}
              placeholder="Jazz, Mediterranean, silence preferred…"
            />
          </div>
          <div>
            <FieldLabel>Pets on Board?</FieldLabel>
            <TextInput
              value={data.petsOnBoard ?? ''}
              onChange={v => set('petsOnBoard', v)}
              placeholder="Type and breed, or 'None'"
            />
          </div>
        </div>
        <div>
          <FieldLabel>Emergency Contact</FieldLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextInput value={data.emergencyContactName ?? ''} onChange={v => set('emergencyContactName', v)} placeholder="Full name" />
            <TextInput value={data.emergencyContactPhone ?? ''} onChange={v => set('emergencyContactPhone', v)} placeholder="Phone number" type="tel" />
            <TextInput value={data.emergencyContactRelation ?? ''} onChange={v => set('emergencyContactRelation', v)} placeholder="Relationship" />
          </div>
        </div>
        <div>
          <FieldLabel>Any Other Requests for the Crew</FieldLabel>
          <TextArea
            value={data.extraNotes ?? ''}
            onChange={v => set('extraNotes', v)}
            placeholder="Anything else we should know to make your holiday perfect"
            rows={4}
          />
        </div>
      </SectionCard>

      <div className="bg-white/70 border border-blue-100 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-blue-900">Pre-Departure Checklist</h3>
          <span className="text-sm font-semibold text-blue-600">{checked} / {totalItems}</span>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalItems ? (checked / totalItems) * 100 : 0}%` }}
          />
        </div>
        {CHECKLIST_CATEGORIES.map(cat => (
          <div key={cat.id}>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-2">{cat.label}</p>
            <div className="space-y-1.5">
              {cat.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all border ${
                    checklist[item.id]
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-white border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    checklist[item.id]
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-blue-300'
                  }`}>
                    {checklist[item.id] ? '✓' : ''}
                  </span>
                  <span className={`text-sm ${checklist[item.id] ? 'text-emerald-700 line-through' : 'text-blue-800'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={handleSave} saving={saving} label="Save & Complete" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props { token: string }

export default function ClientSpaceClient({ token }: Props) {
  const [charter, setCharter] = useState<Charter | null>(null);
  const [prep, setPrep] = useState<ClientPreparation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const checklistRef = useRef<Record<string, boolean>>({});
  const stepNavRef = useRef<HTMLDivElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<PrepSnapshot[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getCharterByClientSpaceToken(token),
      getClientPreparation(token),
    ])
      .then(([c, p]) => {
        if (!c || !p) { setNotFound(true); return; }
        setCharter(c);
        setPrep(p);
        checklistRef.current = p.checklist ?? {};
        setCurrentStep(p.lastSavedStep ?? 0);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  // Scroll active step tab into view on mobile
  useEffect(() => {
    if (!stepNavRef.current) return;
    const active = stepNavRef.current.children[currentStep] as HTMLElement | undefined;
    active?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [currentStep]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  // Auto-save (no snapshot, no step advance, no toast)
  async function autoSaveCrew(crew: CrewMember[]) {
    await saveCrew(token, crew);
    setPrep(prev => prev ? { ...prev, crew } : prev);
  }
  async function autoSaveTravel(travel: TravelLogistics) {
    await saveTravel(token, travel);
    setPrep(prev => prev ? { ...prev, travel } : prev);
  }
  async function autoSaveActivities(activities: ActivityPreferences) {
    await saveActivities(token, activities);
    setPrep(prev => prev ? { ...prev, activities } : prev);
  }
  async function autoSaveFood(food: FoodPreferences) {
    await saveFood(token, food);
    setPrep(prev => prev ? { ...prev, food } : prev);
  }
  async function autoSaveBeverages(beverages: BeveragePreferences) {
    await saveBeverages(token, beverages);
    setPrep(prev => prev ? { ...prev, beverages } : prev);
  }
  async function autoSaveSpecial(special: SpecialRequests) {
    await saveSpecial(token, special);
    setPrep(prev => prev ? { ...prev, special } : prev);
  }

  // Manual save (snapshot + step advance + toast)
  async function handleSaveCrew(crew: CrewMember[]) {
    await saveCrew(token, crew);
    const updated = prep ? { ...prep, crew } : null;
    setPrep(updated);
    if (updated) await saveSnapshot(token, updated, 'Crew details');
    await saveStep(token, Math.max(currentStep, 1));
    setCurrentStep(s => Math.max(s, 1));
    showToast('Crew details saved ✓');
  }

  async function handleSaveTravel(travel: TravelLogistics) {
    await saveTravel(token, travel);
    const updated = prep ? { ...prep, travel } : null;
    setPrep(updated);
    if (updated) await saveSnapshot(token, updated, 'Travel & logistics');
    await saveStep(token, Math.max(currentStep, 2));
    setCurrentStep(s => Math.max(s, 2));
    showToast('Travel details saved ✓');
  }

  async function handleSaveActivities(activities: ActivityPreferences) {
    await saveActivities(token, activities);
    const updated = prep ? { ...prep, activities } : null;
    setPrep(updated);
    if (updated) await saveSnapshot(token, updated, 'Activities & health');
    await saveStep(token, Math.max(currentStep, 3));
    setCurrentStep(s => Math.max(s, 3));
    showToast('Activities & health saved ✓');
  }

  async function handleSaveFood(food: FoodPreferences) {
    await saveFood(token, food);
    const updated = prep ? { ...prep, food } : null;
    setPrep(updated);
    if (updated) await saveSnapshot(token, updated, 'Food preferences');
    await saveStep(token, Math.max(currentStep, 4));
    setCurrentStep(s => Math.max(s, 4));
    showToast('Food preferences saved ✓');
  }

  async function handleSaveBeverages(beverages: BeveragePreferences) {
    await saveBeverages(token, beverages);
    const updated = prep ? { ...prep, beverages } : null;
    setPrep(updated);
    if (updated) await saveSnapshot(token, updated, 'Beverages & bar');
    await saveStep(token, Math.max(currentStep, 5));
    setCurrentStep(s => Math.max(s, 5));
    showToast('Beverage preferences saved ✓');
  }

  async function handleSaveSpecial(special: SpecialRequests) {
    await saveSpecial(token, special);
    const updated = prep ? { ...prep, special } : null;
    setPrep(updated);
    if (updated) await saveSnapshot(token, updated, 'Special requests');
    await saveStep(token, 6);
    setCurrentStep(6);
    showToast('All details saved — thank you! ✓');
  }

  function handleChecklistChange(checklist: Record<string, boolean>) {
    checklistRef.current = checklist;
    saveChecklist(token, checklist).catch(console.error);
  }

  async function openHistory() {
    setHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const h = await getHistory(token);
      setHistory(h);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleRestore(snapshot: PrepSnapshot) {
    if (!window.confirm('Restore this version? Your current data will be replaced.')) return;
    setRestoring(snapshot.id);
    try {
      await restoreSnapshot(token, snapshot);
      const p = await getClientPreparation(token);
      if (p) {
        setPrep(p);
        checklistRef.current = p.checklist ?? {};
      }
      setHistoryOpen(false);
      showToast('Previous version restored ✓');
    } finally {
      setRestoring(null);
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)' }}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20" />
          <p className="text-white/60 text-sm">Loading your holiday space…</p>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)' }}>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 text-center max-w-md">
          <p className="text-4xl mb-4">⛵</p>
          <h1 className="text-white text-xl font-bold mb-2">Link Not Found</h1>
          <p className="text-blue-200 text-sm mb-6">This preparation link may have expired or is incorrect. Please contact us for a new link.</p>
          <a href={`mailto:${CONTACT.email}`} className="btn-primary text-sm px-6 py-2.5">
            Contact BlueOne
          </a>
        </div>
      </div>
    );
  }

  if (!charter || !prep) return null;

  const passengerCount = charter.passengers ?? 1;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#003d7a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Image src="/images/boats/blueone/logo_blueone.png" alt="BlueOne" width={90} height={36} className="object-contain" unoptimized />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight">Holiday Preparation</p>
              {charter.name && <p className="text-blue-300 text-xs truncate">Welcome, {charter.name}</p>}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={openHistory}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors flex items-center gap-1.5"
                title="View edit history"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </button>
              <a
                href={`/client-space/${token}/summary`}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors flex items-center gap-1.5"
                title="View full summary"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Summary
              </a>
            </div>
          </div>
          <StepIndicator current={currentStep} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Step nav buttons */}
        <div ref={stepNavRef} className="flex gap-2 overflow-x-auto pb-1 scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {STEPS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentStep(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                i === currentStep
                  ? 'bg-white text-blue-700 border-white font-semibold'
                  : i <= (prep.lastSavedStep ?? 0)
                  ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  : 'bg-white/10 text-blue-300 border-white/10 hover:bg-white/15'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Section title */}
        <div>
          <h2 className="text-white text-2xl font-bold">{STEPS[currentStep]}</h2>
          {currentStep === 0 && charter.name && (
            <p className="text-blue-200 text-sm mt-1">
              Welcome aboard, {charter.name}. Let&apos;s prepare your perfect sailing holiday.
            </p>
          )}
        </div>

        {/* Step content */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <BookingOverview charter={charter} />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-primary px-8 py-3 text-sm font-semibold"
              >
                Let&apos;s Get Started →
              </button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <CrewStep count={passengerCount} initial={prep.crew} token={token} onSave={handleSaveCrew} onAutoSave={autoSaveCrew} />
        )}

        {currentStep === 2 && (
          <TravelStep initial={prep.travel} crew={prep.crew} charter={charter} onSave={handleSaveTravel} onAutoSave={autoSaveTravel} />
        )}

        {currentStep === 3 && (
          <ActivitiesStep initial={prep.activities} onSave={handleSaveActivities} onAutoSave={autoSaveActivities} />
        )}

        {currentStep === 4 && (
          <FoodStep initial={prep.food} crew={prep.crew} onSave={handleSaveFood} onAutoSave={autoSaveFood} />
        )}

        {currentStep === 5 && (
          <BeveragesStep initial={prep.beverages} crew={prep.crew} onSave={handleSaveBeverages} onAutoSave={autoSaveBeverages} />
        )}

        {currentStep === 6 && (
          <SpecialStep
            initial={prep.special}
            checklistInit={prep.checklist ?? {}}
            onSave={handleSaveSpecial}
            onAutoSave={autoSaveSpecial}
            onChecklistChange={handleChecklistChange}
          />
        )}

        {/* Prev / Next navigation */}
        {currentStep > 0 && (
          <div className="flex justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(s => s - 1)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
            >
              ← Previous
            </button>
            {currentStep < STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(s => s + 1)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              >
                Next →
              </button>
            )}
          </div>
        )}

        {/* Completion banner */}
        {currentStep === 6 && (prep.lastSavedStep ?? 0) >= 6 && (
          <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-6 text-center">
            <p className="text-3xl mb-2">⛵</p>
            <h3 className="text-white text-lg font-bold mb-1">All Set!</h3>
            <p className="text-emerald-200 text-sm">Your preparation is complete. The BlueOne team has everything they need to plan your perfect holiday.</p>
            <a
              href={`/client-space/${token}/summary`}
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold bg-white text-blue-800 hover:bg-blue-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View & Print Summary
            </a>
            <p className="text-emerald-300 text-xs mt-3">Questions? Contact us at <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a></p>
          </div>
        )}

        <div className="text-center pb-8">
          <p className="text-blue-400 text-xs">Your progress is saved automatically after each section.</p>
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* History drawer */}
      {historyOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setHistoryOpen(false)}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-[#002a5a] border-l border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <h2 className="text-white font-bold text-base">Edit History</h2>
                <p className="text-blue-300 text-xs mt-0.5">Restore any previous version</p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingHistory && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full" />
                </div>
              )}
              {!loadingHistory && history.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-blue-300 text-sm">No history yet.</p>
                  <p className="text-blue-400 text-xs mt-1">Snapshots are saved each time you click &ldquo;Save&rdquo;.</p>
                </div>
              )}
              {!loadingHistory && history.map(snap => (
                <div key={snap.id} className="bg-white/8 border border-white/10 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{snap.label}</p>
                      <p className="text-blue-400 text-[10px] mt-0.5">{fmtDateTime(snap.savedAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestore(snap)}
                      disabled={restoring === snap.id}
                      className="flex-shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 border border-blue-400/30 transition-colors disabled:opacity-50"
                    >
                      {restoring === snap.id ? 'Restoring…' : 'Restore'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
