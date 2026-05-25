import {
  getSeasonTier,
  computeCharterFinancials,
  buildYearSummary,
  getPricingConfig,
  savePricingConfig,
  DEFAULT_PRICING,
} from '../lib/financial'
import type { Charter } from '../lib/availability'

jest.mock('../lib/firebase', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}))

const BASE_CHARTER: Charter = {
  id: 'c1',
  startDate: '2025-07-05',
  endDate: '2025-07-12',
  status: 'confirmed',
  note: '',
  createdAt: {} as never,
}

describe('getSeasonTier', () => {
  test.each([
    ['2025-07-01', 'high'],
    ['2025-07-31', 'high'],
    ['2025-08-01', 'high'],
    ['2025-08-31', 'high'],
  ])('%s → high season', (date, expected) => {
    expect(getSeasonTier(date)).toBe(expected)
  })

  test.each([
    ['2025-06-01', 'mid'],
    ['2025-06-30', 'mid'],
    ['2025-09-01', 'mid'],
    ['2025-09-30', 'mid'],
  ])('%s → mid season', (date, expected) => {
    expect(getSeasonTier(date)).toBe(expected)
  })

  test.each([
    ['2025-01-01', 'low'],
    ['2025-02-15', 'low'],
    ['2025-03-20', 'low'],
    ['2025-04-10', 'low'],
    ['2025-05-25', 'low'],
    ['2025-10-05', 'low'],
    ['2025-11-20', 'low'],
    ['2025-12-31', 'low'],
  ])('%s → low season', (date, expected) => {
    expect(getSeasonTier(date)).toBe(expected)
  })
})

describe('computeCharterFinancials', () => {
  describe('nights and weeks', () => {
    test('computes 7 nights for a one-week charter', () => {
      const f = computeCharterFinancials(BASE_CHARTER, DEFAULT_PRICING)
      expect(f.nights).toBe(7)
      expect(f.weeks).toBe(1)
    })

    test('computes 14 nights for a two-week charter', () => {
      const charter = { ...BASE_CHARTER, startDate: '2025-07-01', endDate: '2025-07-15' }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.nights).toBe(14)
      expect(f.weeks).toBe(2)
    })
  })

  describe('season tier and base rate', () => {
    test('high season charter uses high season rate', () => {
      const f = computeCharterFinancials(BASE_CHARTER, DEFAULT_PRICING)
      expect(f.tier).toBe('high')
      expect(f.baseRate).toBe(24000)
    })

    test('mid season charter uses mid season rate', () => {
      const charter = { ...BASE_CHARTER, startDate: '2025-06-01', endDate: '2025-06-08' }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.tier).toBe('mid')
      expect(f.baseRate).toBe(21000)
    })

    test('low season charter uses low season rate', () => {
      const charter = { ...BASE_CHARTER, startDate: '2025-03-01', endDate: '2025-03-08' }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.tier).toBe('low')
      expect(f.baseRate).toBe(18000)
    })
  })

  describe('charter fee — computed vs actual', () => {
    test('charter fee is rate × weeks when no contractValue', () => {
      const f = computeCharterFinancials(BASE_CHARTER, DEFAULT_PRICING)
      expect(f.charterFee).toBe(24000)
      expect(f.source).toBe('computed')
    })

    test('charter fee is contractValue when set', () => {
      const charter = { ...BASE_CHARTER, contractValue: 20000 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.charterFee).toBe(20000)
      expect(f.source).toBe('actual')
    })

    test('contractValue of 0 is treated as actual (not computed)', () => {
      const charter = { ...BASE_CHARTER, contractValue: 0 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.charterFee).toBe(0)
      expect(f.source).toBe('actual')
    })

    test('charter fee scales with weeks for a two-week charter', () => {
      const charter = { ...BASE_CHARTER, startDate: '2025-07-01', endDate: '2025-07-15' }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.charterFee).toBe(48000)
    })
  })

  describe('broker commission', () => {
    test('no broker commission when brokerCommission is not set', () => {
      const f = computeCharterFinancials(BASE_CHARTER, DEFAULT_PRICING)
      expect(f.brokerAmount).toBe(0)
      expect(f.netRevenue).toBe(f.charterFee)
    })

    test('10% broker commission is deducted from net revenue', () => {
      const charter = { ...BASE_CHARTER, brokerCommission: 10 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.brokerAmount).toBe(2400)
      expect(f.netRevenue).toBe(21600)
    })

    test('15% broker on actual contract value', () => {
      const charter = { ...BASE_CHARTER, contractValue: 20000, brokerCommission: 15 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.brokerAmount).toBe(3000)
      expect(f.netRevenue).toBe(17000)
    })
  })

  describe('APA', () => {
    test('APA defaults to 25% of charter fee', () => {
      const f = computeCharterFinancials(BASE_CHARTER, DEFAULT_PRICING)
      expect(f.apa).toBe(6000)
    })

    test('per-booking apaAmount overrides the percentage default', () => {
      const charter = { ...BASE_CHARTER, apaAmount: 5000 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.apa).toBe(5000)
    })

    test('apaAmount of 0 overrides default (no APA collected)', () => {
      const charter = { ...BASE_CHARTER, apaAmount: 0 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.apa).toBe(0)
    })
  })

  describe('VAT', () => {
    test('VAT is 13% of charter fee', () => {
      const f = computeCharterFinancials(BASE_CHARTER, DEFAULT_PRICING)
      expect(f.vat).toBeCloseTo(3120, 5)
    })

    test('VAT is based on charterFee not netRevenue', () => {
      const charter = { ...BASE_CHARTER, brokerCommission: 10 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.vat).toBeCloseTo(3120, 5)
    })
  })

  describe('relocation fee', () => {
    test('no relocation when both delivery and redelivery are at base marina', () => {
      const charter = {
        ...BASE_CHARTER,
        deliveryPoint: 'nea-peramos',
        redeliveryPoint: 'nea-peramos',
      }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.relocation).toBe(0)
    })

    test('no relocation when delivery and redelivery are not set (implies base)', () => {
      const f = computeCharterFinancials(BASE_CHARTER, DEFAULT_PRICING)
      expect(f.relocation).toBe(0)
    })

    test('relocation fee applies when delivery point differs from base', () => {
      const charter = { ...BASE_CHARTER, deliveryPoint: 'piraeus' }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.relocation).toBe(1000)
    })

    test('relocation fee applies when redelivery point differs from base', () => {
      const charter = { ...BASE_CHARTER, redeliveryPoint: 'lavrio' }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.relocation).toBe(1000)
    })

    test('per-booking relocationAmount overrides config default', () => {
      const charter = { ...BASE_CHARTER, redeliveryPoint: 'lavrio', relocationAmount: 1500 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.relocation).toBe(1500)
    })

    test('relocationAmount of 0 waives fee even for non-base delivery', () => {
      const charter = { ...BASE_CHARTER, deliveryPoint: 'piraeus', relocationAmount: 0 }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      expect(f.relocation).toBe(0)
    })
  })

  describe('totalInvoice', () => {
    test('totalInvoice = charterFee + apa + vat + relocation', () => {
      const f = computeCharterFinancials(BASE_CHARTER, DEFAULT_PRICING)
      expect(f.totalInvoice).toBeCloseTo(f.charterFee + f.apa + f.vat + f.relocation, 5)
    })

    test('totalInvoice with all components', () => {
      const charter = {
        ...BASE_CHARTER,
        contractValue: 20000,
        brokerCommission: 10,
        apaAmount: 4000,
        relocationAmount: 1500,
      }
      const f = computeCharterFinancials(charter, DEFAULT_PRICING)
      const expectedVat = 20000 * 0.13
      expect(f.totalInvoice).toBeCloseTo(20000 + 4000 + expectedVat + 1500, 5)
    })
  })
})

