import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { DEFAULT_MARINA_ID } from '@/app/marinas-data';
import type { Charter } from './availability';

export interface PricingConfig {
  highSeasonRate: number;  // € per week, July–August
  midSeasonRate:  number;  // € per week, June + September
  lowSeasonRate:  number;  // € per week, all other months
  apaPercent:     number;  // % of charter fee (default when apaAmount not set on charter)
  vatPercent:     number;  // % of charter fee
  relocationFee:  number;  // € flat when delivery/redelivery ≠ base marina (default)
}

export const DEFAULT_PRICING: PricingConfig = {
  highSeasonRate: 24000,
  midSeasonRate:  21000,
  lowSeasonRate:  18000,
  apaPercent:     25,
  vatPercent:     13,
  relocationFee:  1000,
};

export type SeasonTier = 'high' | 'mid' | 'low';

export function getSeasonTier(startDate: string): SeasonTier {
  const month = parseInt(startDate.slice(5, 7), 10);
  if (month === 7 || month === 8) return 'high';
  if (month === 6 || month === 9) return 'mid';
  return 'low';
}

export interface CharterFinancials {
  charter:      Charter;
  nights:       number;
  weeks:        number;        // nights / 7 (MYBA convention)
  tier:         SeasonTier;
  baseRate:     number;        // standard weekly rate for tier
  charterFee:   number;        // actual fee: charter.contractValue ?? baseRate * weeks
  brokerAmount: number;        // charterFee × brokerCommission% / 100
  netRevenue:   number;        // charterFee − brokerAmount (operator income)
  apa:          number;        // APA collected from client — pass-through, NOT operator revenue
  vat:          number;        // VAT on charter fee
  relocation:   number;        // relocation fee
  totalInvoice: number;        // full client invoice: charterFee + apa + vat + relocation
  source:       'actual' | 'computed'; // 'actual' when contractValue is set on charter
}

export function computeCharterFinancials(
  charter: Charter,
  pricing: PricingConfig,
): CharterFinancials {
  const nights = Math.round(
    (new Date(charter.endDate).getTime() - new Date(charter.startDate).getTime()) / 86400000,
  );
  const weeks = nights / 7;
  const tier = getSeasonTier(charter.startDate);

  const rateMap: Record<SeasonTier, number> = {
    high: pricing.highSeasonRate,
    mid:  pricing.midSeasonRate,
    low:  pricing.lowSeasonRate,
  };
  const baseRate = rateMap[tier];
  const source: 'actual' | 'computed' = charter.contractValue != null ? 'actual' : 'computed';
  const charterFee = charter.contractValue != null ? charter.contractValue : baseRate * weeks;

  const brokerPct  = charter.brokerCommission ?? 0;
  const brokerAmount = charterFee * brokerPct / 100;
  const netRevenue = charterFee - brokerAmount;

  // APA: per-booking override takes priority over the default percentage
  const apa = charter.apaAmount != null
    ? charter.apaAmount
    : charterFee * pricing.apaPercent / 100;

  const vat = charterFee * pricing.vatPercent / 100;

  // Relocation: per-booking override, then config default, then 0 if at base marina
  let relocation: number;
  if (charter.relocationAmount != null) {
    relocation = charter.relocationAmount;
  } else {
    const atBase =
      (!charter.deliveryPoint   || charter.deliveryPoint   === DEFAULT_MARINA_ID) &&
      (!charter.redeliveryPoint || charter.redeliveryPoint === DEFAULT_MARINA_ID);
    relocation = atBase ? 0 : pricing.relocationFee;
  }

  return {
    charter,
    nights,
    weeks,
    tier,
    baseRate,
    charterFee,
    brokerAmount,
    netRevenue,
    apa,
    vat,
    relocation,
    totalInvoice: charterFee + apa + vat + relocation,
    source,
  };
}

export interface YearSummary {
  year:                  number;
  confirmed:             CharterFinancials[];  // status: confirmed | signed
  pipeline:              CharterFinancials[];  // status: serious_request | broker_request
  totalCharterFee:       number;
  totalBrokerCommission: number;
  totalNetRevenue:       number;   // totalCharterFee − totalBrokerCommission
  totalApa:              number;   // provisioning pool (not operator revenue)
  totalVat:              number;
  totalRelocation:       number;
  totalInvoice:          number;   // full client invoice total
  totalNights:           number;
  monthlyRevenue:        number[]; // net revenue (after broker) per month, indices 0–11
}

export function buildYearSummary(
  charters: Charter[],
  year: number,
  pricing: PricingConfig,
  toDate?: string,
): YearSummary {
  const yearCharters = charters.filter(c => {
    if (!c.startDate.startsWith(String(year))) return false;
    if (toDate && c.startDate > toDate) return false;
    return true;
  });

  const confirmed: CharterFinancials[] = [];
  const pipeline:  CharterFinancials[] = [];

  for (const c of yearCharters) {
    if (c.status === 'confirmed' || c.status === 'signed') {
      confirmed.push(computeCharterFinancials(c, pricing));
    } else if (c.status === 'serious_request' || c.status === 'broker_request') {
      pipeline.push(computeCharterFinancials(c, pricing));
    }
  }

  confirmed.sort((a, b) => a.charter.startDate.localeCompare(b.charter.startDate));
  pipeline.sort((a, b)  => a.charter.startDate.localeCompare(b.charter.startDate));

  const monthlyRevenue = Array<number>(12).fill(0);
  for (const cf of confirmed) {
    const month = parseInt(cf.charter.startDate.slice(5, 7), 10) - 1;
    monthlyRevenue[month] += cf.netRevenue;
  }

  const totalCharterFee       = confirmed.reduce((s, cf) => s + cf.charterFee, 0);
  const totalBrokerCommission = confirmed.reduce((s, cf) => s + cf.brokerAmount, 0);
  const totalNetRevenue       = confirmed.reduce((s, cf) => s + cf.netRevenue, 0);
  const totalApa              = confirmed.reduce((s, cf) => s + cf.apa, 0);
  const totalVat              = confirmed.reduce((s, cf) => s + cf.vat, 0);
  const totalRelocation       = confirmed.reduce((s, cf) => s + cf.relocation, 0);
  const totalInvoice          = confirmed.reduce((s, cf) => s + cf.totalInvoice, 0);
  const totalNights           = confirmed.reduce((s, cf) => s + cf.nights, 0);

  return {
    year, confirmed, pipeline,
    totalCharterFee, totalBrokerCommission, totalNetRevenue,
    totalApa, totalVat, totalRelocation, totalInvoice, totalNights,
    monthlyRevenue,
  };
}

const PRICING_DOC = 'financial_config/pricing';

export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const snap = await getDoc(doc(db, PRICING_DOC));
    if (snap.exists()) {
      const data = snap.data() as PricingConfig & { updatedAt?: unknown };
      const { ...config } = data;
      delete (config as Record<string, unknown>).updatedAt;
      return config as PricingConfig;
    }
  } catch {
    // fall through to default
  }
  return { ...DEFAULT_PRICING };
}

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  await setDoc(doc(db, PRICING_DOC), { ...config, updatedAt: serverTimestamp() });
}
