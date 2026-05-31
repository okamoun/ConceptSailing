'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCharterById,
  updateCharter,
  initCharterProposal,
  updateCharterProposal,
  markCharterProposalSent,
  addCharterProposalComment,
  proposalRef,
  calcTotals,
  DEFAULT_PAYMENT_TERMS,
  DEFAULT_PRICING,
  DEFAULT_INCLUSIONS,
  type Charter,
  type ProposalPricing,
  type PaymentTerm,
  type PricingExtra,
  type ProposalStatus,
  type ProposalComment,
} from '../../../../lib/availability';
import { getPricingConfig, getSeasonTier, type PricingConfig } from '../../../../lib/financial';
import { getMarinaById } from '../../../marinas-data';
import { CONTACT } from '../../../config/contact';

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

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
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

interface Props { id: string }

export default function ProposalEditorClient({ id }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [charter, setCharter] = useState<Charter | null>(null);
  const [proposalToken, setProposalToken] = useState<string | null>(null);
  const [status, setStatus] = useState<ProposalStatus>('draft');
  const [linkCopied, setLinkCopied] = useState(false);

  // Admin comment reply
  const [adminReply, setAdminReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [comments, setComments] = useState<ProposalComment[]>([]);

  // ── Charter core fields (editable) ──
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [boat, setBoat] = useState('BlueOne — Fountaine Pajot Aura 51');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryPoint, setDeliveryPoint] = useState('');
  const [redeliveryPoint, setRedeliveryPoint] = useState('');
  const [passengers, setPassengers] = useState(2);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');

  // ── Proposal-only fields ──
  const [pricing, setPricing] = useState<ProposalPricing>(DEFAULT_PRICING);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>(DEFAULT_PAYMENT_TERMS);
  const [inclusions, setInclusions] = useState<string[]>(DEFAULT_INCLUSIONS);
  const [specialConditions, setSpecialConditions] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [financialPricing, setFinancialPricing] = useState<PricingConfig | null>(null);

  const totals = useMemo(() => calcTotals(pricing), [pricing]);

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
  }, [startDate, endDate]);

  const standardRate = useMemo(() => {
    if (!startDate || nights <= 0 || !financialPricing) return null;
    const tier = getSeasonTier(startDate);
    const weekly = { high: financialPricing.highSeasonRate, mid: financialPricing.midSeasonRate, low: financialPricing.lowSeasonRate }[tier];
    const tierLabel = { high: 'High Season (Jul–Aug)', mid: 'Mid Season (Jun & Sep)', low: 'Low Season' }[tier];
    return { tier, tierLabel, weekly, total: Math.round(weekly * nights / 7) };
  }, [startDate, nights, financialPricing]);

  const proposalUrl = proposalToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/proposal/${proposalToken}`
    : null;

  // Resolve marina IDs to human-readable labels for display
  const embarkLabel = useMemo(() => {
    if (!charter) return '';
    return getMarinaById(charter.deliveryPoint ?? '')?.name ?? charter.embarkationPoint ?? '';
  }, [charter]);

  const disembarkLabel = useMemo(() => {
    if (!charter) return embarkLabel;
    return getMarinaById(charter.redeliveryPoint ?? '')?.name ?? embarkLabel;
  }, [charter, embarkLabel]);

  const populate = useCallback((c: Charter) => {
    setCharter(c);
    setName(c.name ?? '');
    setEmail(c.email ?? '');
    setPhone(c.phone ?? '');
    setBoat(c.boat ?? 'BlueOne — Fountaine Pajot Aura 51');
    setStartDate(c.startDate);
    setEndDate(c.endDate);
    setDeliveryPoint(c.deliveryPoint ?? '');
    setRedeliveryPoint(c.redeliveryPoint ?? c.deliveryPoint ?? '');
    setPassengers(c.passengers ?? 2);
    setSelectedTheme(c.selectedTheme ?? '');
    setHolidayDescription(c.holidayDescription ?? '');
    if (c.proposal) {
      setPricing(c.proposal.pricing ?? DEFAULT_PRICING);
      setPaymentTerms(c.proposal.paymentTerms ?? DEFAULT_PAYMENT_TERMS);
      setInclusions(c.proposal.inclusions ?? DEFAULT_INCLUSIONS);
      setSpecialConditions(c.proposal.specialConditions ?? '');
      setAdminNotes(c.proposal.adminNotes ?? '');
      setExpiresAt(c.proposal.expiresAt ?? '');
      setProposalToken(c.proposal.token);
      setStatus(c.proposal.status);
      setComments(c.proposal.comments ?? []);
    } else {
      // Proposal not yet initialised — set default expiry
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setExpiresAt(d.toISOString().split('T')[0]);
    }
  }, []);

  useEffect(() => {
    getCharterById(id)
      .then(c => { if (c) populate(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, populate]);

  useEffect(() => {
    getPricingConfig().then(setFinancialPricing).catch(console.error);
  }, []);

  // Auto-fill base price from standard rates when creating a new proposal
  useEffect(() => {
    if (!proposalToken && standardRate && pricing.basePrice === 0) {
      setPricing(p => ({ ...p, basePrice: standardRate.total }));
    }
  }, [proposalToken, standardRate, pricing.basePrice]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !startDate || !endDate) {
      setError('Please fill in client name, email, and charter dates.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Update charter core fields
      await updateCharter(id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        boat: boat.trim(),
        startDate,
        endDate,
        deliveryPoint: deliveryPoint || undefined,
        redeliveryPoint: redeliveryPoint || undefined,
        passengers,
        selectedTheme: selectedTheme.trim() || undefined,
        holidayDescription: holidayDescription.trim() || undefined,
      });

      if (!proposalToken) {
        // First save — initialise the proposal sub-object
        const token = await initCharterProposal(id);
        setProposalToken(token);
        setStatus('draft');
      }

      // Update proposal-only fields
      await updateCharterProposal(id, {
        pricing,
        paymentTerms,
        inclusions,
        specialConditions: specialConditions.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
        expiresAt,
        status,
      });

      // Refresh charter state
      const fresh = await getCharterById(id);
      if (fresh) setCharter(fresh);

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
    if (!proposalToken) { setError('Save the proposal first.'); return; }
    setSending(true);
    setError('');
    try {
      // Persist latest form data first
      await updateCharter(id, {
        name: name.trim(), email: email.trim(), phone: phone.trim() || undefined,
        boat: boat.trim(), startDate, endDate, passengers,
        selectedTheme: selectedTheme.trim() || undefined,
        holidayDescription: holidayDescription.trim() || undefined,
        deliveryPoint: deliveryPoint || undefined,
        redeliveryPoint: redeliveryPoint || undefined,
      });
      await updateCharterProposal(id, {
        pricing, paymentTerms, inclusions,
        specialConditions: specialConditions.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
        expiresAt,
      });
      await markCharterProposalSent(id);
      setStatus('sent');
      setCharter(prev => prev ? { ...prev, status: 'proposal_sent' } : prev);

      // Open local mail client with pre-filled proposal email
      const url = proposalUrl ?? '';
      const firstName = name.trim().split(' ')[0];
      const ref = proposalRef(id);
      const subject = `Your Charter Proposal — ${ref}`;
      const body = [
        `Dear ${firstName},`,
        '',
        `Thank you for your interest in chartering with BlueOne. We are delighted to present your personalised charter proposal.`,
        '',
        `Please find your proposal at the link below:`,
        url,
        '',
        `The proposal covers your charter aboard ${boat.trim()} from ${startDate} to ${endDate}. It includes full pricing, payment schedule, and terms. You can approve or ask questions directly from the proposal page.`,
        '',
        `This proposal is valid until ${expiresAt || 'the expiry date shown in the proposal'}.`,
        '',
        `Should you have any questions, please do not hesitate to contact us at ${CONTACT.email} or ${CONTACT.phone.formatted}.`,
        '',
        `We look forward to welcoming you aboard.`,
        '',
        `Warm regards,`,
        `The BlueOne Team`,
        CONTACT.email,
        CONTACT.phone.formatted,
      ].join('\n');

      const mailto = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    } catch (err) {
      setError('Failed to send. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function handleAdminReply(e: React.FormEvent) {
    e.preventDefault();
    if (!adminReply.trim()) return;
    setSendingReply(true);
    try {
      await addCharterProposalComment(
        id,
        { author: 'BlueOne Team', text: adminReply.trim(), isAdmin: true },
        status
      );
      setComments(prev => [
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

  function updateTerm(i: number, field: keyof PaymentTerm, value: string | number) {
    const terms = [...paymentTerms];
    terms[i] = { ...terms[i], [field]: field === 'percentage' ? Number(value) : value };
    setPaymentTerms(terms);
  }

  if (loading) {
    return <div className="p-8 text-blue-300 text-sm">Loading…</div>;
  }

  if (!charter) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-300 text-sm mb-4">Booking not found.</p>
        <button onClick={() => router.push('/admin')} className="text-blue-400 hover:text-white text-sm underline">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => router.push('/admin')} className="text-blue-400 hover:text-white text-sm transition-colors">
              ← Dashboard
            </button>
            <span className="text-blue-500 text-sm font-mono">{proposalRef(id)}</span>
            {proposalToken && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}>
                {status}
              </span>
            )}
          </div>
          <h1 className="text-white text-2xl font-bold mt-2">
            {proposalToken ? 'Edit Proposal' : 'Create Proposal'}
          </h1>
          {charter.name && (
            <p className="text-blue-300 text-sm mt-0.5">
              {charter.name} · {charter.startDate} → {charter.endDate}
              {embarkLabel && ` · ${embarkLabel}`}
              {disembarkLabel && disembarkLabel !== embarkLabel && ` → ${disembarkLabel}`}
            </p>
          )}
        </div>
      </div>

      {/* Shareable link */}
      {proposalToken && (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5 mb-6">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">Client Link</div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <code className="flex-1 text-xs text-blue-200 bg-black/20 rounded-lg px-3 py-2 break-all font-mono">
              {proposalUrl}
            </code>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={copyLink}
                className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-white rounded-xl text-xs font-medium transition-colors">
                {linkCopied ? '✓ Copied' : 'Copy Link'}
              </button>
              <a href={`/proposal/${proposalToken}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-blue-200 rounded-xl text-xs font-medium transition-colors">
                Preview
              </a>
            </div>
          </div>
          {status === 'draft' && (
            <p className="text-xs text-amber-300 mt-3">
              ⚠ Draft — click <strong>Send to Client</strong> to activate the link.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Client & Charter Details — reads from / writes to charter core fields */}
        <Section title="Client & Charter Details">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Field label="Client Name *">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Jean-Pierre Dupont" className={inputCls} required />
            </Field>
            <Field label="Email *">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="client@example.com" className={inputCls} required />
            </Field>
            <Field label="Phone">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78" className={inputCls} />
            </Field>
            <Field label="Vessel">
              <input type="text" value={boat} onChange={e => setBoat(e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Guests">
              <input type="number" value={passengers} onChange={e => setPassengers(Number(e.target.value))}
                min={1} max={12} className={inputCls} />
            </Field>
            <Field label="Experience Theme">
              <input type="text" value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}
                placeholder="Cyclades Discovery…" className={inputCls} />
            </Field>
            <Field label="Start Date *">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className={inputCls} required />
            </Field>
            <Field label="End Date *">
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className={inputCls} required />
            </Field>
            <Field label="Proposal Expiry" hint="Link expires on this date">
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                className={inputCls} />
            </Field>
          </div>
          <Field label="Itinerary / Holiday Description">
            <textarea value={holidayDescription} onChange={e => setHolidayDescription(e.target.value)}
              rows={4} placeholder="Day 1: Depart Athens…" className={inputCls} />
          </Field>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          {/* Standard rate reference */}
          {standardRate && (
            <div className="bg-blue-900/30 border border-blue-400/20 rounded-xl px-4 py-3 mb-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="text-blue-300 font-medium">{standardRate.tierLabel}</span>
              <span className="text-blue-200">{fmt(standardRate.weekly)}<span className="text-blue-400 text-xs">/week</span></span>
              <span className="text-blue-400">×</span>
              <span className="text-blue-200">{nights} nights ({(nights / 7).toFixed(2)} wks)</span>
              <span className="text-blue-400">=</span>
              <span className="text-white font-semibold">{fmt(standardRate.total)}</span>
              {pricing.basePrice !== standardRate.total && (
                <button type="button" onClick={() => setPricing(p => ({ ...p, basePrice: standardRate.total }))}
                  className="ml-auto text-xs text-blue-400 hover:text-blue-200 underline">
                  Use standard rate
                </button>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <Field label="Base Charter Fee (€)">
              <input type="number" value={pricing.basePrice}
                onChange={e => setPricing(p => ({ ...p, basePrice: Number(e.target.value) }))}
                min={0} step={100} className={inputCls} />
            </Field>
            <Field label="Discount (%)" hint={totals.discount > 0 ? `= ${fmt(totals.discount)} off` : 'Applied to base fee'}>
              <input type="number" value={pricing.discountPercentage}
                onChange={e => setPricing(p => ({ ...p, discountPercentage: Number(e.target.value) }))}
                min={0} max={100} className={inputCls} />
            </Field>
            <Field label="APA Percentage (%)" hint="Typically 25–35%">
              <input type="number" value={pricing.apaPercentage}
                onChange={e => setPricing(p => ({ ...p, apaPercentage: Number(e.target.value) }))}
                min={0} max={100} className={inputCls} />
            </Field>
            <Field label="VAT (%)" hint="Applied to charter fee">
              <input type="number" value={pricing.vatPercentage ?? 13}
                onChange={e => setPricing(p => ({ ...p, vatPercentage: Number(e.target.value) }))}
                min={0} max={100} className={inputCls} />
            </Field>
            <Field label="Security Deposit (€)" hint="Refundable">
              <input type="number" value={pricing.securityDeposit}
                onChange={e => setPricing(p => ({ ...p, securityDeposit: Number(e.target.value) }))}
                min={0} step={100} className={inputCls} />
            </Field>
          </div>

          {/* Extras */}
          <div className="mb-5">
            <div className="text-xs font-medium text-blue-200 mb-2">Additional Services / Extras</div>
            <div className="space-y-2">
              {pricing.extras.map((extra, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={extra.label} onChange={e => updateExtra(i, 'label', e.target.value)}
                    placeholder="Service" className={`${inputCls} flex-1`} />
                  <input type="number" value={extra.amount} onChange={e => updateExtra(i, 'amount', e.target.value)}
                    min={0} className={`${inputCls} w-28`} />
                  <button type="button" onClick={() => setPricing(p => ({ ...p, extras: p.extras.filter((_, idx) => idx !== i) }))}
                    className="text-red-400 hover:text-red-300 px-2">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setPricing(p => ({ ...p, extras: [...p.extras, { label: '', amount: 0 }] }))}
                className="text-xs text-blue-400 hover:text-blue-200 underline">+ Add extra</button>
            </div>
          </div>

          {/* Live totals */}
          <div className="bg-black/20 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">Totals Preview</div>
            <div className="flex justify-between text-sm text-blue-200">
              <span>Base Charter Fee</span><span>{fmt(totals.base)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Discount ({pricing.discountPercentage}%)</span><span>− {fmt(totals.discount)}</span>
              </div>
            )}
            {totals.extrasSum > 0 && (
              <div className="flex justify-between text-sm text-blue-200">
                <span>Extras</span><span>{fmt(totals.extrasSum)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold text-white border-t border-white/10 pt-2">
              <span>Charter Fee</span><span>{fmt(totals.charterFee)}</span>
            </div>
            {totals.vat > 0 && (
              <div className="flex justify-between text-sm text-blue-200">
                <span>VAT ({pricing.vatPercentage ?? 13}%)</span><span>{fmt(totals.vat)}</span>
              </div>
            )}
            {totals.apa > 0 && (
              <div className="flex justify-between text-sm text-blue-200">
                <span>APA ({pricing.apaPercentage}%)</span><span>{fmt(totals.apa)}</span>
              </div>
            )}
            {totals.vat > 0 && (
              <div className="flex justify-between text-sm text-blue-200">
                <span>VAT ({pricing.vatPercentage ?? 13}%)</span><span>{fmt(totals.vat)}</span>
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

        {/* Inclusions */}
        <Section title="What's Included">
          <div className="space-y-2 mb-4">
            {inclusions.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const next = [...inclusions];
                    next[i] = e.target.value;
                    setInclusions(next);
                  }}
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => setInclusions(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-300 px-2 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setInclusions(prev => [...prev, ''])}
              className="text-xs text-blue-400 hover:text-blue-200 underline"
            >
              + Add item
            </button>
            <button
              type="button"
              onClick={() => setInclusions(DEFAULT_INCLUSIONS)}
              className="text-xs text-blue-500 hover:text-blue-300 underline"
            >
              Reset to defaults
            </button>
          </div>
        </Section>

        {/* Payment Terms */}
        <Section title="Payment Schedule (MYBA)">
          <div className="space-y-4 mb-4">
            {paymentTerms.map((term, i) => {
              const isLast = i === paymentTerms.length - 1;
              const termBase = Math.round(totals.charterFee * term.percentage / 100);
              const termTotal = isLast ? termBase + totals.apa + totals.vat : termBase;
              return (
                <div key={i} className="bg-black/10 rounded-xl p-4">
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={term.label} onChange={e => updateTerm(i, 'label', e.target.value)}
                      placeholder="e.g. Deposit — 50%" className={`${inputCls} flex-1`} />
                    <div className="flex items-center gap-1">
                      <input type="number" value={term.percentage} onChange={e => updateTerm(i, 'percentage', e.target.value)}
                        min={0} max={100} className={`${inputCls} w-20`} />
                      <span className="text-blue-300 text-sm">%</span>
                    </div>
                    <button type="button" onClick={() => setPaymentTerms(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-300 px-2">✕</button>
                  </div>
                  <input type="text" value={term.description} onChange={e => updateTerm(i, 'description', e.target.value)}
                    placeholder="Payment condition…" className={`${inputCls} text-xs`} />
                  {totals.charterFee > 0 && (
                    <div className="text-xs text-blue-400 mt-2">
                      = {fmt(termTotal)}
                      {isLast && (totals.apa > 0 || totals.vat > 0) && (
                        <span className="text-blue-500 ml-1">
                          ({fmt(termBase)} + APA {fmt(totals.apa)}{totals.vat > 0 ? ` + VAT ${fmt(totals.vat)}` : ''})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setPaymentTerms(prev => [...prev, { label: '', percentage: 0, description: '' }])}
              className="text-xs text-blue-400 hover:text-blue-200 underline">+ Add term</button>
            <button type="button" onClick={() => setPaymentTerms(DEFAULT_PAYMENT_TERMS)}
              className="text-xs text-blue-500 hover:text-blue-300 underline">Reset to MYBA defaults</button>
          </div>
        </Section>

        {/* Conditions & Notes */}
        <Section title="Conditions & Notes">
          <div className="space-y-4">
            <Field label="Special Conditions" hint="Visible to client">
              <textarea value={specialConditions} onChange={e => setSpecialConditions(e.target.value)}
                rows={4} placeholder="e.g. Skipper included, fuel up to 4 h/day…" className={inputCls} />
            </Field>
            <Field label="Admin Notes" hint="Internal only — not shown to client">
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                rows={3} placeholder="Internal notes…" className={inputCls} />
            </Field>
          </div>
        </Section>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-red-300 text-sm">{error}</div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap gap-3 pb-4">
          <button type="submit" disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : proposalToken ? 'Save Changes' : 'Create Proposal'}
          </button>
          {saved && <span className="px-4 py-3 text-emerald-400 text-sm font-medium">✓ Saved</span>}
          {proposalToken && status === 'draft' && (
            <button type="button" onClick={handleSend} disabled={sending}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors">
              {sending ? 'Sending…' : '📤 Send to Client'}
            </button>
          )}
          {proposalToken && status !== 'draft' && (
            <button type="button" onClick={handleSend} disabled={sending}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-blue-200 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
              {sending ? 'Updating…' : '📤 Resend / Reactivate'}
            </button>
          )}
        </div>
      </form>

      {/* Comments thread */}
      {comments.length > 0 && (
        <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-5">
            Client Discussion ({comments.length})
          </h3>
          <div className="space-y-4 mb-6">
            {comments.map(c => (
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
                    {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleAdminReply} className="flex gap-3">
            <input type="text" value={adminReply} onChange={e => setAdminReply(e.target.value)}
              placeholder="Reply to client…" className={`${inputCls} flex-1`} />
            <button type="submit" disabled={sendingReply || !adminReply.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
              {sendingReply ? '…' : 'Reply'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
