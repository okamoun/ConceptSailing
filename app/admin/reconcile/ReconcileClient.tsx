'use client';

import { useEffect, useState } from 'react';
import {
  getAllCharters,
  createCharter,
  getCharterById,
  updateCharter,
  findOverlappingCharters,
  type Charter,
  type CharterStatus,
  CHARTER_STATUS_LABEL,
} from '../../../lib/availability';

// ── Types ────────────────────────────────────────────────────────────────────

interface BrokerPeriod {
  startDate: string;
  endDate: string;
  brokerStatus: 'Booked' | 'Hold';
  from: string;
  to: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseBrokerText(text: string): BrokerPeriod[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const periods: BrokerPeriod[] = [];
  for (let i = 0; i + 2 < lines.length; i++) {
    if (!lines[i].startsWith('Start Date:') || !lines[i + 1].startsWith('End Date:')) continue;
    const startStr = lines[i].replace('Start Date:', '').trim();
    const endStr   = lines[i + 1].replace('End Date:', '').trim();
    const m = lines[i + 2].match(/^(Booked|Hold):\s*(.+?)\*?\s+to\s+(.+)$/i);
    if (!m) continue;
    const parseIso = (s: string) => {
      const d = new Date(s);
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };
    const start = parseIso(startStr);
    const end   = parseIso(endStr);
    if (start && end) {
      periods.push({
        startDate: start,
        endDate: end,
        brokerStatus: m[1] as 'Booked' | 'Hold',
        from: m[2].trim(),
        to: m[3].trim(),
      });
    }
    i += 2;
  }
  return periods;
}

function mapBrokerStatus(s: 'Booked' | 'Hold'): CharterStatus {
  return s === 'Booked' ? 'confirmed' : 'broker_request';
}

const STATUS_BADGE: Record<CharterStatus, string> = {
  web_request:     'bg-sky-500/30 text-sky-200',
  broker_request:  'bg-amber-500/30 text-amber-200',
  serious_request: 'bg-orange-500/30 text-orange-200',
  proposal_sent:   'bg-violet-500/30 text-violet-200',
  confirmed:       'bg-emerald-500/30 text-emerald-200',
  signed:          'bg-emerald-800/40 text-emerald-100',
  canceled:        'bg-gray-500/30 text-gray-300',
  owner_use:       'bg-purple-500/30 text-purple-200',
  maintenance:     'bg-red-500/30 text-red-200',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReconcileClient() {
  const [charters, setCharters] = useState<Charter[]>([]);
  const [loading, setLoading] = useState(true);

  const [brokerRaw, setBrokerRaw] = useState('');
  const [brokerRef, setBrokerRef] = useState('');
  const [parsedPeriods, setParsedPeriods] = useState<BrokerPeriod[]>([]);
  const [reconcileDone, setReconcileDone] = useState<Set<number>>(new Set());
  const [reconcileLoading, setReconcileLoading] = useState<number | null>(null);

  useEffect(() => {
    getAllCharters()
      .then(setCharters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleParse() {
    setParsedPeriods(parseBrokerText(brokerRaw));
    setReconcileDone(new Set());
  }

  async function handleLinkCharter(periodIdx: number, charterId: string, period: BrokerPeriod) {
    setReconcileLoading(periodIdx);
    try {
      await updateCharter(charterId, {
        externalRef: brokerRef || undefined,
        disembarkationPort: period.to,
      });
      setCharters(prev =>
        prev.map(c =>
          c.id === charterId
            ? { ...c, externalRef: brokerRef || undefined, disembarkationPort: period.to }
            : c
        )
      );
      setReconcileDone(prev => new Set(prev).add(periodIdx));
    } finally {
      setReconcileLoading(null);
    }
  }

  async function handleCreateFromBroker(periodIdx: number, period: BrokerPeriod) {
    setReconcileLoading(periodIdx);
    try {
      const id = await createCharter({
        status: mapBrokerStatus(period.brokerStatus),
        startDate: period.startDate,
        endDate: period.endDate,
        embarkationPoint: period.from,
        disembarkationPort: period.to,
        externalRef: brokerRef || undefined,
        note: `Imported from broker (${period.brokerStatus})`,
      });
      const newCharter = await getCharterById(id);
      if (newCharter) {
        setCharters(prev =>
          [...prev, newCharter].sort((a, b) => a.startDate.localeCompare(b.startDate))
        );
      }
      setReconcileDone(prev => new Set(prev).add(periodIdx));
    } finally {
      setReconcileLoading(null);
    }
  }

  return (
    <main className="px-4 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h1 className="text-white font-bold text-2xl">Broker Reconcile</h1>
          <p className="text-blue-300 text-xs mt-0.5">
            Paste charter periods from your broker portal, compare against Firestore, then link or import.
          </p>
        </div>

        {/* Input panel */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-5 space-y-4">
          <div>
            <label className="text-blue-400 text-xs block mb-1">
              Broker reference URL <span className="text-blue-600">(stored on each charter)</span>
            </label>
            <input
              type="text"
              value={brokerRef}
              onChange={e => setBrokerRef(e.target.value)}
              placeholder="e.g. https://cyaeb.com/2626/pbpb/xrn/10571/"
              className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 placeholder:text-blue-400/40 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-blue-400 text-xs block mb-1">
              Paste broker data
            </label>
            <textarea
              value={brokerRaw}
              onChange={e => setBrokerRaw(e.target.value)}
              rows={10}
              placeholder={
                'Start Date:Jun 06, 2026\nEnd Date:Jun 13, 2026\nBooked: Athens, Greece to Athens, Greece\n' +
                'Start Date:Jun 21, 2026\nEnd Date:Jun 28, 2026\nHold: Mykonos, Greece to Syros\n...'
              }
              className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 font-mono placeholder:text-blue-400/20 focus:outline-none focus:border-blue-400 resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleParse}
              disabled={!brokerRaw.trim()}
              className="px-4 py-2 bg-blue-600/60 hover:bg-blue-500/80 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              Parse &amp; Compare
            </button>
            {parsedPeriods.length > 0 && (
              <span className="text-blue-400 text-xs">
                {parsedPeriods.length} periods — {reconcileDone.size} reconciled
              </span>
            )}
          </div>
        </div>

        {/* Field mapping hint */}
        <details className="text-xs text-blue-400">
          <summary className="cursor-pointer hover:text-blue-200 transition-colors select-none">
            Where to find these fields on cyaeb.com
          </summary>
          <div className="mt-2 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-3 py-2 text-left text-blue-300">Form field</th>
                  <th className="px-3 py-2 text-left text-blue-300">cyaeb.com location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['Embarkation', 'Charter period — embarkation port'],
                  ['Disembarkation', 'Charter period — disembarkation port'],
                  ['Start date', 'Charter period — embarkation date'],
                  ['End date', 'Charter period — disembarkation date'],
                  ['Status (Booked)', 'Confirmed charter → saved as Confirmed'],
                  ['Status (Hold)', 'Option / hold → saved as Broker Request'],
                ].map(([field, loc]) => (
                  <tr key={field} className="bg-white/5">
                    <td className="px-3 py-1.5 text-white font-medium">{field}</td>
                    <td className="px-3 py-1.5 text-blue-300">{loc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* Parsed results */}
        {loading && <p className="text-blue-300 text-sm animate-pulse">Loading Firestore charters…</p>}

        {!loading && parsedPeriods.length > 0 && (
          <div className="space-y-3">
            {parsedPeriods.map((period, idx) => {
              const matches = findOverlappingCharters(charters, period.startDate, period.endDate);
              const done = reconcileDone.has(idx);
              const busy = reconcileLoading === idx;

              return (
                <div
                  key={idx}
                  className={`border rounded-xl p-4 space-y-3 transition-colors ${
                    done
                      ? 'border-emerald-500/40 bg-emerald-900/10 opacity-60'
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  {/* Period header */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      period.brokerStatus === 'Booked'
                        ? 'bg-emerald-500/30 text-emerald-200'
                        : 'bg-amber-500/30 text-amber-200'
                    }`}>
                      {period.brokerStatus}
                    </span>
                    <span className="text-white text-sm font-medium">
                      {period.startDate} → {period.endDate}
                    </span>
                    <span className="text-blue-300 text-xs">{period.from} → {period.to}</span>
                    {done && <span className="text-emerald-400 text-xs ml-auto">✓ Reconciled</span>}
                  </div>

                  {!done && (
                    <>
                      {matches.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide">
                            {matches.length} overlapping charter{matches.length > 1 ? 's' : ''} in Firestore
                          </p>
                          {matches.map(c => (
                            <div
                              key={c.id}
                              className="flex items-center justify-between gap-3 bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${STATUS_BADGE[c.status]}`}>
                                    {CHARTER_STATUS_LABEL[c.status]}
                                  </span>
                                  <span className="text-white text-xs font-medium">
                                    {c.name ?? <span className="text-blue-500 italic">No name</span>}
                                  </span>
                                </div>
                                <div className="text-blue-400 text-xs mt-0.5">
                                  {c.startDate} → {c.endDate}
                                  {c.externalRef && (
                                    <span className="ml-2 text-emerald-400">already linked</span>
                                  )}
                                </div>
                              </div>
                              <button
                                disabled={busy}
                                onClick={() => handleLinkCharter(idx, c.id, period)}
                                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-sky-600/50 hover:bg-sky-500/70 text-white rounded-lg transition-colors disabled:opacity-50"
                              >
                                {busy ? '…' : 'Link'}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-400 text-xs italic">
                          No overlapping charters found in Firestore.
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-1 border-t border-white/10">
                        <span className="text-blue-400 text-xs flex-1">
                          Creates a new{' '}
                          <span className="font-semibold text-white">
                            {CHARTER_STATUS_LABEL[mapBrokerStatus(period.brokerStatus)]}
                          </span>{' '}
                          charter for these dates.
                        </span>
                        <button
                          disabled={busy}
                          onClick={() => handleCreateFromBroker(idx, period)}
                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-blue-600/50 hover:bg-blue-500/70 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {busy ? '…' : '+ Create new'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
