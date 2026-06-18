'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import {
  getClientPreparation,
  getCharterByClientSpaceToken,
  CHECKLIST_CATEGORIES,
  type ClientPreparation,
} from '../../../../lib/clientSpace';
import type { Charter } from '../../../../lib/availability';
import { getMarinaById } from '../../../marinas-data';
import { CONTACT } from '../../../config/contact';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function nightCount(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}

const SODA_TYPES = [
  'Coke 0.5 l', 'Diet Coke 0.5 l', 'Sprite 0.5 l', 'Pepsi 0.5 l',
  'Orange Juice 1.0 l', 'Apple Juice 1.0 l', 'Cranberry Juice 1.0 l',
  'Tonic Water 1.5 l', 'Tomato Juice 1.0 l', 'Water Still 0.5 l', 'Water Sparkling 0.5 l',
  'Others',
];
const WINE_TYPES = ['White Wine', 'Red Wine', 'Rosé Wine', 'Champagne / Sparkling'];
const SPIRIT_TYPES = [
  'Vodka', 'Gin', 'Rum', 'Whisky / Scotch', 'Tequila',
  'Beer (local)', 'Beer (imported)', 'Liqueurs',
];
const FOOD_CATEGORIES = ['Seafood', 'Fish', 'Meat', 'Fruit', 'Vegetables', 'Dairy', 'Other'] as const;
const CUISINE_TYPES = ['Greek', 'Italian', 'French', 'Asian', 'Fusion', 'Mediterranean', 'Other'] as const;
const BREAKFAST_STYLE_LABELS: Record<string, string> = {
  light: 'Light / Cold',
  american: 'American (pancakes, muffins)',
  full: 'Full Cooked (eggs, bacon, sausage)',
};

// ---------------------------------------------------------------------------
// Print styles (injected as a <style> tag, only active on screen + print)
// ---------------------------------------------------------------------------

const PRINT_STYLES = `
  @media print {
    .no-print { display: none !important; }
    .print-page-break { page-break-before: always; }
    body { background: white !important; color: #1a1a2e !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    .summary-header {
      background: #27368B !important;
      color: white !important;
      padding: 1.5rem 2rem !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: flex-start !important;
    }
    .summary-section {
      border: 1px solid #e2e8f0 !important;
      border-radius: 0 !important;
      margin-bottom: 0 !important;
      page-break-inside: avoid;
    }
    .summary-section-title {
      background: #27368B !important;
      color: white !important;
      font-weight: 700;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.5rem 1rem;
    }
    .summary-subsection-title {
      background: #1F8FCA !important;
      color: white !important;
    }
    .summary-footer {
      border-top: 2px solid #27368B !important;
      padding-top: 0.75rem !important;
      margin-top: 2rem !important;
      font-size: 0.7rem;
      color: #64748b;
    }
    .checklist-item-done { color: #16a34a !important; }
    .checklist-item-pending { color: #94a3b8 !important; }
  }

  @media screen {
    .summary-header {
      background: linear-gradient(135deg, #27368B 0%, #1F8FCA 100%);
    }
  }
`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="summary-section-title px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white" style={{ background: '#27368B' }}>
      {children}
    </div>
  );
}

function SubsectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="summary-subsection-title px-5 py-1.5 text-xs font-semibold text-white" style={{ background: '#1F8FCA' }}>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-4 py-1.5 border-b border-slate-100 last:border-0 px-5">
      <span className="text-xs font-semibold text-slate-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-800">{value}</span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value?: boolean | null }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex gap-4 py-1.5 border-b border-slate-100 last:border-0 px-5">
      <span className="text-xs font-semibold text-slate-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-800">{value ? 'Yes' : 'No'}</span>
    </div>
  );
}

