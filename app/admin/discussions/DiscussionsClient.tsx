'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  getAllCharters,
  addCharterProposalComment,
  type Charter,
  type ProposalStatus,
} from '../../../lib/availability';
import {
  getAllClientSpaceThreads,
  addClientSpaceMessage,
  type ClientSpaceThread,
} from '../../../lib/clientSpace';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEEN_KEY = 'admin_discussions_last_seen';
const ADMIN_NAME = 'BlueOne Team';

function timeAgo(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_BADGE: Record<ProposalStatus, string> = {
  draft:     'bg-slate-500/30 text-slate-300',
  sent:      'bg-blue-500/30 text-blue-200',
  viewed:    'bg-purple-500/30 text-purple-200',
  commented: 'bg-amber-500/30 text-amber-200',
  approved:  'bg-emerald-500/30 text-emerald-200',
  rejected:  'bg-red-500/30 text-red-200',
};

// ---------------------------------------------------------------------------
// Types — normalized thread shared by both sources
// ---------------------------------------------------------------------------

interface ThreadMessage {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  isAdmin: boolean;
}

interface UnifiedThread {
  key: string;                          // `${source}:${id}` — unique per thread
  source: 'proposal' | 'client-space';
  clientName: string;
  charterId: string;
  charter?: Charter;                    // matched charter (proposal always; client-space when found)
  token?: string;                       // client-space token
  step?: number;                        // client-space step index (for replies)
  stepLabel?: string;                   // client-space step name tag
  status?: ProposalStatus;              // proposal only
  messages: ThreadMessage[];
  latestMessage: ThreadMessage;
  latestTs: number;
  hasUnread: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiscussionsClient() {
  const [charters, setCharters] = useState<Charter[]>([]);
  const [csThreads, setCsThreads] = useState<ClientSpaceThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingKey, setSendingKey] = useState<string | null>(null);

  // Read last-seen timestamp before any state updates
  const lastSeenTs = useRef<number>(
    typeof window !== 'undefined'
      ? parseInt(localStorage.getItem(SEEN_KEY) ?? '0', 10)
      : 0
  );

  // On unmount, record visit time so next visit knows what's new
  useEffect(() => {
    const visited = Date.now();
    return () => { localStorage.setItem(SEEN_KEY, String(visited)); };
  }, []);

  useEffect(() => {
    Promise.all([getAllCharters(), getAllClientSpaceThreads()])
      .then(([c, t]) => { setCharters(c); setCsThreads(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const threads = useMemo<UnifiedThread[]>(() => {
    const seen = lastSeenTs.current;

    // Proposal threads
    const proposalThreads: UnifiedThread[] = charters
      .filter(c => c.proposal?.comments && c.proposal.comments.length > 0)
      .map(c => {
        const comments = c.proposal!.comments!;
        const latest = comments[comments.length - 1];
        const latestTs = Date.parse(latest.createdAt);
        return {
          key: `proposal:${c.id}`,
          source: 'proposal' as const,
          clientName: c.name ?? 'Unnamed client',
          charterId: c.id,
          charter: c,
          status: c.proposal!.status,
          messages: comments,
          latestMessage: latest,
          latestTs,
          hasUnread: latestTs > seen,
        };
      });

    // Client-space threads — one per (token, step) so each thread is single-step
    const clientThreads: UnifiedThread[] = [];
    for (const t of csThreads) {
      const charter = charters.find(c => c.clientSpaceToken === t.token || c.id === t.charterId);
      const byStep = new Map<number, ThreadMessage[]>();
      for (const m of t.messages) {
        const arr = byStep.get(m.step) ?? [];
        arr.push(m);
        byStep.set(m.step, arr);
      }
      for (const [step, msgs] of byStep) {
        const sorted = [...msgs].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
        const latest = sorted[sorted.length - 1];
        const latestTs = Date.parse(latest.createdAt);
        const askerName = sorted.find(m => !m.isAdmin)?.author;
        clientThreads.push({
          key: `client-space:${t.token}:${step}`,
          source: 'client-space' as const,
          clientName: charter?.name ?? askerName ?? 'Client',
          charterId: t.charterId,
          charter,
          token: t.token,
          step,
          stepLabel: t.messages.find(m => m.step === step)?.stepLabel ?? `Step ${step + 1}`,
          messages: sorted,
          latestMessage: latest,
          latestTs,
          hasUnread: latestTs > seen,
        });
      }
    }

    return [...proposalThreads, ...clientThreads].sort((a, b) => b.latestTs - a.latestTs);
  }, [charters, csThreads]);

  const unreadCount = threads.filter(t => t.hasUnread).length;

  function toggleExpand(key: string) {
    setExpandedKey(prev => (prev === key ? null : key));
  }

  function setReply(key: string, text: string) {
    setReplyTexts(prev => ({ ...prev, [key]: text }));
  }

  async function handleReply(thread: UnifiedThread) {
    const text = replyTexts[thread.key]?.trim();
    if (!text) return;
    setSendingKey(thread.key);
    try {
      if (thread.source === 'proposal' && thread.charter?.proposal) {
        await addCharterProposalComment(
          thread.charterId,
          { author: ADMIN_NAME, text, isAdmin: true },
          thread.charter.proposal.status
        );
        const newComment: ThreadMessage = {
          id: Date.now().toString(),
          author: ADMIN_NAME,
          text,
          isAdmin: true,
          createdAt: new Date().toISOString(),
        };
        setCharters(prev =>
          prev.map(c => {
            if (c.id !== thread.charterId || !c.proposal) return c;
            return {
              ...c,
              proposal: { ...c.proposal, comments: [...(c.proposal.comments ?? []), newComment] },
            };
          })
        );
      } else if (thread.source === 'client-space' && thread.token != null && thread.step != null) {
        const msg = await addClientSpaceMessage(thread.token, {
          step: thread.step,
          stepLabel: thread.stepLabel ?? '',
          author: ADMIN_NAME,
          text,
          isAdmin: true,
        });
        setCsThreads(prev =>
          prev.map(t =>
            t.token === thread.token ? { ...t, messages: [...t.messages, msg] } : t
          )
        );
      }
      setReply(thread.key, '');
    } finally {
      setSendingKey(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="px-4 py-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Discussions</h1>
        {unreadCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            {unreadCount} unread
          </span>
        )}
      </div>
      <p className="text-sm text-blue-300 mb-6">
        Proposal &amp; client-space threads · {threads.length} active {threads.length === 1 ? 'thread' : 'threads'}
      </p>

      {/* Loading */}
      {loading && (
        <p className="text-blue-200 text-sm text-center animate-pulse py-12">Loading…</p>
      )}

      {/* Empty */}
      {!loading && threads.length === 0 && (
        <div className="text-center py-16">
          <p className="text-blue-200 text-sm">No discussion threads yet.</p>
          <p className="text-blue-400 text-xs mt-1">Comments left by clients on proposals or in their client space will appear here.</p>
        </div>
      )}

      {/* Thread list */}
      {!loading && threads.length > 0 && (
        <div className="space-y-3 max-w-3xl">
          {threads.map(thread => {
            const { key, source, clientName, charter, messages, latestMessage, hasUnread } = thread;
            const isExpanded = expandedKey === key;

            return (
              <div
                key={key}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden"
              >
                {/* Summary row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(key)}
                  className="w-full text-left px-5 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Unread dot */}
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${hasUnread ? 'bg-amber-400' : 'bg-transparent'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white truncate">
                            {clientName}
                          </span>
                          {charter?.startDate && charter?.endDate && (
                            <span className="text-xs text-blue-400">
                              {fmtDate(charter.startDate)} – {fmtDate(charter.endDate)}
                            </span>
                          )}
                          {source === 'proposal' && thread.status && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_BADGE[thread.status] ?? STATUS_BADGE.draft}`}>
                              {thread.status}
                            </span>
                          )}
                          {source === 'client-space' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/25 text-teal-200 border border-teal-400/20">
                              {thread.stepLabel}
                            </span>
                          )}
                          <span className="text-[10px] text-blue-500">
                            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                          </span>
                        </div>
                        <p className="text-xs text-blue-300 mt-1 truncate">
                          <span className="font-medium text-blue-200">
                            {latestMessage.isAdmin ? ADMIN_NAME : latestMessage.author}:
                          </span>{' '}
                          {latestMessage.text.length > 80
                            ? latestMessage.text.slice(0, 80) + '…'
                            : latestMessage.text}
                          <span className="text-blue-500 ml-2">· {timeAgo(latestMessage.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {charter && (
                        <Link
                          href={`/admin/bookings/${charter.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[11px] text-blue-400 hover:text-blue-200 transition-colors whitespace-nowrap"
                        >
                          View Details →
                        </Link>
                      )}
                      {source === 'proposal' && charter && (
                        <Link
                          href={`/admin/proposals/${charter.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[11px] text-blue-400 hover:text-blue-200 transition-colors whitespace-nowrap"
                        >
                          View Proposal →
                        </Link>
                      )}
                      {source === 'client-space' && thread.token && (
                        <Link
                          href={`/client-space/${thread.token}/summary`}
                          onClick={e => e.stopPropagation()}
                          className="text-[11px] text-blue-400 hover:text-blue-200 transition-colors whitespace-nowrap"
                        >
                          View Space →
                        </Link>
                      )}
                      <svg
                        className={`w-4 h-4 text-blue-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded thread */}
                {isExpanded && (
                  <div className="border-t border-white/10 px-5 py-4">
                    {/* Bubbles */}
                    <div className="space-y-4 mb-4">
                      {messages.map(c => (
                        <div key={c.id} className={`flex gap-3 ${c.isAdmin ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${c.isAdmin ? 'bg-blue-600/50 text-blue-200' : 'bg-white/20 text-white'}`}>
                            {c.author.charAt(0).toUpperCase()}
                          </div>
                          <div className={`max-w-[75%] ${c.isAdmin ? 'items-end flex flex-col' : ''}`}>
                            <div className={`rounded-2xl px-4 py-3 text-sm ${c.isAdmin ? 'bg-blue-600/30 text-blue-100 rounded-tr-sm' : 'bg-white/15 text-white rounded-tl-sm'}`}>
                              <div className="text-xs font-semibold mb-1 opacity-70">
                                {c.isAdmin ? ADMIN_NAME : c.author}
                              </div>
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

                    {/* Reply form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyTexts[key] ?? ''}
                        onChange={e => setReply(key, e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(thread); } }}
                        placeholder="Reply to client…"
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-blue-400 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleReply(thread)}
                        disabled={sendingKey === key || !replyTexts[key]?.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        {sendingKey === key ? '…' : 'Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
