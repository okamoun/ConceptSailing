'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getCharterByProposalToken,
  markCharterProposalViewed,
  addCharterProposalComment,
  approveCharterProposal,
  rejectCharterProposal,
  calcTotals,
  proposalRef,
  type Charter,
  type ProposalStatus,
  type ProposalComment,
} from '../../../lib/availability';
import { getMarinaById } from '../../marinas-data';
import { CONTACT } from '../../config/contact';

const fmt = (n: number, currency = 'EUR') =>
  new Intl.NumberFormat('en-EU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: 'text-gray-500',    bg: 'bg-gray-100' },
  sent:      { label: 'Sent',      color: 'text-blue-700',    bg: 'bg-blue-50' },
  viewed:    { label: 'Viewed',    color: 'text-indigo-700',  bg: 'bg-indigo-50' },
  commented: { label: 'Commented', color: 'text-amber-700',   bg: 'bg-amber-50' },
  approved:  { label: 'Approved',  color: 'text-emerald-700', bg: 'bg-emerald-50' },
  rejected:  { label: 'Declined',  color: 'text-red-700',     bg: 'bg-red-50' },
};

function nightCount(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}

interface Props { token: string }

export default function ProposalClient({ token }: Props) {
  const [charter, setCharter] = useState<Charter | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSent, setCommentSent] = useState(false);
  const [localComments, setLocalComments] = useState<ProposalComment[]>([]);

  const [actioning, setActioning] = useState<'approving' | 'rejecting' | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    getCharterByProposalToken(token)
      .then(async c => {
        if (!c || !c.proposal) { setNotFound(true); return; }
        setCharter(c);
        setLocalComments(c.proposal.comments ?? []);
        if (c.proposal.status === 'sent') {
          await markCharterProposalViewed(c.id);
          setCharter(prev => prev ? { ...prev, proposal: { ...prev.proposal!, status: 'viewed' } } : prev);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!charter || !commentName.trim() || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await addCharterProposalComment(
        charter.id,
        { author: commentName.trim(), text: commentText.trim(), isAdmin: false },
        charter.proposal!.status
      );
      const newComment: ProposalComment = {
        id: Date.now().toString(),
        author: commentName.trim(),
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
        isAdmin: false,
      };
      setLocalComments(prev => [...prev, newComment]);
      setCharter(prev => prev ? { ...prev, proposal: { ...prev.proposal!, status: 'commented' } } : prev);
      setCommentText('');
      setCommentSent(true);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleApprove() {
    if (!charter) return;
    setActioning('approving');
    await approveCharterProposal(charter.id);
    setCharter(prev => prev ? { ...prev, proposal: { ...prev.proposal!, status: 'approved' } } : prev);
    setActioning(null);
    setConfirmAction(null);
  }

  async function handleReject() {
    if (!charter) return;
    setActioning('rejecting');
    await rejectCharterProposal(charter.id);
    setCharter(prev => prev ? { ...prev, proposal: { ...prev.proposal!, status: 'rejected' } } : prev);
    setActioning(null);
    setConfirmAction(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading proposal…</div>
      </div>
    );
  }

  if (notFound || !charter || !charter.proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">⚓</div>
        <h1 className="text-2xl font-bold text-gray-800">Proposal Not Found</h1>
        <p className="text-gray-500 text-center max-w-sm">
          This proposal link may be invalid or expired. Please contact us for assistance.
        </p>
        <a href={`mailto:${CONTACT.email}`} className="text-blue-600 underline text-sm">{CONTACT.email}</a>
      </div>
    );
  }

  const proposal = charter.proposal;
  const totals = calcTotals(proposal.pricing);
  const nights = nightCount(charter.startDate, charter.endDate);
  const statusCfg = STATUS_CONFIG[proposal.status];
  const canAct = proposal.status !== 'approved' && proposal.status !== 'rejected' && proposal.status !== 'draft';
  const currency = proposal.pricing.currency || 'EUR';

  const embarkLabel = getMarinaById(charter.deliveryPoint ?? '')?.name ?? charter.embarkationPoint ?? '';
  const disembarkLabel = getMarinaById(charter.redeliveryPoint ?? '')?.name ?? embarkLabel;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          nav, footer { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center flex-shrink-0">
                  <Image src="/images/logos/blueone-logo.png" alt="BlueOne" width={40} height={40}
                    className="object-contain" onError={() => {}} />
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-800">BlueOne</div>
                  <div className="text-xs text-gray-500">Luxury Yacht Charters</div>
                  <div className="text-xs text-gray-400 mt-0.5">Fountaine Pajot Aura 51</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{proposalRef(charter.id)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Valid until: {fmtDate(proposal.expiresAt)}
                </div>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Prepared for</div>
                <div className="font-semibold text-gray-900">{charter.name}</div>
                <div className="text-sm text-gray-600">{charter.email}</div>
                {charter.phone && <div className="text-sm text-gray-500">{charter.phone}</div>}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">From</div>
                <div className="font-semibold text-gray-900">{CONTACT.company.name}</div>
                <div className="text-sm text-gray-600">{CONTACT.email}</div>
                <div className="text-sm text-gray-500">{CONTACT.phone.formatted}</div>
              </div>
            </div>
          </div>

          {/* Status banners */}
          {proposal.status === 'approved' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 text-center no-print">
              <div className="text-3xl mb-2">✓</div>
              <div className="font-semibold text-emerald-800 text-lg">Proposal Approved</div>
              <p className="text-emerald-700 text-sm mt-1">
                Thank you. We will be in touch shortly to finalise your charter agreement.
              </p>
            </div>
          )}
          {proposal.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-center no-print">
              <div className="text-3xl mb-2">✗</div>
              <div className="font-semibold text-red-800 text-lg">Proposal Declined</div>
              <p className="text-red-700 text-sm mt-1">
                Please contact us to discuss alternatives.
              </p>
            </div>
          )}

          {/* Charter Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Charter Details</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Vessel</div>
                <div className="font-semibold text-gray-900">{charter.boat}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Guests</div>
                <div className="font-semibold text-gray-900">{charter.passengers} passengers</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Charter Period</div>
                <div className="font-semibold text-gray-900">
                  {fmtDate(charter.startDate)} → {fmtDate(charter.endDate)}
                </div>
                <div className="text-sm text-gray-500">{nights} night{nights !== 1 ? 's' : ''}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Embarkation / Disembarkation</div>
                <div className="font-semibold text-gray-900">{embarkLabel || '—'}</div>
                {disembarkLabel && disembarkLabel !== embarkLabel && (
                  <div className="text-sm text-gray-500">↩ {disembarkLabel}</div>
                )}
              </div>
              {charter.selectedTheme && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Experience Theme</div>
                  <div className="font-semibold text-gray-900">{charter.selectedTheme}</div>
                </div>
              )}
            </div>
            {charter.holidayDescription && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Itinerary Overview</div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{charter.holidayDescription}</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Pricing Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Charter Fee</span>
                <span className="font-medium text-gray-900">{fmt(totals.base, currency)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Discount</span>
                  <span className="font-medium text-emerald-600">− {fmt(totals.discount, currency)}</span>
                </div>
              )}
              {(proposal.pricing.extras || []).map((extra, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{extra.label}</span>
                  <span className="font-medium text-gray-900">{fmt(extra.amount, currency)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-3">
                <span className="text-gray-800">Charter Fee Total</span>
                <span className="text-gray-900">{fmt(totals.charterFee, currency)}</span>
              </div>
              {totals.apa > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">APA — Additional Provisioning Allowance ({proposal.pricing.apaPercentage}%)</span>
                  <span className="font-medium text-gray-900">{fmt(totals.apa, currency)}</span>
                </div>
              )}
              {(proposal.pricing.securityDeposit || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Deposit (refundable)</span>
                  <span className="font-medium text-gray-900">{fmt(proposal.pricing.securityDeposit, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t-2 border-gray-200 pt-3">
                <span className="text-gray-900">Grand Total</span>
                <span className="text-blue-800">{fmt(totals.grandTotal, currency)}</span>
              </div>
            </div>
            {totals.apa > 0 && (
              <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                The APA (Additional Provisioning Allowance) is an advance held by the captain to cover fuel,
                port fees, provisions, crew gratuities, and other running expenses. Any unspent balance is
                returned at charter end.
              </p>
            )}
          </div>

          {/* Payment Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Payment Schedule</h2>
            <div className="space-y-4">
              {(proposal.paymentTerms || []).map((term, i) => {
                const amount = Math.round(totals.charterFee * term.percentage / 100);
                return (
                  <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-700">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{term.label}</span>
                        <span className="font-bold text-blue-800">{fmt(amount, currency)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{term.description}</p>
                    </div>
                  </div>
                );
              })}
              {(proposal.pricing.securityDeposit || 0) > 0 && (
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-500">↩</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold text-gray-900 text-sm">Security Deposit (refundable)</span>
                      <span className="font-bold text-gray-700">{fmt(proposal.pricing.securityDeposit, currency)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Due 14 days prior to charter. Fully refundable within 14 days of charter completion.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MYBA Contract Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex gap-3">
              <div className="text-blue-600 mt-0.5 text-lg flex-shrink-0">⚖</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">MYBA Charter Agreement</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  This proposal is subject to the standard{' '}
                  <strong>MYBA (Mediterranean Yacht Brokers Association) Charter Agreement</strong>.
                  Upon acceptance, the legally binding charter contract will be issued incorporating the MYBA
                  terms and conditions in their entirety, together with any special conditions set out below.
                </p>
              </div>
            </div>
          </div>

          {/* Special Conditions */}
          {proposal.specialConditions && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Special Conditions</h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{proposal.specialConditions}</p>
            </div>
          )}

          {/* Print button */}
          <div className="flex justify-center mb-8 no-print">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm">
              ⬇ Download PDF
            </button>
          </div>

          {/* Comments & Approval */}
          <div className="no-print">
            {/* Existing comments */}
            {localComments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Discussion</h2>
                <div className="space-y-4">
                  {localComments.map(c => (
                    <div key={c.id} className={`flex gap-3 ${c.isAdmin ? '' : 'flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${c.isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.author.charAt(0).toUpperCase()}
                      </div>
                      <div className={`max-w-[75%] ${c.isAdmin ? '' : 'items-end flex flex-col'}`}>
                        <div className={`rounded-2xl px-4 py-3 text-sm ${c.isAdmin ? 'bg-blue-50 text-blue-900 rounded-tl-sm' : 'bg-gray-100 text-gray-800 rounded-tr-sm'}`}>
                          <div className={`text-xs font-semibold mb-1 ${c.isAdmin ? 'text-blue-600' : 'text-gray-500'}`}>
                            {c.isAdmin ? 'BlueOne Team' : c.author}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{c.text}</p>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 px-1">
                          {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment form */}
            {proposal.status !== 'draft' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  {localComments.length > 0 ? 'Add a Comment' : 'Questions or Comments?'}
                </h2>
                {commentSent ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <div className="text-emerald-700 font-medium text-sm">Message sent — thank you!</div>
                    <button onClick={() => setCommentSent(false)} className="mt-3 text-xs text-emerald-700 underline">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleComment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Your Name</label>
                      <input type="text" value={commentName} onChange={e => setCommentName(e.target.value)}
                        placeholder={charter.name ?? ''} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                      <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={4}
                        placeholder="Ask a question or leave feedback…"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" required />
                    </div>
                    <button type="submit" disabled={submittingComment}
                      className="px-6 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors">
                      {submittingComment ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Approve / Reject */}
            {canAct && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Proposal Decision</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Once you are happy with the proposal, approve it below. We will then issue the formal MYBA
                  Charter Agreement for signature.
                </p>
                {confirmAction === null ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setConfirmAction('approve')}
                      className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                      ✓ Approve This Proposal
                    </button>
                    <button onClick={() => setConfirmAction('reject')}
                      className="flex-1 py-3.5 bg-white border border-red-300 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors">
                      ✕ Decline
                    </button>
                  </div>
                ) : confirmAction === 'approve' ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <p className="text-emerald-800 font-medium text-sm mb-4">
                      Please confirm you wish to approve this proposal.
                    </p>
                    <div className="flex gap-3">
                      <button onClick={handleApprove} disabled={actioning !== null}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                        {actioning === 'approving' ? 'Approving…' : 'Yes, Approve'}
                      </button>
                      <button onClick={() => setConfirmAction(null)} className="px-5 py-2.5 text-gray-600 text-sm hover:text-gray-800">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <p className="text-red-800 font-medium text-sm mb-4">
                      Are you sure you wish to decline? You can add a comment above to let us know how we can adjust it.
                    </p>
                    <div className="flex gap-3">
                      <button onClick={handleReject} disabled={actioning !== null}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                        {actioning === 'rejecting' ? 'Declining…' : 'Yes, Decline'}
                      </button>
                      <button onClick={() => setConfirmAction(null)} className="px-5 py-2.5 text-gray-600 text-sm hover:text-gray-800">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 pb-8">
            <p>{CONTACT.company.name} · {CONTACT.email} · {CONTACT.phone.formatted}</p>
            <p className="mt-1">This proposal is confidential and intended solely for the named recipient.</p>
          </div>
        </div>
      </div>
    </>
  );
}