function TagList({ label, values }: { label: string; values?: string[] }) {
  if (!values?.length) return null;
  return (
    <div className="flex gap-4 py-1.5 border-b border-slate-100 last:border-0 px-5 items-start">
      <span className="text-xs font-semibold text-slate-500 w-40 flex-shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1">
        {values.map(v => (
          <span key={v} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{v}</span>
        ))}
      </div>
    </div>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <p className="px-5 py-3 text-xs text-slate-400 italic">{message}</p>
  );
}

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

function CharterSection({ charter }: { charter: Charter }) {
  const delivery = getMarinaById(charter.deliveryPoint ?? '');
  const redelivery = getMarinaById(charter.redeliveryPoint ?? charter.deliveryPoint ?? '');
  const nights = charter.startDate && charter.endDate ? nightCount(charter.startDate, charter.endDate) : null;

  return (
    <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
      <SectionTitle>Charter Details</SectionTitle>
      <div className="py-1">
        <Row label="Client Name" value={charter.name} />
        <Row label="Email" value={charter.email} />
        <Row label="Phone" value={charter.phone} />
        <Row label="Vessel" value={charter.boat ?? 'BlueOne — Fountaine Pajot Aura 51'} />
        <Row label="Start Date" value={charter.startDate ? fmtDate(charter.startDate) : undefined} />
        <Row label="End Date" value={charter.endDate ? `${fmtDate(charter.endDate)}${nights ? ` (${nights} nights)` : ''}` : undefined} />
        <Row label="Guests" value={charter.passengers ? `${charter.passengers} passenger${charter.passengers > 1 ? 's' : ''}` : undefined} />
        <Row label="Embarkation" value={delivery?.name ?? charter.embarkationPoint} />
        <Row label="Disembarkation" value={redelivery?.name ?? delivery?.name} />
        <Row label="Experience Theme" value={charter.selectedTheme} />
        <Row label="Holiday Vision" value={charter.holidayDescription} />
      </div>
    </div>
  );
}