describe('buildYearSummary', () => {
  const pricing = DEFAULT_PRICING

  const confirmedCharter: Charter = {
    id: 'c1',
    startDate: '2025-07-05',
    endDate: '2025-07-12',
    status: 'confirmed',
    createdAt: {} as never,
  }

  const signedCharter: Charter = {
    id: 'c2',
    startDate: '2025-08-01',
    endDate: '2025-08-08',
    status: 'signed',
    createdAt: {} as never,
  }

  const seriousRequest: Charter = {
    id: 'c3',
    startDate: '2025-09-06',
    endDate: '2025-09-13',
    status: 'serious_request',
    createdAt: {} as never,
  }

  const brokerRequest: Charter = {
    id: 'c4',
    startDate: '2025-06-07',
    endDate: '2025-06-14',
    status: 'broker_request',
    createdAt: {} as never,
  }

  const otherYearCharter: Charter = {
    id: 'c5',
    startDate: '2024-07-05',
    endDate: '2024-07-12',
    status: 'confirmed',
    createdAt: {} as never,
  }

  const ignoredStatus: Charter = {
    id: 'c6',
    startDate: '2025-05-01',
    endDate: '2025-05-08',
    status: 'requested',
    createdAt: {} as never,
  }

  test('filters charters to the requested year', () => {
    const summary = buildYearSummary([confirmedCharter, otherYearCharter], 2025, pricing)
    expect(summary.confirmed).toHaveLength(1)
    expect(summary.confirmed[0].charter.id).toBe('c1')
  })

  test('year field matches requested year', () => {
    const summary = buildYearSummary([confirmedCharter], 2025, pricing)
    expect(summary.year).toBe(2025)
  })

  test('confirmed includes status confirmed and signed', () => {
    const summary = buildYearSummary(
      [confirmedCharter, signedCharter, seriousRequest, brokerRequest],
      2025,
      pricing,
    )
    expect(summary.confirmed).toHaveLength(2)
    const ids = summary.confirmed.map(cf => cf.charter.id)
    expect(ids).toContain('c1')
    expect(ids).toContain('c2')
  })

  test('pipeline includes status serious_request and broker_request', () => {
    const summary = buildYearSummary(
      [confirmedCharter, signedCharter, seriousRequest, brokerRequest],
      2025,
      pricing,
    )
    expect(summary.pipeline).toHaveLength(2)
    const ids = summary.pipeline.map(cf => cf.charter.id)
    expect(ids).toContain('c3')
    expect(ids).toContain('c4')
  })

  test('charters with other statuses are excluded from both lists', () => {
    const summary = buildYearSummary([ignoredStatus], 2025, pricing)
    expect(summary.confirmed).toHaveLength(0)
    expect(summary.pipeline).toHaveLength(0)
  })

  test('confirmed charters are sorted by startDate ascending', () => {
    const summary = buildYearSummary([signedCharter, confirmedCharter], 2025, pricing)
    expect(summary.confirmed[0].charter.id).toBe('c1')
    expect(summary.confirmed[1].charter.id).toBe('c2')
  })

  test('totalCharterFee sums confirmed charter fees', () => {
    const summary = buildYearSummary([confirmedCharter, signedCharter], 2025, pricing)
    const expected = summary.confirmed.reduce((s, cf) => s + cf.charterFee, 0)
    expect(summary.totalCharterFee).toBe(expected)
  })

  test('totalNetRevenue = totalCharterFee - totalBrokerCommission', () => {
    const summary = buildYearSummary([confirmedCharter, signedCharter], 2025, pricing)
    expect(summary.totalNetRevenue).toBeCloseTo(
      summary.totalCharterFee - summary.totalBrokerCommission,
      5,
    )
  })

  test('totalNights sums nights of confirmed charters', () => {
    const summary = buildYearSummary([confirmedCharter, signedCharter], 2025, pricing)
    expect(summary.totalNights).toBe(14)
  })

  test('monthlyRevenue has 12 entries', () => {
    const summary = buildYearSummary([], 2025, pricing)
    expect(summary.monthlyRevenue).toHaveLength(12)
  })

  test('monthlyRevenue accumulates net revenue in correct month index', () => {
    const summary = buildYearSummary([confirmedCharter], 2025, pricing)
    // July = index 6
    expect(summary.monthlyRevenue[6]).toBeCloseTo(24000, 5)
    // All other months should be 0
    summary.monthlyRevenue.forEach((v, i) => {
      if (i !== 6) expect(v).toBe(0)
    })
  })

  test('monthlyRevenue only includes confirmed, not pipeline', () => {
    const summary = buildYearSummary([confirmedCharter, seriousRequest], 2025, pricing)
    // September (index 8) should be 0 — seriousRequest is pipeline
    expect(summary.monthlyRevenue[8]).toBe(0)
  })

  test('empty charter list produces zero totals', () => {
    const summary = buildYearSummary([], 2025, pricing)
    expect(summary.totalCharterFee).toBe(0)
    expect(summary.totalNetRevenue).toBe(0)
    expect(summary.totalApa).toBe(0)
    expect(summary.totalVat).toBe(0)
    expect(summary.totalRelocation).toBe(0)
    expect(summary.totalInvoice).toBe(0)
    expect(summary.totalNights).toBe(0)
  })
})

