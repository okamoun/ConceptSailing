'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  getProposalById,
  createProposal,
  updateProposal,
  markProposalSent,
  addProposalComment,
  proposalRef,
  calcTotals,
  DEFAULT_PAYMENT_TERMS,
  type Proposal,
  type ProposalPricing,
  type PaymentTerm,
  type PricingExtra,
  type ProposalStatus,
} from '../../../../lib/proposals';
import { getCharterById, type Charter } from '../../../../lib/availability';
import { getMarinaById } from '../../../marinas-data';

const DEFAULT_PRICING: ProposalPricing = {
  basePrice: 0,
  currency: 'EUR',
  apaPercentage: 30,
  securityDeposit: 2000,
  discountAmount: 0,
  extras: [],
};

function defaultExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const STATUS_BADGE: Record<ProposalStatus, string> = {
  draft:     'bg-gray-500/30 text-gray-200',
  sent:      'bg-sky-500/30 text-sky-200',
  viewed:    'bg-indigo-500/30 text-indigo-200',
  commented: 'bg-amber-500/30 text-amber-200',
  approved:  'bg-emerald-500/30 text-emerald-200',
  rejected:  'bg-red-500/30 text-red-200',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6">
      <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-5">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label, children, hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-blue-200 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-blue-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full bg-white/10 border border-white/20 text-white placeholder-blue-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent';

interface Props { id: string; prefillCharterId?: string }

export default function ProposalEditorClient({ id, prefillCharterId }: Props) {
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [proposalId, setProposalId] = useState<string | null>(isNew ? null : id);
  const [proposalToken, setProposalToken] = useState<string | null>(null);
  const [status, setStatus] = useState<ProposalStatus>('draft');
  const [linkCopied, setLinkCopied] = useState(false);

  // Admin comment reply
  const [adminReply, setAdminReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [existingComments, setExistingComments] = useState<Proposal['comments']>([]);

  // Linked charter
  const [linkedCharter, setLinkedCharter] = useState<Charter | null>(null);
  const [linkedCharterId, setLinkedCharterId] = useState<string | undefined>(undefined);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [boatName, setBoatName] = useState('BlueOne — Fountaine Pajot Aura 51');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [embarkationPort, setEmbarkationPort] = useState('');
  const [disembarkationPort, setDisembarkationPort] = useState('');
  const [passengers, setPassengers] = useState(2);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [itinerarySummary, setItinerarySummary] = useState('');
  const [pricing, setPricing] = useState<ProposalPricing>(DEFAULT_PRICING);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>(DEFAULT_PAYMENT_TERMS);
  const [specialConditions, setSpecialConditions] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAt());

  const totals = useMemo(() => calcTotals(pricing), [pricing]);

  const proposalUrl = proposalToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/proposal/${proposalToken}`
    : null;

  const populate = useCallback((p: Proposal) => {
    setClientName(p.clientName);
    setClientEmail(p.clientEmail);
    setClientPhone(p.clientPhone || '');
    setBoatName(p.boatName);
    setStartDate(p.startDate);
    setEndDate(p.endDate);
    setEmbarkationPort(p.embarkationPort);
    setDisembarkationPort(p.disembarkationPort);
    setPassengers(p.passengers);
    setSelectedTheme(p.selectedTheme || '');
    setItinerarySummary(p.itinerarySummary || '');
    setPricing(p.pricing);
    setPaymentTerms(p.paymentTerms || DEFAULT_PAYMENT_TERMS);
    setSpecialConditions(p.specialConditions || '');
    setAdminNotes(p.adminNotes || '');
    setExpiresAt(p.expiresAt);
    setProposalToken(p.token);
    setStatus(p.status);
    setExistingComments(p.comments || []);
    if (p.charterId) setLinkedCharterId(p.charterId);
  }, []);

  // Load existing proposal
  useEffect(() => {
    if (isNew) return;
    getProposalById(id)
      .then(p => { if (p) populate(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isNew, populate]);

  // Pre-fill form from charter when creating a new proposal via ?charterId=
  useEffect(() => {
    if (!isNew || !prefillCharterId) return;
    setLinkedCharterId(prefillCharterId);
    getCharterById(prefillCharterId).then(charter => {
      if (!charter) return;
      setLinkedCharter(charter);
      if (charter.name) setClientName(charter.name);
      if (charter.email) setClientEmail(charter.email);
      if (charter.phone) setClientPhone(charter.phone);
      if (charter.boat) setBoatName(charter.boat);
      if (charter.startDate) setStartDate(charter.startDate);
      if (charter.endDate) setEndDate(charter.endDate);
      if (charter.passengers) setPassengers(charter.passengers);
      if (charter.selectedTheme) setSelectedTheme(charter.selectedTheme);
      if (charter.holidayDescription) setItinerarySummary(charter.holidayDescription);
      const embark = charter.deliveryPoint
        ? (getMarinaById(charter.deliveryPoint)?.name ?? charter.embarkationPoint ?? '')
        : (charter.embarkationPoint ?? '');
      const disembark = charter.redeliveryPoint
        ? (getMarinaById(charter.redeliveryPoint)?.name ?? embark)
        : embark;
      setEmbarkationPort(embark);
      setDisembarkationPort(disembark);
    }).catch(console.error);
  }, [isNew, prefillCharterId]);

  // Load linked charter for display when editing an existing proposal
  useEffect(() => {
    if (isNew || !linkedCharterId) return;
    getCharterById(linkedCharterId)
      .then(c => { if (c) setLinkedCharter(c); })
      .catch(console.error);
  }, [isNew, linkedCharterId]);

  function buildData() {
    return {
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim() || undefined,
      charterId: linkedCharterId,
      boatName: boatName.trim(),
      startDate,
      endDate,
      embarkationPort: embarkationPort.trim(),
      disembarkationPort: disembarkationPort.trim(),
      passengers,
      selectedTheme: selectedTheme.trim() || undefined,
      itinerarySummary: itinerarySummary.trim() || undefined,
      pricing,
      paymentTerms,
      specialConditions: specialConditions.trim() || undefined,
      adminNotes: adminNotes.trim() || undefined,
      expiresAt,
      status,
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName || !clientEmail || !startDate || !endDate) {
      setError('Please fill in client name, email, and charter dates.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = buildData();
      if (isNew || !proposalId) {
        const newId = await createProposal(data as Parameters<typeof createProposal>[0]);
        setProposalId(newId);
        // Fetch the token from the new doc
        const { getProposalById: fetchNew } = await import('../../../../lib/proposals');
        const fresh = await fetchNew(newId);
        if (fresh) { setProposalToken(fresh.token); setStatus(fresh.status); }
        router.replace(`/admin/proposals/${newId}`);
      } else {
        await updateProposal(proposalId, data);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!proposalId) { setError('Save the proposal first.'); return; }
    setSending(true);
    setError('');
    try {
      // Save current form data first, then mark as sent
      const data = buildData();
      await updateProposal(proposalId, data);
      await markProposalSent(proposalId);
      setStatus('sent');
    } catch (err) {
      setError('Failed to send. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function handleAdminReply(e: React.FormEvent) {
    e.preventDefault();
    if (!proposalId || !adminReply.trim()) return;
    setSendingReply(true);
    try {
      await addProposalComment(
        proposalId,
        { author: 'BlueOne Team', text: adminReply.trim(), isAdmin: true },
        status
      );
      setExistingComments(prev => [
        ...prev,
        { id: Date.now().toString(), author: 'BlueOne Team', text: adminReply.trim(), createdAt: new Date().toISOString(), isAdmin: true },
      ]);
      setAdminReply('');
    } finally {
      setSendingReply(false);
    }
  }

  function copyLink() {
    if (!proposalUrl) return;
    navigator.clipboard.writeText(proposalUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  }

  function updateExtra(i: number, field: keyof PricingExtra, value: string | number) {
    const extras = [...pricing.extras];
    extras[i] = { ...extras[i], [field]: field === 'amount' ? Number(value) : value };
    setPricing(p => ({ ...p, extras }));
  }

  function addExtra() {
    setPricing(p => ({ ...p, extras: [...p.extras, { label: '', amount: 0 }] }));
  }

  function removeExtra(i: number) {
    setPricing(p => ({ ...p, extras: p.extras.filter((_, idx) => idx !== i) }));
  }

  function updateTerm(i: number, field: keyof PaymentTerm, value: string | number) {
    const terms = [...paymentTerms];
    terms[i] = { ...terms[i], [field]: field === 'percentage' ? Number(value) : value };
    setPaymentTerms(terms);
  }

  function addTerm() {
    setPaymentTerms(prev => [...prev, { label: '', percentage: 0, description: '' }]);
  }

  function removeTerm(i: number) {
    setPaymentTerms(prev => prev.filter((_, idx) => idx !== i));
  }

  if (loading) {
    return <div className="p-8 text-blue-300 text-sm">Loading…</div>;
  }

  // Guard: new proposals must be created from a booking
  if (isNew && !prefillCharterId) {
    return (
      <div className="p-6 max-w-2xl mx-auto pt-16 text-center">
        <div className="text-5xl mb-5">📋</div>
        <h1 className="text-white text-2xl font-bold mb-3">Start from a Booking</h1>
        <p className="text-blue-300 text-sm leading-relaxed mb-8">
          Proposals must be linked to an existing booking. Open a charter from the
          Dashboard and click <strong className="text-white">+ Create Proposal</strong> to get started.
        </p>
        <a
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          ← Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/proposals')} className="text-blue-400 hover:text-white text-sm transition-colors">
              ← Proposals
            </button>
            {!isNew && proposalId && (
              <span className="text-blue-500 text-sm font-mono">{proposalRef(proposalId)}</span>
            )}
            {!isNew && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}>
                {status}
              </span>
            )}
          </div>
          <h1 className="text-white text-2xl font-bold mt-2">
            {isNew ? 'New Proposal' : 'Edit Proposal'}
          </h1>
        </div>
      </div>

      {/* Linked booking banner */}
      {linkedCharter && (
        <div className="bg-white/10 border border-white/15 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
                Linked Booking
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-blue-200">
                {linkedCharter.name && <span className="font-medium text-white">{linkedCharter.name}</span>}
                {linkedCharter.email && <span>{linkedCharter.email}</span>}
                {linkedCharter.phone && <span>{linkedCharter.phone}</span>}
                <span>📅 {linkedCharter.startDate} → {linkedCharter.endDate}</span>
                {linkedCharter.passengers != null && <span>👥 {linkedCharter.passengers} pax</span>}
                {linkedCharter.selectedTheme && <span>🏝 {linkedCharter.selectedTheme}</span>}
              </div>
            </div>
            <a
              href="/admin"
              className="flex-shrink-0 text-xs text-blue-400 hover:text-blue-200 underline whitespace-nowrap"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      )}

      {/* Shareable link — shown once proposal exists */}
      {proposalToken && (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-6">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">Client Link</div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <code className="flex-1 text-xs text-blue-200 bg-black/20 rounded-lg px-3 py-2 break-all font-mono">
              {proposalUrl}
            </code>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-white rounded-xl text-xs font-medium transition-colors"
              >
                {linkCopied ? '✓ Copied' : 'Copy Link'}
              </button>
              <a
                href={`/proposal/${proposalToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-blue-200 rounded-xl text-xs font-medium transition-colors"
              >
                Preview
              </a>
            </div>
          </div>
          {status === 'draft' && (
            <p className="text-xs text-amber-300 mt-3">
              ⚠ This proposal is still a draft. Click <strong>Send to Client</strong> below to activate the link.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Client Information */}
        <Section title="Client Information">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Full Name *">
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                placeholder="Jean-Pierre Dupont" className={inputCls} required />
            </Field>
            <Field label="Email Address *">
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                placeholder="client@example.com" className={inputCls} required />
            </Field>
            <Field label="Phone">
              <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78" className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Charter Details */}
        <Section title="Charter Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Vessel Name">
              <input type="text" value={boatName} onChange={e => setBoatName(e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Number of Guests">
              <input type="number" value={passengers} onChange={e => setPassengers(Number(e.target.value))}
                min={1} max={12} className={inputCls} />
            </Field>
            <Field label="Charter Start Date *">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className={inputCls} required />
            </Field>
            <Field label="Charter End Date *">
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className={inputCls} required />
            </Field>
            <Field label="Embarkation Port">
              <input type="text" value={embarkationPort} onChange={e => setEmbarkationPort(e.target.value)}
                placeholder="Athens — Alimos Marina" className={inputCls} />
            </Field>
            <Field label="Disembarkation Port">
              <input type="text" value={disembarkationPort} onChange={e => setDisembarkationPort(e.target.value)}
                placeholder="Athens — Alimos Marina" className={inputCls} />
            </Field>
            <Field label="Experience Theme">
              <input type="text" value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}
                placeholder="Cyclades Discovery, Family Adventure…" className={inputCls} />
            </Field>
            <Field label="Proposal Expiry Date" hint="Client link becomes invalid after this date">
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                className={inputCls} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Itinerary Overview" hint="Shown to client — describe the route and highlights">
              <textarea value={itinerarySummary} onChange={e => setItinerarySummary(e.target.value)}
                rows={5} placeholder="Day 1: Depart Athens (Alimos Marina)…" className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Field label="Base Charter Fee (€)">
              <input type="number" value={pricing.basePrice} onChange={e => setPricing(p => ({ ...p, basePrice: Number(e.target.value) }))}
                min={0} step={100} className={inputCls} />
            </Field>
            <Field label="APA Percentage (%)" hint="Typically 25–35%">
              <input type="number" value={pricing.apaPercentage} onChange={e => setPricing(p => ({ ...p, apaPercentage: Number(e.target.value) }))}
                min={0} max={100} className={inputCls} />
            </Field>
            <Field label="Security Deposit (€)" hint="Refundable">
              <input type="number" value={pricing.securityDeposit} onChange={e => setPricing(p => ({ ...p, securityDeposit: Number(e.target.value) }))}
                min={0} step={100} className={inputCls} />
            </Field>
            <Field label="Discount (€)">
              <input type="number" value={pricing.discountAmount} onChange={e => setPricing(p => ({ ...p, discountAmount: Number(e.target.value) }))}
                min={0} step={100} className={inputCls} />
            </Field>
          </div>

          {/* Extras */}
          <div className="mb-4">
            <div className="text-xs font-medium text-blue-200 mb-2">Additional Services / Extras</div>
            <div className="space-y-2">
              {pricing.extras.map((extra, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={extra.label} onChange={e => updateExtra(i, 'label', e.target.value)}
                    placeholder="Service description" className={`${inputCls} flex-1`} />
                  <input type="number" value={extra.amount} onChange={e => updateExtra(i, 'amount', e.target.value)}
                    placeholder="0" min={0} className={`${inputCls} w-28`} />
                  <button type="button" onClick={() => removeExtra(i)}
                    className="text-red-400 hover:text-red-300 text-sm px-2">✕</button>
                </div>
              ))}
              <button type="button" onClick={addExtra}
                className="text-xs text-blue-400 hover:text-blue-200 underline">
                + Add extra
              </button>
            </div>
          </div>

          {/* Computed totals */}
          <div className="bg-black/20 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">Totals Preview</div>
            {[
              { label: 'Base Charter Fee', value: totals.base },
              totals.discount > 0 && { label: 'Discount', value: -totals.discount },
              totals.extrasSum > 0 && { label: 'Extras', value: totals.extrasSum },
            ].filter(Boolean).map((row, i) => row && (
              <div key={i} className="flex justify-between text-sm text-blue-200">
                <span>{row.label}</span>
                <span className={row.value < 0 ? 'text-emerald-400' : ''}>
                  {row.value < 0 ? '−' : ''}{fmt(Math.abs(row.value))}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold text-white border-t border-white/10 pt-2">
              <span>Charter Fee</span><span>{fmt(totals.charterFee)}</span>
            </div>
            {totals.apa > 0 && (
              <div className="flex justify-between text-sm text-blue-200">
                <span>APA ({pricing.apaPercentage}%)</span><span>{fmt(totals.apa)}</span>
              </div>
            )}
            {pricing.securityDeposit > 0 && (
              <div className="flex justify-between text-sm text-blue-200">
                <span>Security Deposit</span><span>{fmt(pricing.securityDeposit)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-white border-t border-white/20 pt-2">
              <span>Grand Total</span><span>{fmt(totals.grandTotal)}</span>
            </div>
          </div>
        </Section>

        {/* Payment Terms */}
        <Section title="Payment Schedule (MYBA)">
          <div className="space-y-4 mb-4">
            {paymentTerms.map((term, i) => (
              <div key={i} className="bg-black/10 rounded-xl p-4">
                <div className="flex gap-2 mb-2">
                  <input type="text" value={term.label} onChange={e => updateTerm(i, 'label', e.target.value)}
                    placeholder="e.g. Deposit — 50%" className={`${inputCls} flex-1`} />
                  <div className="flex items-center gap-1">
                    <input type="number" value={term.percentage} onChange={e => updateTerm(i, 'percentage', e.target.value)}
                      min={0} max={100} placeholder="50" className={`${inputCls} w-20`} />
                    <span className="text-blue-300 text-sm">%</span>
                  </div>
                  <button type="button" onClick={() => removeTerm(i)}
                    className="text-red-400 hover:text-red-300 text-sm px-2">✕</button>
                </div>
                <input type="text" value={term.description} onChange={e => updateTerm(i, 'description', e.target.value)}
                  placeholder="Payment condition description…" className={`${inputCls} text-xs`} />
                {totals.charterFee > 0 && (
                  <div className="text-xs text-blue-400 mt-2">
                    = {fmt(Math.round(totals.charterFee * term.percentage / 100))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={addTerm}
              className="text-xs text-blue-400 hover:text-blue-200 underline">
              + Add payment term
            </button>
            <button type="button" onClick={() => setPaymentTerms(DEFAULT_PAYMENT_TERMS)}
              className="text-xs text-blue-500 hover:text-blue-300 underline">
              Reset to MYBA defaults
            </button>
          </div>
        </Section>

        {/* Conditions & Notes */}
        <Section title="Conditions & Notes">
          <div className="space-y-4">
            <Field
              label="Special Conditions"
              hint="Shown to client — any charter-specific terms or inclusions"
            >
              <textarea value={specialConditions} onChange={e => setSpecialConditions(e.target.value)}
                rows={4} placeholder="e.g. Skipper and hostess included. Fuel up to 4 hours/day included…"
                className={inputCls} />
            </Field>
            <Field
              label="Admin Notes (internal only)"
              hint="Not shown to client"
            >
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                rows={3} placeholder="Internal notes about this client or booking…"
                className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap gap-3 pb-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : isNew ? 'Create Proposal' : 'Save Changes'}
          </button>
          {saved && (
            <span className="px-4 py-3 text-emerald-400 text-sm font-medium">✓ Saved</span>
          )}
          {proposalToken && status === 'draft' && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              {sending ? 'Sending…' : '📤 Send to Client'}
            </button>
          )}
          {proposalToken && status !== 'draft' && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-blue-200 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {sending ? 'Updating…' : '📤 Resend / Reactivate'}
            </button>
          )}
        </div>
      </form>

      {/* Comments thread — shown for existing proposals */}
      {!isNew && existingComments.length > 0 && (
        <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-5">
            Client Discussion ({existingComments.length})
          </h3>
          <div className="space-y-4 mb-6">
            {existingComments.map(c => (
              <div key={c.id} className={`flex gap-3 ${c.isAdmin ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${c.isAdmin ? 'bg-blue-600/50 text-blue-200' : 'bg-white/20 text-white'}`}>
                  {c.author.charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-[75%] ${c.isAdmin ? 'items-end flex flex-col' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${c.isAdmin ? 'bg-blue-600/30 text-blue-100 rounded-tr-sm' : 'bg-white/15 text-white rounded-tl-sm'}`}>
                    <div className="text-xs font-semibold mb-1 opacity-70">{c.isAdmin ? 'BlueOne Team' : c.author}</div>
                    <p className="leading-relaxed whitespace-pre-wrap">{c.text}</p>
                  </div>
                  <div className="text-xs text-blue-500 mt-1 px-1">
                    {new Date(c.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin reply form */}
          <form onSubmit={handleAdminReply} className="flex gap-3">
            <input
              type="text"
              value={adminReply}
              onChange={e => setAdminReply(e.target.value)}
              placeholder="Reply to client…"
              className={`${inputCls} flex-1`}
            />
            <button
              type="submit"
              disabled={sendingReply || !adminReply.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {sendingReply ? '…' : 'Reply'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
