'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  getClientPreparation,
  getCharterByClientSpaceToken,
  buildCrewManifest,
  type ClientPreparation,
  type ManifestPeriod,
  type ManifestGuest,
} from '../../../../lib/clientSpace';
import type { Charter } from '../../../../lib/availability';
import { getMarinaById } from '../../../marinas-data';
import { CONTACT } from '../../../config/contact';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

function marinaName(id?: string): string | undefined {
  if (!id) return undefined;
  return getMarinaById(id)?.name ?? id;
}

function fullName(g: ManifestGuest): string {
  const name = [g.member.firstName, g.member.lastName].filter(Boolean).join(' ').trim();
  return name || `Passenger ${g.index + 1}`;
}

// ---------------------------------------------------------------------------
// Print styles
// ---------------------------------------------------------------------------

const PRINT_STYLES = `
  @media print {
    .no-print { display: none !important; }
    .manifest-page { page-break-before: always; }
    .manifest-page:first-of-type { page-break-before: avoid; }
    body { background: white !important; color: #1a1a2e !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    .manifest-section { page-break-inside: auto; }
    .manifest-passport { page-break-inside: avoid; }
    .manifest-title {
      background: #27368B !important;
      color: white !important;
    }
    .manifest-subtitle {
      background: #1F8FCA !important;
      color: white !important;
    }
    .manifest-footer {
      border-top: 2px solid #27368B !important;
      color: #64748b;
    }
  }

  @media screen {
    .manifest-header {
      background: linear-gradient(135deg, #27368B 0%, #1F8FCA 100%);
    }
  }
`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="manifest-title px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white" style={{ background: '#27368B' }}>
      {children}
    </div>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <div className="manifest-subtitle px-5 py-1.5 text-xs font-semibold text-white" style={{ background: '#1F8FCA' }}>
      {children}
    </div>
  );
}