function CrewSection({ prep }: { prep: ClientPreparation }) {
  const crew = prep.crew ?? [];
  return (
    <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
      <SectionTitle>Crew / Passenger Details</SectionTitle>
      {crew.length === 0 ? (
        <EmptySection message="No crew details submitted yet." />
      ) : (
        crew.map((m, i) => (
          <div key={i}>
            <SubsectionTitle>Passenger {i + 1}{m.firstName || m.lastName ? ` — ${m.firstName} ${m.lastName}`.trimEnd() : ''}</SubsectionTitle>
            <div className="py-1">
              <Row label="Full Name" value={`${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || undefined} />
              <Row label="Gender" value={m.gender} />
              <Row label="Date of Birth" value={m.dateOfBirth ? fmtDate(m.dateOfBirth) : undefined} />
              <Row label="Nationality" value={m.nationality} />
              <Row label="Passport Number" value={m.passportNumber} />
              <Row label="Dietary Restrictions" value={m.dietaryRestrictions} />
              <Row label="Medical Notes" value={m.medicalNotes} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function TravelGroupBlock({ group, index, crew }: {
  group: import('../../../../lib/clientSpace').TravelGroup;
  index: number;
  crew: import('../../../../lib/clientSpace').CrewMember[];
}) {
  const hasArrival = group.arrivalDate || group.arrivalFlight;
  const hasDeparture = group.departureDate || group.departureFlight;
  const memberNames = group.memberIndices
    .map(i => {
      const m = crew[i];
      if (!m) return `Passenger ${i + 1}`;
      return [m.firstName, m.lastName].filter(Boolean).join(' ') || `Passenger ${i + 1}`;
    })
    .join(', ');

  return (
    <div>
      <SubsectionTitle>Group {index + 1}{memberNames ? ` — ${memberNames}` : ''}</SubsectionTitle>
      {hasArrival && (
        <div className="py-1">
          <div className="px-5 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">Arrival</div>
          <Row label="Arrival Date" value={group.arrivalDate ? fmtDate(group.arrivalDate) : undefined} />
          <Row label="Arrival Time" value={group.arrivalTime} />
          <Row label="Flight Number" value={group.arrivalFlight} />
          <BoolRow label="Staying at Hotel" value={group.stayingAtHotel} />
          <Row label="Hotel Name" value={group.hotelName} />
          <BoolRow label="Airport Transfer" value={group.transferFromAirport} />
        </div>
      )}
      {hasDeparture && (
        <div className="py-1">
          <div className="px-5 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">Departure</div>
          <Row label="Departure Date" value={group.departureDate ? fmtDate(group.departureDate) : undefined} />
          <Row label="Departure Time" value={group.departureTime} />
          <Row label="Flight Number" value={group.departureFlight} />
          <BoolRow label="Airport Transfer" value={group.transferToAirport} />
        </div>
      )}
      {!hasArrival && !hasDeparture && (
        <p className="px-5 py-2 text-xs text-slate-400 italic">No details entered for this group.</p>
      )}
    </div>
  );
}

function TravelSection({ prep }: { prep: ClientPreparation }) {
  const t = prep.travel ?? {};
  const groups = t.groups ?? [];

  // Groups mode (new UI)
  if (groups.length > 0) {
    const hasAnyGroupData = groups.some(g => g.arrivalDate || g.arrivalFlight || g.departureDate || g.departureFlight);
    return (
      <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
        <SectionTitle>Travel & Logistics</SectionTitle>
        {(t.embarkationPoint || t.disembarkationPoint) && (
          <div className="grid grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
            {t.embarkationPoint && (
              <div className="bg-white px-4 py-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Embarkation</p>
                <p className="text-xs text-slate-700 mt-0.5">{t.embarkationPoint}</p>
              </div>
            )}
            {t.disembarkationPoint && (
              <div className="bg-white px-4 py-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Disembarkation</p>
                <p className="text-xs text-slate-700 mt-0.5">{t.disembarkationPoint}</p>
              </div>
            )}
          </div>
        )}
        {!hasAnyGroupData ? (
          <EmptySection message="No travel details submitted yet." />
        ) : (
          groups.map((g, i) => (
            <TravelGroupBlock key={g.id} group={g} index={i} crew={prep.crew ?? []} />
          ))
        )}
      </div>
    );
  }

  // Legacy flat-field fallback
  const hasArrival = t.arrivalDate || t.arrivalFlight;
  const hasDeparture = t.departureDate || t.departureFlight;
  const hasAny = hasArrival || hasDeparture || t.stayingAtHotel != null || t.transferFromAirport != null;

  return (
    <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
      <SectionTitle>Travel & Logistics</SectionTitle>
      {!hasAny ? (
        <EmptySection message="No travel details submitted yet." />
      ) : (
        <>
          {hasArrival && (
            <>
              <SubsectionTitle>Arrival</SubsectionTitle>
              <div className="py-1">
                <Row label="Arrival Date" value={t.arrivalDate ? fmtDate(t.arrivalDate) : undefined} />
                <Row label="Arrival Time" value={t.arrivalTime} />
                <Row label="Flight Number" value={t.arrivalFlight} />
                <BoolRow label="Staying at Hotel" value={t.stayingAtHotel} />
                <Row label="Hotel Name" value={t.hotelName} />
                <BoolRow label="Airport Transfer Needed" value={t.transferFromAirport} />
              </div>
            </>
          )}
          {hasDeparture && (
            <>
              <SubsectionTitle>Departure</SubsectionTitle>
              <div className="py-1">
                <Row label="Departure Date" value={t.departureDate ? fmtDate(t.departureDate) : undefined} />
                <Row label="Departure Time" value={t.departureTime} />
                <Row label="Flight Number" value={t.departureFlight} />
                <BoolRow label="Airport Transfer Needed" value={t.transferToAirport} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ActivitiesSection({ prep }: { prep: ClientPreparation }) {
  const a = prep.activities ?? {};
  const groupStyleLabel = a.groupStyle === 'active' ? 'Active & on the go' : a.groupStyle === 'relaxed' ? 'Relaxed & laid-back' : a.groupStyle === 'combination' ? 'A bit of both' : undefined;

  return (
    <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
      <SectionTitle>Activities & Health</SectionTitle>
      <div className="py-1">
        <Row label="Group Style" value={groupStyleLabel} />
        <Row label="Specific Places" value={a.specificPlaces} />
        <TagList label="Activities" values={a.activities} />
        <Row label="Medical Information" value={a.healthNotes} />
        <Row label="Sailing Experience" value={a.sailingExperience} />
        {!groupStyleLabel && !a.specificPlaces && !a.activities?.length && !a.healthNotes && !a.sailingExperience && (
          <EmptySection message="No activity or health details submitted yet." />
        )}
      </div>
    </div>
  );
}

function FoodSection({ prep }: { prep: ClientPreparation }) {
  const f = prep.food ?? {};
  const hasFoodData = FOOD_CATEGORIES.some(cat => {
    const key = cat.toLowerCase() as keyof typeof f;
    const catData = f[key] as { likes?: string; dislikes?: string; allergies?: string } | undefined;
    return catData?.likes || catData?.dislikes || catData?.allergies;
  });
  const hasBreakfast = f.breakfastStyle?.length || f.breakfastItems?.length;
  const hasMeals = f.lunchStyle || f.dinnerStyle;

  return (
    <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
      <SectionTitle>Food Preferences</SectionTitle>

      {hasFoodData && (
        <>
          <SubsectionTitle>Food Categories</SubsectionTitle>
          <div className="py-1">
            {/* Desktop: 4-column grid */}
            <div className="hidden sm:grid grid-cols-4 gap-0 px-5 py-1 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Likes</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Dislikes</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Allergies</span>
            </div>
            {FOOD_CATEGORIES.map(cat => {
              const key = cat.toLowerCase() as keyof typeof f;
              const catData = f[key] as { likes?: string; dislikes?: string; allergies?: string } | undefined;
              if (!catData?.likes && !catData?.dislikes && !catData?.allergies) return null;
              return (
                <div key={cat} className="border-b border-slate-100 last:border-0">
                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-4 gap-0 px-5 py-1.5">
                    <span className="text-xs font-semibold text-slate-700">{cat}</span>
                    <span className="text-xs text-slate-600">{catData?.likes || '—'}</span>
                    <span className="text-xs text-slate-600">{catData?.dislikes || '—'}</span>
                    <span className="text-xs text-slate-600">{catData?.allergies || '—'}</span>
                  </div>
                  {/* Mobile: stacked */}
                  <div className="sm:hidden px-5 py-2 space-y-0.5">
                    <p className="text-xs font-semibold text-slate-700">{cat}</p>
                    {catData?.likes && <p className="text-xs text-slate-600"><span className="text-slate-400">Likes: </span>{catData.likes}</p>}
                    {catData?.dislikes && <p className="text-xs text-slate-600"><span className="text-slate-400">Dislikes: </span>{catData.dislikes}</p>}
                    {catData?.allergies && <p className="text-xs text-red-600 font-medium"><span className="text-slate-400">Allergies: </span>{catData.allergies}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {hasBreakfast && (
        <>
          <SubsectionTitle>Breakfast</SubsectionTitle>
          <div className="py-1">
            {f.breakfastStyle?.length ? (
              <TagList label="Style" values={f.breakfastStyle.map(s => BREAKFAST_STYLE_LABELS[s] ?? s)} />
            ) : null}
            <TagList label="Items" values={f.breakfastItems} />
          </div>
        </>
      )}

      {hasMeals && (
        <>
          <SubsectionTitle>Lunch & Dinner</SubsectionTitle>
          <div className="py-1">
            <Row label="Lunch Style" value={f.lunchStyle} />
            <BoolRow label="Lunch Dessert" value={f.lunchDessert} />
            <Row label="Lunch Snacks" value={f.lunchSnacks} />
            <Row label="Dinner Style" value={f.dinnerStyle} />
            <BoolRow label="Dinner Dessert" value={f.dinnerDessert} />
          </div>
        </>
      )}

      {f.cuisineRatings && Object.keys(f.cuisineRatings).length > 0 && (
        <>
          <SubsectionTitle>Cuisine Preferences</SubsectionTitle>
          <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
            {CUISINE_TYPES.map(c => {
              const r = f.cuisineRatings?.[c];
              if (!r) return null;
              return (
                <div key={c} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600 flex-shrink-0">{c}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <span key={n} className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${n <= r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'}`}>{n}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!hasFoodData && !hasBreakfast && !hasMeals && !(f.cuisineRatings && Object.keys(f.cuisineRatings).length > 0) && (
        <EmptySection message="No food preferences submitted yet." />
      )}
    </div>
  );
}

function BeveragesSection({ prep }: { prep: ClientPreparation }) {
  const b = prep.beverages ?? {};

  const allTypes = [
    { types: SODA_TYPES, group: 'sodas' as const, label: 'Sodas, Juices & Water' },
    { types: WINE_TYPES, group: 'wines' as const, label: 'Wines & Sparkling' },
    { types: SPIRIT_TYPES, group: 'spirits' as const, label: 'Spirits & Beer' },
  ];

  const hasBarData = allTypes.some(({ types, group }) =>
    types.some(t => {
      const item = (b[group] ?? {})[t];
      return item && (item.qty || item.preferredBrand);
    })
  );

  const hasWarm = b.warmBeverages?.length || b.warmBeveragesOther;

  return (
    <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
      <SectionTitle>Beverages & Bar</SectionTitle>

      {hasWarm && (
        <>
          <SubsectionTitle>Hot Beverages</SubsectionTitle>
          <div className="py-1">
            <TagList label="Selections" values={b.warmBeverages} />
            <Row label="Other" value={b.warmBeveragesOther} />
          </div>
        </>
      )}

      {hasBarData && allTypes.map(({ types, group, label }) => {
        const rows = types.filter(t => {
          const item = (b[group] ?? {})[t];
          return item && (item.qty || item.preferredBrand);
        });
        if (!rows.length) return null;
        return (
          <div key={group}>
            <SubsectionTitle>{label}</SubsectionTitle>
            <div className="py-1">
              {/* Desktop: 3-column grid */}
              <div className="hidden sm:grid grid-cols-3 px-5 py-1 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Item</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Qty</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Brand / Notes</span>
              </div>
              {rows.map(t => {
                const item = (b[group] ?? {})[t] ?? {};
                const brand = item.preferredBrand || item.remarks;
                return (
                  <div key={t} className="border-b border-slate-100 last:border-0">
                    {/* Desktop row */}
                    <div className="hidden sm:grid grid-cols-3 px-5 py-1.5">
                      <span className="text-xs text-slate-700">{t}</span>
                      <span className="text-xs text-slate-600">{item.qty ?? '—'}</span>
                      <span className="text-xs text-slate-600">{brand || '—'}</span>
                    </div>
                    {/* Mobile: compact inline */}
                    <div className="sm:hidden flex items-baseline justify-between px-5 py-1.5 gap-3">
                      <span className="text-xs text-slate-700 flex-1">{t}</span>
                      <span className="text-xs text-slate-500 flex-shrink-0">×{item.qty ?? '—'}</span>
                      {brand && <span className="text-xs text-slate-400 flex-shrink-0 truncate max-w-[100px]">{brand}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!hasWarm && !hasBarData && (
        <EmptySection message="No beverage preferences submitted yet." />
      )}
    </div>
  );
}

function SpecialSection({ prep }: { prep: ClientPreparation }) {
  const s = prep.special ?? {};
  const hasContact = s.emergencyContactName || s.emergencyContactPhone;
  const hasAny = s.celebration || s.musicAtmosphere || s.petsOnBoard || s.extraNotes || hasContact;

  return (
    <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
      <SectionTitle>Special Requests</SectionTitle>
      {!hasAny ? (
        <EmptySection message="No special requests submitted yet." />
      ) : (
        <div className="py-1">
          <Row label="Special Occasion" value={s.celebration} />
          <Row label="Music Atmosphere" value={s.musicAtmosphere} />
          <Row label="Pets on Board" value={s.petsOnBoard} />
          {hasContact && (
            <Row
              label="Emergency Contact"
              value={[s.emergencyContactName, s.emergencyContactPhone, s.emergencyContactRelation].filter(Boolean).join(' · ')}
            />
          )}
          <Row label="Additional Notes" value={s.extraNotes} />
        </div>
      )}
    </div>
  );
}

function ChecklistSection({ prep }: { prep: ClientPreparation }) {
  const checklist = prep.checklist ?? {};
  const allItems = CHECKLIST_CATEGORIES.flatMap(c => c.items);
  const doneCount = allItems.filter(i => checklist[i.id]).length;

  return (
    <div className="summary-section border border-slate-200 rounded-xl overflow-hidden mb-4">
      <SectionTitle>Pre-Departure Checklist — {doneCount} / {allItems.length} completed</SectionTitle>
      {CHECKLIST_CATEGORIES.map(cat => (
        <div key={cat.id}>
          <SubsectionTitle>{cat.label}</SubsectionTitle>
          <div className="py-1 px-5 space-y-1">
            {cat.items.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 py-0.5">
                <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                  checklist[item.id]
                    ? 'border-emerald-500 bg-emerald-500 text-white checklist-item-done'
                    : 'border-slate-300 checklist-item-pending'
                }`}>
                  {checklist[item.id] ? '✓' : ''}
                </span>
                <span className={`text-xs ${checklist[item.id] ? 'text-emerald-700 line-through' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props { token: string }

export default function SummaryClient({ token }: Props) {
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
        <p className="text-slate-400 text-sm animate-pulse">Loading summary…</p>
      </div>
    );
  }

  if (notFound || !charter || !prep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 text-sm">Summary not found.</p>
          <p className="text-slate-400 text-xs mt-1">
            Contact us at <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a>
          </p>
        </div>
      </div>
    );
  }

  const printedAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div className="min-h-screen bg-slate-50">

        {/* Screen header */}
        <div className="summary-header no-print sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
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
              <p className="text-white font-bold text-sm sm:text-base leading-tight">Preference Summary</p>
              {charter.name && <p className="text-blue-200 text-[10px] sm:text-xs truncate">{charter.name} · {charter.startDate ? fmtDate(charter.startDate) : '—'}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Back link — icon-only on mobile, full text on sm+ */}
            <a
              href={`/client-space/${token}`}
              className="no-print flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-xs font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors"
              aria-label="Edit Preferences"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Edit Preferences</span>
            </a>
            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold bg-white text-blue-800 hover:bg-blue-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden xs:inline sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>

        {/* Print-only header (hidden on screen) */}
        <div className="hidden print:block summary-header px-8 py-5 mb-6" style={{ background: '#27368B' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-bold text-lg">BlueOne Yacht Charter</p>
              <p className="text-blue-200 text-sm">Holiday Preference Summary</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-sm">{charter.name ?? ''}</p>
              <p className="text-blue-200 text-xs">
                {charter.startDate ? fmtDate(charter.startDate) : '—'}
                {charter.endDate ? ` – ${fmtDate(charter.endDate)}` : ''}
              </p>
              <p className="text-blue-300 text-xs mt-0.5">Printed: {printedAt}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">

          <CharterSection charter={charter} />
          <CrewSection prep={prep} />
          <TravelSection prep={prep} />
          <ActivitiesSection prep={prep} />
          <FoodSection prep={prep} />
          <BeveragesSection prep={prep} />
          <SpecialSection prep={prep} />
          <ChecklistSection prep={prep} />

          {/* Footer */}
          <div className="summary-footer pt-6 border-t border-slate-200 text-center">
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
