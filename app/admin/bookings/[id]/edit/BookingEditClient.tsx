'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteField } from 'firebase/firestore';
import {
  getCharterById,
  updateCharter,
  proposalRef,
  CHARTER_STATUS_LABEL,
  type Charter,
  type CharterStatus,
} from '../../../../../lib/availability';
import { marinasByRegion, getMarinaById } from '../../../../marinas-data';
import adventures from '../../../../adventures-data';

interface Props {
  id: string;
}

/** Every editable request/booking field, held as strings for the form inputs. */
export interface BookingForm {
  status: CharterStatus;
  startDate: string;
  endDate: string;
  name: string;
  email: string;
  phone: string;
  passengers: string;
  boat: string;
  embarkationPoint: string;
  disembarkationPort: string;
  deliveryPoint: string;
  redeliveryPoint: string;
  selectedTheme: string;
  holidayDescription: string;
  note: string;
  externalRef: string;
  contractValue: string;
  brokerCommission: string;
  apaAmount: string;
  relocationAmount: string;
}

const TEXT_FIELDS = [
  'name', 'email', 'phone', 'boat', 'embarkationPoint', 'disembarkationPort',
  'deliveryPoint', 'redeliveryPoint', 'selectedTheme', 'holidayDescription', 'note', 'externalRef',
] as const;

const NUMBER_FIELDS = [
  'passengers', 'contractValue', 'brokerCommission', 'apaAmount', 'relocationAmount',
] as const;

export function charterToForm(c: Charter): BookingForm {
  const num = (n?: number) => (n != null ? String(n) : '');
  return {
    status: c.status,
    startDate: c.startDate ?? '',
    endDate: c.endDate ?? '',
    name: c.name ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    passengers: num(c.passengers),
    boat: c.boat ?? '',
    embarkationPoint: c.embarkationPoint ?? '',
    disembarkationPort: c.disembarkationPort ?? '',
    deliveryPoint: c.deliveryPoint ?? '',
    redeliveryPoint: c.redeliveryPoint ?? '',
    selectedTheme: c.selectedTheme ?? '',
    holidayDescription: c.holidayDescription ?? '',
    note: c.note ?? '',
    externalRef: c.externalRef ?? '',
    contractValue: num(c.contractValue),
    brokerCommission: num(c.brokerCommission),
    apaAmount: num(c.apaAmount),
    relocationAmount: num(c.relocationAmount),
  };
}

/** Returns an error message per invalid field (empty object when valid). */
export function validateForm(f: BookingForm): Partial<Record<keyof BookingForm, string>> {
  const errors: Partial<Record<keyof BookingForm, string>> = {};
  if (!f.startDate) errors.startDate = 'Start date is required.';
  if (!f.endDate) errors.endDate = 'End date is required.';
  if (f.startDate && f.endDate && f.endDate < f.startDate) {
    errors.endDate = 'End date must be on or after the start date.';
  }
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  for (const k of NUMBER_FIELDS) {
    const v = f[k].trim();
    if (v && (isNaN(Number(v)) || Number(v) < 0)) errors[k] = 'Enter a positive number.';
  }
  if (f.passengers.trim() && !Number.isInteger(Number(f.passengers))) {
    errors.passengers = 'Enter a whole number.';
  }
  if (f.brokerCommission.trim() && Number(f.brokerCommission) > 100) {
    errors.brokerCommission = 'Commission is a percentage (0–100).';
  }
  return errors;
}

/**
 * Builds the Firestore update from the form. Only fields that changed are
 * written; emptied fields are removed from the document with deleteField().
 */
export function formToUpdate(form: BookingForm, original: BookingForm): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  if (form.status !== original.status) update.status = form.status;
  if (form.startDate !== original.startDate) update.startDate = form.startDate;
  if (form.endDate !== original.endDate) update.endDate = form.endDate;
  for (const k of TEXT_FIELDS) {
    const v = form[k].trim();
    if (v === original[k].trim()) continue;
    update[k] = v ? v : deleteField();
  }
  for (const k of NUMBER_FIELDS) {
    const v = form[k].trim();
    if (v === original[k].trim()) continue;
    update[k] = v ? Number(v) : deleteField();
  }
  return update;
}

const inputCls =
  'w-full bg-white/10 border border-white/25 text-white placeholder-blue-400/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400';
const selectCls =
  'w-full bg-slate-800 border border-white/25 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400';