function GuestTable({ guests }: { guests: ManifestGuest[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="px-3 py-2 font-bold text-slate-400 uppercase text-[10px] w-8">#</th>
            <th className="px-3 py-2 font-bold text-slate-400 uppercase text-[10px]">Full Name</th>
            <th className="px-3 py-2 font-bold text-slate-400 uppercase text-[10px]">Gender</th>
            <th className="px-3 py-2 font-bold text-slate-400 uppercase text-[10px]">Date of Birth</th>
            <th className="px-3 py-2 font-bold text-slate-400 uppercase text-[10px]">Nationality</th>
            <th className="px-3 py-2 font-bold text-slate-400 uppercase text-[10px]">Passport No.</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g, i) => (
            <tr key={g.index} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-2 text-slate-500">{i + 1}</td>
              <td className="px-3 py-2 text-slate-800 font-medium">{fullName(g)}</td>
              <td className="px-3 py-2 text-slate-600">{g.member.gender || '—'}</td>
              <td className="px-3 py-2 text-slate-600">{g.member.dateOfBirth ? fmtDate(g.member.dateOfBirth) : '—'}</td>
              <td className="px-3 py-2 text-slate-600">{g.member.nationality || '—'}</td>
              <td className="px-3 py-2 text-slate-600">{g.member.passportNumber || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PassportCopies({ guests }: { guests: ManifestGuest[] }) {
  const withPassport = guests.filter(g => g.member.passportImageUrl);

  return (
    <>
      <SubTitle>Passport Copies</SubTitle>
      {withPassport.length === 0 ? (
        <p className="px-5 py-3 text-xs text-slate-400 italic">No passport copies uploaded for this period.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-5 py-4">
          {withPassport.map(g => (
            <div key={g.index} className="manifest-passport border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-700">{fullName(g)}</p>
                {g.member.passportNumber && (
                  <p className="text-[10px] text-slate-400">Passport {g.member.passportNumber}</p>
                )}
              </div>
              <a href={g.member.passportImageUrl} target="_blank" rel="noopener noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.member.passportImageUrl}
                  alt={`Passport — ${fullName(g)}`}
                  className="w-full max-h-64 object-contain bg-slate-100"
                />
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PeriodPage({ charter, period, index, total }: {
  charter: Charter;
  period: ManifestPeriod;
  index: number;
  total: number;
}) {
  // Distinct embarkation / disembarkation points mentioned by this period's guests
  const embarks = [...new Set(period.guests.map(g => marinaName(g.embarkationPoint)).filter(Boolean))] as string[];
  const disembarks = [...new Set(period.guests.map(g => marinaName(g.disembarkationPoint)).filter(Boolean))] as string[];
  const embarkFallback = marinaName(charter.deliveryPoint ?? undefined);
  const disembarkFallback = marinaName(charter.redeliveryPoint ?? charter.deliveryPoint ?? undefined);

  return (
    <div className="manifest-page manifest-section border border-slate-200 rounded-xl overflow-hidden mb-6">
      <SectionTitle>
        {total > 1 ? `Leg ${index + 1} of ${total} · ` : ''}
        {fmtDate(period.startDate)} – {fmtDate(period.endDate)}
      </SectionTitle>

      <div className="px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 border-b border-slate-100">
        <div className="flex gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase w-24 flex-shrink-0">Vessel</span>
          <span className="text-xs text-slate-800">{charter.boat ?? 'BlueOne — Fountaine Pajot Aura 51'}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase w-24 flex-shrink-0">Guests aboard</span>
          <span className="text-xs text-slate-800">{period.guests.length}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase w-24 flex-shrink-0">Embarkation</span>
          <span className="text-xs text-slate-800">{(embarks.length ? embarks : embarkFallback ? [embarkFallback] : ['—']).join(', ')}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase w-24 flex-shrink-0">Disembarkation</span>
          <span className="text-xs text-slate-800">{(disembarks.length ? disembarks : disembarkFallback ? [disembarkFallback] : ['—']).join(', ')}</span>
        </div>
      </div>

      <SubTitle>Passengers</SubTitle>
      <div className="py-1">
        <GuestTable guests={period.guests} />
      </div>

      <PassportCopies guests={period.guests} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props { token: string }

export default function ManifestClient({ token }: Props) {
  const [charter, setCharter] = useState<Charter | null>(null);
  const [prep, setPrep] = useState<ClientPreparation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      getCharterByClientSpaceToken(token),
      getClientPreparation(token),
    ])
      .then(([c, p]) => {
        if (!c || !p) { setNotFound(true); return; }
        setCharter(c);
        setPrep(p);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm animate-pulse">Loading crew manifest…</p>
      </div>
    );
  }

  if (notFound || !charter || !prep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 text-sm">Manifest not found.</p>
          <p className="text-slate-400 text-xs mt-1">
            Contact us at <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a>
          </p>
        </div>
      </div>
    );
  }

  const periods = buildCrewManifest(charter, prep);
  const hasCrew = (prep.crew ?? []).length > 0;
  const printedAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div className="min-h-screen bg-slate-50">
        {/* Screen header */}
        <div className="manifest-header no-print sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Image
              src="/images/boats/blueone/logo_blueone.png"
              alt="BlueOne"
              width={72}
              height={28}
              className="object-contain flex-shrink-0 sm:w-[100px] sm:h-[40px]"
              unoptimized
            />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm sm:text-base leading-tight">Crew Manifest</p>
              {charter.name && <p className="text-blue-200 text-[10px] sm:text-xs truncate">{charter.name} · {fmtDate(charter.startDate)}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`/client-space/${token}/summary`}
              className="no-print flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-xs font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors"
              aria-label="Back to Summary"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Summary</span>
            </a>
            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold bg-white text-blue-800 hover:bg-blue-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block manifest-header px-8 py-5 mb-6" style={{ background: '#27368B' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-bold text-lg">BlueOne Yacht Charter</p>
              <p className="text-blue-200 text-sm">Crew Manifest</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-sm">{charter.name ?? ''}</p>
              <p className="text-blue-200 text-xs">
                {fmtDate(charter.startDate)}{charter.endDate ? ` – ${fmtDate(charter.endDate)}` : ''}
              </p>
              <p className="text-blue-300 text-xs mt-0.5">Printed: {printedAt}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {!hasCrew ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <SectionTitle>Crew Manifest</SectionTitle>
              <p className="px-5 py-6 text-sm text-slate-400 italic text-center">
                No crew details have been submitted yet. Once the client completes the crew step, the manifest will populate here.
              </p>
            </div>
          ) : (
            periods.map((period, i) => (
              <PeriodPage
                key={`${period.startDate ?? 'x'}-${period.endDate ?? 'x'}-${i}`}
                charter={charter}
                period={period}
                index={i}
                total={periods.length}
              />
            ))
          )}

          {/* Footer */}
          <div className="manifest-footer pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              BlueOne Luxury Yacht Charters · {CONTACT.email} · Generated {printedAt}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              This document is confidential and intended solely for BlueOne crew and charter management.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
