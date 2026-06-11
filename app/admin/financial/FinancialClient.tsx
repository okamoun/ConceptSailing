'use client';

import { useEffect, useState } from 'react';
import { getAllCharters } from '@/lib/availability';
import {
  buildYearSummary,
  getPricingConfig,
  savePricingConfig,
  DEFAULT_PRICING,
  type PricingConfig,
  type YearSummary,
  type CharterFinancials,
} from '@/lib/financial';
import { useAdminAuth } from '../AdminAuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SEASON_COLORS: Record<string, string> = {
  high: 'bg-emerald-500',
  mid:  'bg-amber-400',
  low:  'bg-sky-400',
};

const SEASON_TEXT: Record<string, string> = {
  high: 'text-emerald-300',
  mid:  'text-amber-300',
  low:  'text-sky-300',
};

function fmt(n: number): string {
  return '€' + Math.round(n).toLocaleString('en-EU');
}

function fmtWeeks(nights: number): string {
  const w = nights / 7;
  return w % 1 === 0 ? `${w}w` : `${w.toFixed(1)}w`;
}

function StatCard({ label, value, sub, muted }: { label: string; value: string; sub?: string; muted?: boolean }) {
  return (
    <div className={`backdrop-blur-sm border rounded-xl px-4 py-3 text-center ${muted ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
      <div className={`font-bold text-xl leading-tight ${muted ? 'text-blue-300' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-blue-300 text-xs mt-0.5">{sub}</div>}
      <div className="text-blue-200 text-xs mt-1">{label}</div>
    </div>
  );
}

function CharterRow({ cf }: { cf: CharterFinancials }) {
  const start = new Date(`${cf.charter.startDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const end   = new Date(`${cf.charter.endDate  }T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const isActual = cf.source === 'actual';
  const hasBroker = cf.brokerAmount > 0;
  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
      <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{cf.charter.name || '—'}</td>
      <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{start} → {end}</td>
      <td className="px-3 py-2 text-blue-200 text-center">{cf.nights}</td>
      <td className="px-3 py-2 whitespace-nowrap">
        <span className={`text-xs font-semibold uppercase ${SEASON_TEXT[cf.tier]}`}>{cf.tier}</span>
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <span className={isActual ? 'text-white font-semibold' : 'text-blue-200'}>{fmt(cf.charterFee)}</span>
        {isActual
          ? <span className="ml-1 text-xs text-emerald-400">contract</span>
          : <span className="ml-1 text-xs text-blue-400">est.</span>
        }
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        {hasBroker
          ? <span className="text-orange-300">−{fmt(cf.brokerAmount)}</span>
          : <span className="text-blue-400">—</span>
        }
        {hasBroker && cf.charter.brokerCommission != null && (
          <span className="ml-1 text-xs text-blue-400">{cf.charter.brokerCommission}%</span>
        )}
      </td>
      <td className="px-3 py-2 text-emerald-300 font-semibold text-right whitespace-nowrap">{fmt(cf.netRevenue)}</td>
      <td className="px-3 py-2 text-blue-300 text-right whitespace-nowrap">{fmt(cf.apa)}</td>
      <td className="px-3 py-2 text-blue-200 text-right whitespace-nowrap">{fmt(cf.vat)}</td>
      <td className="px-3 py-2 text-blue-200 text-right whitespace-nowrap">
        {cf.relocation > 0 ? fmt(cf.relocation) : '—'}
      </td>
      <td className="px-3 py-2 text-white font-semibold text-right whitespace-nowrap">{fmt(cf.totalInvoice)}</td>
    </tr>
  );
}

const TABLE_HEADERS = [
  'Client', 'Dates', 'Nights', 'Season',
  'Charter Fee', 'Broker', 'Net Revenue',
  'APA', 'VAT', 'Relocation', 'Client Invoice',
];

export default function FinancialClient() {
  const { allowedPages } = useAdminAuth();
  const [loading, setLoading]             = useState(true);
  const [summary, setSummary]             = useState<YearSummary | null>(null);
  const [pricing, setPricing]             = useState<PricingConfig>(DEFAULT_PRICING);
  const [year, setYear]                   = useState(new Date().getFullYear());
  const [showPipeline, setShowPipeline]   = useState(false);
  const [editPricing, setEditPricing]     = useState(false);
  const [draftPricing, setDraftPricing]   = useState<PricingConfig>(DEFAULT_PRICING);
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingMsg, setPricingMsg]       = useState('');

  if (!allowedPages.includes('/admin/financial')) {
    return (
      <main className="px-4 py-10 text-center">
        <p className="text-red-300 text-sm">Access denied.</p>
      </main>
    );
  }

  const currentYear = new Date().getFullYear();
  const todayStr = new Date().toISOString().slice(0, 10);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setLoading(true);
    Promise.all([getAllCharters(), getPricingConfig()])
      .then(([charters, cfg]) => {
        setPricing(cfg);
        setDraftPricing(cfg);
        setSummary(buildYearSummary(charters, year, cfg, year === currentYear ? todayStr : undefined));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSavePricing() {
    setSavingPricing(true);
    setPricingMsg('');
    try {
      await savePricingConfig(draftPricing);
      setPricing(draftPricing);
      if (summary) {
        const allCharters = await getAllCharters();
        setSummary(buildYearSummary(allCharters, year, draftPricing, year === currentYear ? todayStr : undefined));
      }
      setPricingMsg('Pricing saved.');
      setEditPricing(false);
      setTimeout(() => setPricingMsg(''), 3000);
    } catch {
      setPricingMsg('Failed to save pricing.');
    } finally {
      setSavingPricing(false);
    }
  }

  const maxMonthly = summary ? Math.max(...summary.monthlyRevenue, 1) : 1;

  const SEASON_CAP: Record<string, number> = { high: 8, mid: 8, low: 36 };
  const seasonNights: Record<string, number> = { high: 0, mid: 0, low: 0 };
  if (summary) {
    for (const cf of summary.confirmed) seasonNights[cf.tier] += cf.nights;
  }

  return (
    <main className="px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header + year selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Financial Planning</h1>
            <p className="text-blue-200 text-xs mt-0.5">Confirmed &amp; signed charters · APA is client provisioning and not included in revenue</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setYear(y => y - 1)} className="text-blue-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm">‹</button>
            <span className="text-white font-semibold text-lg w-16 text-center">{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="text-blue-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm">›</button>
          </div>
        </div>

        {loading ? (
          <p className="text-blue-200 text-sm animate-pulse">Loading…</p>
        ) : summary && (
          <>
            {/* KPI bar — 5 cards on md+, 2+3 on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard
                label="Net Revenue"
                value={fmt(summary.totalNetRevenue)}
                sub="after broker commissions"
              />
              <StatCard
                label="Broker Commissions"
                value={summary.totalBrokerCommission > 0 ? fmt(summary.totalBrokerCommission) : '—'}
                sub="deducted from charter fees"
                muted={summary.totalBrokerCommission === 0}
              />
              <StatCard
                label="APA Provisioning"
                value={fmt(summary.totalApa)}
                sub="client pass-through, not revenue"
                muted
              />
              <StatCard
                label="VAT Collected"
                value={fmt(summary.totalVat)}
                sub={`${pricing.vatPercent}% on charter fee`}
              />
              <StatCard
                label="Client Invoice Total"
                value={fmt(summary.totalInvoice)}
                sub={`${summary.confirmed.length} charter${summary.confirmed.length !== 1 ? 's' : ''} · ${fmtWeeks(summary.totalNights)}`}
              />
            </div>

            {/* Monthly net revenue bar chart */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-4">
              <h2 className="text-white font-semibold text-sm mb-1">Monthly Net Revenue</h2>
              <p className="text-blue-300 text-xs mb-4">Charter fee after broker commission · APA excluded</p>
              <div className="flex items-end gap-1 h-36">
                {MONTHS.map((m, i) => {
                  const rev = summary.monthlyRevenue[i];
                  const pct = rev > 0 ? Math.max((rev / maxMonthly) * 100, 4) : 0;
                  const month = i + 1;
                  const tier = month === 7 || month === 8 ? 'high' : month === 6 || month === 9 ? 'mid' : 'low';
                  return (
                    <div key={m} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end" style={{ height: '100px' }}>
                        {rev > 0 && (
                          <div
                            className={`w-full rounded-t-sm transition-all ${SEASON_COLORS[tier]}`}
                            style={{ height: `${pct}%` }}
                            title={fmt(rev)}
                          />
                        )}
                      </div>
                      <span className="text-blue-300 text-xs">{m}</span>
                      {rev > 0 && (
                        <span className={`text-xs font-medium ${SEASON_TEXT[tier]}`}>
                          {(rev / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 flex-wrap">
                {(['high','mid','low'] as const).map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-blue-200">
                    <span className={`w-2.5 h-2.5 rounded-sm ${SEASON_COLORS[t]}`} />
                    {t === 'high' ? 'High (Jul–Aug)' : t === 'mid' ? 'Mid (Jun, Sep)' : 'Low (other)'}
                  </span>
                ))}
              </div>
            </div>

            {/* Season utilization */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-4">
              <h2 className="text-white font-semibold text-sm mb-4">Season Utilization</h2>
              <div className="space-y-3">
                {(['high','mid','low'] as const).map(t => {
                  const bookedWeeks = seasonNights[t] / 7;
                  const capWeeks = SEASON_CAP[t];
                  const pct = Math.min((bookedWeeks / capWeeks) * 100, 100);
                  const netRev = summary.confirmed
                    .filter(cf => cf.tier === t)
                    .reduce((s, cf) => s + cf.netRevenue, 0);
                  return (
                    <div key={t}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-semibold uppercase ${SEASON_TEXT[t]}`}>
                          {t === 'high' ? 'High Season · Jul–Aug' : t === 'mid' ? 'Mid Season · Jun, Sep' : 'Low Season · other months'}
                        </span>
                        <span className="text-blue-200 text-xs">
                          {bookedWeeks.toFixed(1)}w / {capWeeks}w · {fmt(netRev)} net
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${SEASON_COLORS[t]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charter revenue table */}
            {summary.confirmed.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h2 className="text-white font-semibold text-sm">
                    Confirmed Charters
                    <span className="ml-2 text-blue-300 text-xs font-normal">confirmed + signed</span>
                  </h2>
                  <span className="text-xs text-blue-300">
                    <span className="text-emerald-400 font-medium">contract</span> = actual value ·{' '}
                    <span className="text-blue-400">est.</span> = rate × weeks ·{' '}
                    APA not counted in Net Revenue
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/20">
                          {TABLE_HEADERS.map(h => (
                            <th key={h} className="text-left text-blue-200 font-semibold px-3 py-2.5 whitespace-nowrap last:text-right">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {summary.confirmed.map((cf, i) => <CharterRow key={cf.charter.id ?? i} cf={cf} />)}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-white/20 bg-white/5">
                          <td colSpan={4} className="px-3 py-2.5 text-blue-200 text-xs font-semibold">Total</td>
                          <td className="px-3 py-2.5 text-white font-semibold text-right">{fmt(summary.totalCharterFee)}</td>
                          <td className="px-3 py-2.5 text-orange-300 font-semibold text-right">
                            {summary.totalBrokerCommission > 0 ? `−${fmt(summary.totalBrokerCommission)}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-emerald-300 font-bold text-right">{fmt(summary.totalNetRevenue)}</td>
                          <td className="px-3 py-2.5 text-blue-300 font-semibold text-right">{fmt(summary.totalApa)}</td>
                          <td className="px-3 py-2.5 text-white font-semibold text-right">{fmt(summary.totalVat)}</td>
                          <td className="px-3 py-2.5 text-white font-semibold text-right">{fmt(summary.totalRelocation)}</td>
                          <td className="px-3 py-2.5 text-white font-bold text-right">{fmt(summary.totalInvoice)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {summary.confirmed.length === 0 && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
                <p className="text-blue-200 text-sm">No confirmed or signed charters for {year}.</p>
              </div>
            )}

            {/* Pipeline toggle */}
            <section>
              <button
                onClick={() => setShowPipeline(p => !p)}
                className="flex items-center gap-2 text-blue-300 hover:text-white text-sm font-medium transition-colors"
              >
                <span className={`transition-transform ${showPipeline ? 'rotate-90' : ''}`}>›</span>
                Pipeline ({summary.pipeline.length})
                <span className="text-xs font-normal text-blue-400 ml-1">serious + broker requests — unconfirmed</span>
              </button>

              {showPipeline && summary.pipeline.length > 0 && (
                <div className="mt-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/20">
                          {TABLE_HEADERS.map(h => (
                            <th key={h} className="text-left text-blue-200 font-semibold px-3 py-2.5 whitespace-nowrap last:text-right">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {summary.pipeline.map((cf, i) => <CharterRow key={cf.charter.id ?? i} cf={cf} />)}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-white/20 bg-white/5">
                          <td colSpan={4} className="px-3 py-2.5 text-blue-200 text-xs font-semibold">Pipeline Total</td>
                          <td className="px-3 py-2.5 text-white font-semibold text-right">
                            {fmt(summary.pipeline.reduce((s, cf) => s + cf.charterFee, 0))}
                          </td>
                          <td className="px-3 py-2.5 text-orange-300 font-semibold text-right">
                            {summary.pipeline.some(cf => cf.brokerAmount > 0)
                              ? `−${fmt(summary.pipeline.reduce((s, cf) => s + cf.brokerAmount, 0))}`
                              : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-emerald-300 font-bold text-right">
                            {fmt(summary.pipeline.reduce((s, cf) => s + cf.netRevenue, 0))}
                          </td>
                          <td className="px-3 py-2.5 text-blue-300 font-semibold text-right">
                            {fmt(summary.pipeline.reduce((s, cf) => s + cf.apa, 0))}
                          </td>
                          <td className="px-3 py-2.5 text-white font-semibold text-right">
                            {fmt(summary.pipeline.reduce((s, cf) => s + cf.vat, 0))}
                          </td>
                          <td className="px-3 py-2.5 text-white font-semibold text-right">
                            {fmt(summary.pipeline.reduce((s, cf) => s + cf.relocation, 0))}
                          </td>
                          <td className="px-3 py-2.5 text-white font-bold text-right">
                            {fmt(summary.pipeline.reduce((s, cf) => s + cf.totalInvoice, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {showPipeline && summary.pipeline.length === 0 && (
                <p className="mt-2 text-blue-300 text-xs">No pipeline requests for {year}.</p>
              )}
            </section>

            {/* Pricing editor */}
            <section>
              <button
                onClick={() => { setEditPricing(p => !p); setDraftPricing(pricing); setPricingMsg(''); }}
                className="flex items-center gap-2 text-blue-300 hover:text-white text-sm font-medium transition-colors"
              >
                <span className={`transition-transform ${editPricing ? 'rotate-90' : ''}`}>›</span>
                Pricing Defaults
              </button>

              {editPricing && (
                <div className="mt-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 space-y-5">
                  <p className="text-blue-300 text-xs">These defaults apply when a booking has no per-charter overrides.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(
                      [
                        { key: 'highSeasonRate', label: 'High Season (€/week)', note: 'Jul–Aug' },
                        { key: 'midSeasonRate',  label: 'Mid Season (€/week)',  note: 'Jun, Sep' },
                        { key: 'lowSeasonRate',  label: 'Low Season (€/week)',  note: 'other months' },
                        { key: 'apaPercent',     label: 'APA (%)',              note: 'default provisioning %' },
                        { key: 'vatPercent',     label: 'VAT (%)',              note: 'on charter fee' },
                        { key: 'relocationFee',  label: 'Relocation (€)',       note: 'default off-base fee' },
                      ] as const
                    ).map(({ key, label, note }) => (
                      <div key={key}>
                        <label className="text-blue-200 text-xs font-medium block mb-1">
                          {label}
                          <span className="ml-1 text-blue-400 font-normal">· {note}</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={draftPricing[key]}
                          onChange={e => setDraftPricing(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-white/10 border border-white/25 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    ))}
                  </div>

                  {pricingMsg && (
                    <p className={`text-xs ${pricingMsg.startsWith('Failed') ? 'text-red-300' : 'text-green-300'}`}>
                      {pricingMsg}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSavePricing}
                      disabled={savingPricing}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                    >
                      {savingPricing ? 'Saving…' : 'Save Defaults'}
                    </button>
                    <button
                      onClick={() => setEditPricing(false)}
                      className="text-blue-300 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
