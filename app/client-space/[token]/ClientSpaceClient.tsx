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
  type ActivityPreferences,
  type FoodPreferences,
  type BeveragePreferences,
  type SpecialRequests,
  type PrepSnapshot,
} from '../../../lib/clientSpace';
import type { Charter } from '../../../lib/availability';
import { getMarinaById } from '../../marinas-data';
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
  'Tonic Water 1.5 l', 'Water Still 0.5 l', 'Water Sparkling 0.5 l',
];

const WINE_TYPES = ['White Wine', 'Red Wine', 'Rosé Wine', 'Champagne / Sparkling'];

const SPIRIT_TYPES = [
  'Vodka', 'Gin', 'Rum', 'Whisky / Scotch', 'Tequila',
  'Beer (local)', 'Beer (imported)', 'Liqueurs',
];

const FOOD_CATEGORIES = ['Seafood', 'Meat', 'Fruit', 'Vegetables', 'Dairy', 'Other'] as const;

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

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-semibold text-blue-800 mb-1">{children}</label>;
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
      className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 bg-white/90"
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
      className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 bg-white/90 resize-none"
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
      className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-900 focus:outline-none focus:border-blue-400 bg-white/90"
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
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            value === o.id
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
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
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
            values.includes(o)
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-blue-200 text-blue-600 hover:border-blue-400'
          }`}
        >
          {o}
        </button>
      ))}
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
    <div className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-blue-900">{title}</h3>
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

function CrewStep({ count, initial, onSave, onAutoSave }: {
  count: number;
  initial: CrewMember[];
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
            className="w-full flex items-center justify-between px-4 py-3 text-left"
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
            <div className="px-4 pb-4 space-y-3 border-t border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
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

function TravelStep({ initial, onSave, onAutoSave }: {
  initial: TravelLogistics;
  onSave: (travel: TravelLogistics) => Promise<void>;
  onAutoSave: (travel: TravelLogistics) => Promise<void>;
}) {
  const [data, setData] = useState<TravelLogistics>(initial);
  const [saving, setSaving] = useState(false);
  const autoStatus = useAutoSave(data, onAutoSave);
  function set<K extends keyof TravelLogistics>(k: K, v: TravelLogistics[K]) {
    setData(prev => ({ ...prev, [k]: v }));
  }
  async function handleSave() { setSaving(true); try { await onSave(data); } finally { setSaving(false); } }

  return (
    <div className="space-y-3">
      <SectionCard title="Arrival" autoSave={autoStatus}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FieldLabel>Arrival Date</FieldLabel>
            <TextInput value={data.arrivalDate ?? ''} onChange={v => set('arrivalDate', v)} type="date" />
          </div>
          <div>
            <FieldLabel>Arrival Time</FieldLabel>
            <TextInput value={data.arrivalTime ?? ''} onChange={v => set('arrivalTime', v)} type="time" />
          </div>
          <div>
            <FieldLabel>Flight Number</FieldLabel>
            <TextInput value={data.arrivalFlight ?? ''} onChange={v => set('arrivalFlight', v)} placeholder="e.g. EasyJet EZY1234" />
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel>Staying at a hotel before boarding?</FieldLabel>
          <PillToggle
            options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]}
            value={data.stayingAtHotel ? 'yes' : data.stayingAtHotel === false ? 'no' : ''}
            onChange={v => set('stayingAtHotel', v === 'yes')}
          />
          {data.stayingAtHotel && (
            <div className="mt-2">
              <FieldLabel>Hotel Name & Contact</FieldLabel>
              <TextInput value={data.hotelName ?? ''} onChange={v => set('hotelName', v)} placeholder="Hotel name and phone/address" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <FieldLabel>Airport transfer to marina needed?</FieldLabel>
          <PillToggle
            options={[{ id: 'yes', label: 'Yes — arrange please' }, { id: 'no', label: 'No — I\'ll arrange my own' }]}
            value={data.transferFromAirport ? 'yes' : data.transferFromAirport === false ? 'no' : ''}
            onChange={v => set('transferFromAirport', v === 'yes')}
          />
        </div>
      </SectionCard>

      <SectionCard title="Departure">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FieldLabel>Departure Date</FieldLabel>
            <TextInput value={data.departureDate ?? ''} onChange={v => set('departureDate', v)} type="date" />
          </div>
          <div>
            <FieldLabel>Departure Time</FieldLabel>
            <TextInput value={data.departureTime ?? ''} onChange={v => set('departureTime', v)} type="time" />
          </div>
          <div>
            <FieldLabel>Flight Number</FieldLabel>
            <TextInput value={data.departureFlight ?? ''} onChange={v => set('departureFlight', v)} placeholder="e.g. BA456" />
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel>Airport transfer from marina needed?</FieldLabel>
          <PillToggle
            options={[{ id: 'yes', label: 'Yes — arrange please' }, { id: 'no', label: 'No — I\'ll arrange my own' }]}
            value={data.transferToAirport ? 'yes' : data.transferToAirport === false ? 'no' : ''}
            onChange={v => set('transferToAirport', v === 'yes')}
          />
        </div>
      </SectionCard>

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

function FoodStep({ initial, onSave, onAutoSave }: {
  initial: FoodPreferences;
  onSave: (food: FoodPreferences) => Promise<void>;
  onAutoSave: (food: FoodPreferences) => Promise<void>;
}) {
  const [data, setData] = useState<FoodPreferences>(initial);
  const [saving, setSaving] = useState(false);
  const autoStatus = useAutoSave(data, onAutoSave);

  function setCategory(cat: string, field: 'likes' | 'dislikes' | 'allergies', val: string) {
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
              <div key={cat} className="border border-blue-100 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-blue-800">{cat}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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

function BeverageRow({ label, item, onChange }: {
  label: string;
  item: { preferredBrand?: string; qty?: number; remarks?: string };
  onChange: (v: { preferredBrand?: string; qty?: number; remarks?: string }) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-[2fr_1fr_2fr] gap-2 items-center py-2 border-b border-blue-50 last:border-0">
      <span className="text-xs font-medium text-blue-800">{label}</span>
      <input
        type="number"
        min={0}
        placeholder="Qty"
        value={item.qty ?? ''}
        onChange={e => onChange({ ...item, qty: e.target.value ? Number(e.target.value) : undefined })}
        className="border border-blue-100 rounded-lg px-2 py-1.5 text-xs text-blue-900 focus:outline-none focus:border-blue-400 bg-white/80 w-full"
      />
      <input
        type="text"
        placeholder="Brand / remarks"
        value={item.preferredBrand ?? ''}
        onChange={e => onChange({ ...item, preferredBrand: e.target.value })}
        className="border border-blue-100 rounded-lg px-2 py-1.5 text-xs text-blue-900 focus:outline-none focus:border-blue-400 bg-white/80 w-full"
      />
    </div>
  );
}

function BeveragesStep({ initial, onSave, onAutoSave }: {
  initial: BeveragePreferences;
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
        <div className="flex gap-2 overflow-x-auto pb-1">
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
          <CrewStep count={passengerCount} initial={prep.crew} onSave={handleSaveCrew} onAutoSave={autoSaveCrew} />
        )}

        {currentStep === 2 && (
          <TravelStep initial={prep.travel} onSave={handleSaveTravel} onAutoSave={autoSaveTravel} />
        )}

        {currentStep === 3 && (
          <ActivitiesStep initial={prep.activities} onSave={handleSaveActivities} onAutoSave={autoSaveActivities} />
        )}

        {currentStep === 4 && (
          <FoodStep initial={prep.food} onSave={handleSaveFood} onAutoSave={autoSaveFood} />
        )}

        {currentStep === 5 && (
          <BeveragesStep initial={prep.beverages} onSave={handleSaveBeverages} onAutoSave={autoSaveBeverages} />
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