describe('getPricingConfig', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('returns DEFAULT_PRICING when Firestore document does not exist', async () => {
    const { getDoc } = require('firebase/firestore')
    ;(getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false })

    const { getPricingConfig: get } = require('../lib/financial')
    const config = await get()
    expect(config).toEqual(DEFAULT_PRICING)
  })

  test('returns stored config when Firestore document exists', async () => {
    const stored = {
      highSeasonRate: 26000,
      midSeasonRate: 22000,
      lowSeasonRate: 19000,
      apaPercent: 20,
      vatPercent: 13,
      relocationFee: 1200,
      updatedAt: 'some-timestamp',
    }
    const { getDoc } = require('firebase/firestore')
    ;(getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => true, data: () => stored })

    const { getPricingConfig: get } = require('../lib/financial')
    const config = await get()
    expect(config.highSeasonRate).toBe(26000)
    expect(config.midSeasonRate).toBe(22000)
    expect((config as Record<string, unknown>).updatedAt).toBeUndefined()
  })

  test('returns DEFAULT_PRICING when Firestore throws', async () => {
    const { getDoc } = require('firebase/firestore')
    ;(getDoc as jest.Mock).mockRejectedValueOnce(new Error('network error'))

    const { getPricingConfig: get } = require('../lib/financial')
    const config = await get()
    expect(config).toEqual(DEFAULT_PRICING)
  })
})

describe('savePricingConfig', () => {
  test('calls setDoc with config and serverTimestamp', async () => {
    const { setDoc, serverTimestamp } = require('firebase/firestore')
    ;(serverTimestamp as jest.Mock).mockReturnValue('ts')
    ;(setDoc as jest.Mock).mockResolvedValueOnce(undefined)

    const { savePricingConfig: save } = require('../lib/financial')
    await save(DEFAULT_PRICING)

    const [, payload] = (setDoc as jest.Mock).mock.calls[0]
    expect(payload).toMatchObject({ ...DEFAULT_PRICING, updatedAt: 'ts' })
  })
})
