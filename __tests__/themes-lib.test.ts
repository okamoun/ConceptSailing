import {
  getAllThemeMetadata,
  upsertThemeMetadata,
  initializeThemeDefaults,
  THEME_CATEGORIES,
} from '../lib/themes'

// ── Firebase mocks ───────────────────────────────────────────────────────────

const mockSetDoc = jest.fn().mockResolvedValue(undefined)
const mockGetDocs = jest.fn()
const mockCollection = jest.fn().mockReturnValue('mock-collection-ref')
const mockDoc = jest.fn().mockReturnValue('mock-doc-ref')
const mockServerTimestamp = jest.fn().mockReturnValue('SERVER_TIMESTAMP')

jest.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}))

jest.mock('../lib/firebase', () => ({ db: { _tag: 'mock-db' } }))

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSnapshot(docs: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    empty: docs.length === 0,
    docs: docs.map(d => ({
      id: d.id,
      data: () => d.data,
    })),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── THEME_CATEGORIES ─────────────────────────────────────────────────────────

describe('THEME_CATEGORIES', () => {
  test('exports exactly 8 categories', () => {
    expect(THEME_CATEGORIES).toHaveLength(8)
  })

  test('contains all expected category names', () => {
    expect(THEME_CATEGORIES).toContain('Active & Sports')
    expect(THEME_CATEGORIES).toContain('Wellness & Relaxation')
    expect(THEME_CATEGORIES).toContain('Culture & History')
    expect(THEME_CATEGORIES).toContain('Food')
    expect(THEME_CATEGORIES).toContain('Social & Family')
    expect(THEME_CATEGORIES).toContain('Celebrations & Milestones')
    expect(THEME_CATEGORIES).toContain('Nature & Sea')
    expect(THEME_CATEGORIES).toContain('Lifestyle & Connoisseur')
  })

  test('is readonly (const assertion)', () => {
    // TypeScript const arrays are assignable to readonly arrays
    const cats: readonly string[] = THEME_CATEGORIES
    expect(cats.length).toBe(8)
  })
})

// ── getAllThemeMetadata ───────────────────────────────────────────────────────

describe('getAllThemeMetadata', () => {
  test('returns empty array when collection is empty', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([]))
    const result = await getAllThemeMetadata()
    expect(result).toEqual([])
  })

  test('returns empty array when Firestore throws', async () => {
    mockGetDocs.mockRejectedValue(new Error('network error'))
    const result = await getAllThemeMetadata()
    expect(result).toEqual([])
  })

  test('maps snapshot documents to ThemeMetadata objects', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { id: '1', data: { category: 'Active & Sports', order: 0, visible: true,  featured: false, updatedAt: null } },
      { id: '5', data: { category: 'Culture & History', order: 0, visible: false, featured: true, updatedAt: null } },
    ]))
    const result = await getAllThemeMetadata()
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: '1', category: 'Active & Sports', order: 0, visible: true, featured: false })
    expect(result[1]).toMatchObject({ id: '5', category: 'Culture & History', visible: false, featured: true })
  })

  test('uses document id as the id field', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { id: '18', data: { category: 'Lifestyle & Connoisseur', order: 0, visible: true, featured: false, updatedAt: null } },
    ]))
    const result = await getAllThemeMetadata()
    expect(result[0].id).toBe('18')
  })

  test('passes the theme_metadata collection ref to getDocs', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([]))
    await getAllThemeMetadata()
    expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'theme_metadata')
    expect(mockGetDocs).toHaveBeenCalledWith('mock-collection-ref')
  })
})

// ── upsertThemeMetadata ───────────────────────────────────────────────────────

describe('upsertThemeMetadata', () => {
  test('calls setDoc with merge: true', async () => {
    await upsertThemeMetadata('3', { visible: false })
    expect(mockSetDoc).toHaveBeenCalledWith(
      'mock-doc-ref',
      expect.any(Object),
      { merge: true }
    )
  })

  test('includes the id and updatedAt fields in the write payload', async () => {
    await upsertThemeMetadata('7', { order: 2 })
    const [, payload] = mockSetDoc.mock.calls[0]
    expect(payload).toMatchObject({ id: '7', updatedAt: 'SERVER_TIMESTAMP' })
  })

  test('passes the adventure id as the document id', async () => {
    await upsertThemeMetadata('12', { featured: true })
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'theme_metadata', '12')
  })

  test('includes all provided fields in the payload', async () => {
    await upsertThemeMetadata('1', { category: 'Food', order: 1, visible: true, featured: false })
    const [, payload] = mockSetDoc.mock.calls[0]
    expect(payload).toMatchObject({ category: 'Food', order: 1, visible: true, featured: false })
  })

  test('filters out undefined fields before writing', async () => {
    await upsertThemeMetadata('2', { visible: true, category: undefined as never })
    const [, payload] = mockSetDoc.mock.calls[0]
    expect(payload).not.toHaveProperty('category')
    expect(payload).toHaveProperty('visible', true)
  })

  test('calls serverTimestamp for the updatedAt field', async () => {
    await upsertThemeMetadata('4', { order: 0 })
    expect(mockServerTimestamp).toHaveBeenCalled()
  })
})

// ── initializeThemeDefaults ───────────────────────────────────────────────────

describe('initializeThemeDefaults', () => {
  test('does not write anything when collection already has documents', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([
      { id: '1', data: { category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null } },
    ]))
    await initializeThemeDefaults()
    expect(mockSetDoc).not.toHaveBeenCalled()
  })

  test('writes 18 documents when collection is empty', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([]))
    await initializeThemeDefaults()
    expect(mockSetDoc).toHaveBeenCalledTimes(18)
  })

  test('sets visible=true and featured=false for all seeded entries', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([]))
    await initializeThemeDefaults()
    for (const [, payload] of mockSetDoc.mock.calls) {
      expect(payload).toMatchObject({ visible: true, featured: false })
    }
  })

  test('seeds each adventure id from 1 to 18', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([]))
    await initializeThemeDefaults()
    const seededIds = mockDoc.mock.calls.map(([, , id]: [unknown, unknown, string]) => id)
    const expectedIds = Array.from({ length: 18 }, (_, i) => String(i + 1))
    expect(seededIds.sort()).toEqual(expect.arrayContaining(expectedIds.sort()))
  })

  test('assigns sequential order values starting from 0 within each category', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([]))
    await initializeThemeDefaults()
    const activeAndSportsCalls = mockSetDoc.mock.calls.filter(
      ([, payload]: [unknown, { category: string }]) => payload.category === 'Active & Sports'
    )
    const orders = activeAndSportsCalls.map(([, payload]: [unknown, { order: number }]) => payload.order)
    expect(orders.sort((a: number, b: number) => a - b)).toEqual([0, 1, 2])
  })

  test('covers all 8 categories in seed data', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([]))
    await initializeThemeDefaults()
    const categories = new Set(
      mockSetDoc.mock.calls.map(([, payload]: [unknown, { category: string }]) => payload.category)
    )
    expect(categories.size).toBe(8)
    for (const cat of THEME_CATEGORIES) {
      expect(categories).toContain(cat)
    }
  })
})
