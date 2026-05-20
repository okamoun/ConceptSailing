'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getProposals,
  deleteProposal,
  proposalRef,
  calcTotals,
  type Proposal,
  type ProposalStatus,
} from '../../../lib/proposals';

const STATUS_BADGE: Record<ProposalStatus, string> = {
  draft:     'bg-gray-500/30 text-gray-200',
  sent:      'bg-sky-500/30 text-sky-200',
  viewed:    'bg-indigo-500/30 text-indigo-200',
  commented: 'bg-amber-500/30 text-amber-200',
  approved:  'bg-emerald-500/30 text-emerald-200',
  rejected:  'bg-red-500/30 text-red-200',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const fmt = (n: number) =>
  new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

type FilterStatus = ProposalStatus | 'all';

export default function ProposalsClient() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    getProposals()
      .then(setProposals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this proposal? This cannot be undone.')) return;
    await deleteProposal(id);
    setProposals(prev => prev.filter(p => p.id !== id));
  }

  const filtered = filter === 'all'
    ? proposals
    : proposals.filter(p => p.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold">Proposals</h1>
          <p className="text-blue-300 text-sm mt-1">
            To create a proposal, open a booking from the{' '}
            <a href="/admin" className="underline hover:text-white transition-colors">Dashboard</a>
            {' '}and click <strong className="text-white">+ Create Proposal</strong>.
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'draft', 'sent', 'viewed', 'commented', 'approved', 'rejected'] as FilterStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
              filter === s
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-blue-300 hover:text-white hover:bg-white/15',
            ].join(' ')}
          >
            {s === 'all' ? `All (${proposals.length})` : `${s} (${proposals.filter(p => p.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-blue-300 text-sm py-8 text-center">Loading proposals…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-blue-300 text-sm">
            {filter === 'all' ? 'No proposals yet.' : `No ${filter} proposals.`}
          </p>
          {filter === 'all' && (
            <a href="/admin" className="mt-4 inline-block text-blue-400 hover:text-white text-sm underline">
              Go to Dashboard to create a proposal from a booking →
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(proposal => {
            const totals = calcTotals(proposal.pricing);
            const hasComments = proposal.comments.length > 0;
            return (
              <div
                key={proposal.id}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: proposal info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-white font-bold text-sm font-mono">{proposalRef(proposal.id)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[proposal.status]}`}>
                        {proposal.status}
                      </span>
                      {hasComments && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-200">
                          💬 {proposal.comments.length} comment{proposal.comments.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="text-white font-semibold">{proposal.clientName}</div>
                    <div className="text-blue-300 text-sm">{proposal.clientEmail}</div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-blue-300">
                      <span>🚢 {proposal.boatName}</span>
                      <span>📅 {fmtDate(proposal.startDate)} → {fmtDate(proposal.endDate)}</span>
                      <span>⚓ {proposal.embarkationPort}</span>
                      <span>👥 {proposal.passengers} pax</span>
                    </div>
                  </div>

                  {/* Right: price + actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">{fmt(totals.grandTotal)}</div>
                      <div className="text-blue-400 text-xs">total incl. APA &amp; deposit</div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/proposals/${proposal.id}`}
                        className="px-3 py-1.5 bg-blue-600/60 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/proposal/${proposal.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-blue-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="text-xs text-blue-500">
                      Created {proposal.createdAt
                        ? new Date((proposal.createdAt as unknown as { seconds: number }).seconds * 1000)
                            .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : '—'}
                      {' · '}Expires {fmtDate(proposal.expiresAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