function Field({
  label, htmlFor, hint, error, children, wide,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <label htmlFor={htmlFor} className="text-blue-200 text-xs font-medium block mb-1">{label}</label>
      {children}
      {error ? (
        <p className="text-red-300 text-xs mt-1">{error}</p>
      ) : hint ? (
        <p className="text-blue-400 text-xs mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white/10 border border-white/20 rounded-xl p-5">
      <h2 className="text-white font-semibold text-base">{title}</h2>
      {description && <p className="text-blue-300 text-xs mt-0.5">{description}</p>}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">{children}</div>
    </section>
  );
}

function MarinaSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const grouped = marinasByRegion();
  const unknown = value && !getMarinaById(value);
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
      <option value="">— Not set —</option>
      {unknown && <option value={value}>{value}</option>}
      {Object.entries(grouped).map(([region, list]) => (
        <optgroup key={region} label={region}>
          {list.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

export default function BookingEditClient({ id }: Props) {
  const router = useRouter();
  const [original, setOriginal] = useState<BookingForm | null>(null);
  const [form, setForm] = useState<BookingForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    getCharterById(id)
      .then(c => {
        if (!c) { setNotFound(true); return; }
        const f = charterToForm(c);
        setOriginal(f);
        setForm(f);
      })
      .catch(err => { console.error(err); setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  const errors = useMemo(() => (form ? validateForm(form) : {}), [form]);
  const pendingUpdate = useMemo(
    () => (form && original ? formToUpdate(form, original) : {}),
    [form, original],
  );
  const dirty = Object.keys(pendingUpdate).length > 0;

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  function set<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev));
    setSavedAt(null);
  }

  function goBack() {
    if (dirty && !confirm('Discard unsaved changes?')) return;
    router.push(`/admin/bookings/${id}`);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setShowErrors(true);
    if (Object.keys(errors).length > 0) return;
    if (!dirty) return;
    setSaving(true);
    setSaveError('');
    try {
      await updateCharter(id, pendingUpdate as Parameters<typeof updateCharter>[1]);
      const normalized = { ...form };
      for (const k of [...TEXT_FIELDS, ...NUMBER_FIELDS]) normalized[k] = normalized[k].trim();
      setOriginal(normalized);
      setForm(normalized);
      setSavedAt(new Date());
      setShowErrors(false);
    } catch (err) {
      console.error(err);
      setSaveError('Saving failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-blue-200 text-sm animate-pulse">Loading booking…</p>
      </div>
    );
  }

  if (notFound || !form || !original) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <button onClick={() => router.push('/admin')} className="text-blue-400 hover:text-white text-sm transition-colors">
          ← Dashboard
        </button>
        <p className="text-red-300 text-sm">Booking not found.</p>
      </div>
    );
  }

  const err = (k: keyof BookingForm) => (showErrors ? errors[k] : undefined);
  const themeKnown = !form.selectedTheme || adventures.some(a => a.name === form.selectedTheme);

  return (
    <form onSubmit={handleSave} className="p-6 max-w-4xl mx-auto space-y-6 pb-28" noValidate>
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" onClick={goBack} className="text-blue-400 hover:text-white text-sm transition-colors">
            ← Booking details
          </button>
          <span className="text-blue-500 text-sm font-mono">{proposalRef(id)}</span>
        </div>
        <h1 className="text-white font-bold text-2xl mt-2">Edit request &amp; booking</h1>
        <p className="text-blue-300 text-sm mt-1">
          All fields of this request/booking. Leave a field empty to clear it.
        </p>
      </div>

      <Section title="Status & dates">
        <Field label="Status" htmlFor="f-status">
          <select
            id="f-status"
            value={form.status}
            onChange={e => set('status', e.target.value as CharterStatus)}
            className={selectCls}
          >
            {(Object.keys(CHARTER_STATUS_LABEL) as CharterStatus[]).map(s => (
              <option key={s} value={s}>{CHARTER_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="External reference" htmlFor="f-externalRef" hint="Broker platform URL or ID">
          <input id="f-externalRef" value={form.externalRef} onChange={e => set('externalRef', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Start date *" htmlFor="f-startDate" error={err('startDate')}>
          <input id="f-startDate" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
        </Field>
        <Field label="End date *" htmlFor="f-endDate" error={err('endDate')}>
          <input id="f-endDate" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <Section title="Client">
        <Field label="Name" htmlFor="f-name">
          <input id="f-name" value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Email" htmlFor="f-email" error={err('email')}>
          <input id="f-email" type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Phone" htmlFor="f-phone">
          <input id="f-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Passengers" htmlFor="f-passengers" error={err('passengers')}>
          <input id="f-passengers" type="number" min={0} step={1} value={form.passengers} onChange={e => set('passengers', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <Section title="Boat & locations" description="Delivery / redelivery marinas drive the maps, manifest and relocation fees.">
        <Field label="Boat" htmlFor="f-boat">
          <input id="f-boat" value={form.boat} onChange={e => set('boat', e.target.value)} className={inputCls} />
        </Field>
        <div className="hidden sm:block" />
        <Field label="Embarkation point" htmlFor="f-embarkationPoint" hint="Free text from the web request">
          <input id="f-embarkationPoint" value={form.embarkationPoint} onChange={e => set('embarkationPoint', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Disembarkation port" htmlFor="f-disembarkationPort" hint="Free text">
          <input id="f-disembarkationPort" value={form.disembarkationPort} onChange={e => set('disembarkationPort', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Delivery marina" htmlFor="f-deliveryPoint">
          <MarinaSelect id="f-deliveryPoint" value={form.deliveryPoint} onChange={v => set('deliveryPoint', v)} />
        </Field>
        <Field label="Redelivery marina" htmlFor="f-redeliveryPoint">
          <MarinaSelect id="f-redeliveryPoint" value={form.redeliveryPoint} onChange={v => set('redeliveryPoint', v)} />
        </Field>
      </Section>

      <Section title="Request content">
        <Field label="Selected theme" htmlFor="f-selectedTheme" wide>
          <select id="f-selectedTheme" value={form.selectedTheme} onChange={e => set('selectedTheme', e.target.value)} className={selectCls}>
            <option value="">— No theme —</option>
            {!themeKnown && <option value={form.selectedTheme}>{form.selectedTheme}</option>}
            {adventures.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Holiday description" htmlFor="f-holidayDescription" hint="The client's wishes" wide>
          <textarea id="f-holidayDescription" rows={4} value={form.holidayDescription} onChange={e => set('holidayDescription', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Internal note" htmlFor="f-note" hint="Short note shown on calendars and summaries" wide>
          <textarea id="f-note" rows={2} value={form.note} onChange={e => set('note', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      <Section title="Financials" description="Optional overrides. Leave empty to use the computed season rates and defaults.">
        <Field label="Contract value (€)" htmlFor="f-contractValue" error={err('contractValue')}>
          <input id="f-contractValue" type="number" min={0} value={form.contractValue} onChange={e => set('contractValue', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Broker commission (%)" htmlFor="f-brokerCommission" error={err('brokerCommission')}>
          <input id="f-brokerCommission" type="number" min={0} max={100} step="0.1" value={form.brokerCommission} onChange={e => set('brokerCommission', e.target.value)} className={inputCls} />
        </Field>
        <Field label="APA amount (€)" htmlFor="f-apaAmount" error={err('apaAmount')}>
          <input id="f-apaAmount" type="number" min={0} value={form.apaAmount} onChange={e => set('apaAmount', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Relocation amount (€)" htmlFor="f-relocationAmount" error={err('relocationAmount')}>
          <input id="f-relocationAmount" type="number" min={0} value={form.relocationAmount} onChange={e => set('relocationAmount', e.target.value)} className={inputCls} />
        </Field>
      </Section>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 border-t border-white/15 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
          <p className="text-xs flex-1 min-w-0" role="status">
            {saveError ? (
              <span className="text-red-300">{saveError}</span>
            ) : showErrors && Object.keys(errors).length > 0 ? (
              <span className="text-red-300">Please fix the highlighted fields.</span>
            ) : dirty ? (
              <span className="text-amber-200">Unsaved changes ({Object.keys(pendingUpdate).length} field{Object.keys(pendingUpdate).length > 1 ? 's' : ''})</span>
            ) : savedAt ? (
              <span className="text-teal-300">✓ Saved at {savedAt.toLocaleTimeString()}</span>
            ) : (
              <span className="text-blue-400">No changes</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => { setForm(original); setShowErrors(false); setSaveError(''); }}
            disabled={!dirty || saving}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-blue-200 transition-colors disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={goBack}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-blue-200 transition-colors"
          >
            {dirty ? 'Cancel' : 'Back to booking'}
          </button>
          <button
            type="submit"
            disabled={!dirty || saving}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
