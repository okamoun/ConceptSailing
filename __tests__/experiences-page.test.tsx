import React from 'react'
import { render, screen } from '@testing-library/react'
import ExperiencesPage from '../app/experiences/page'
import { getAllThemeMetadata } from '../lib/themes'

jest.mock('../app/feature-icons', () => ({
  featureIconMap: new Proxy({}, { get: () => '⚡' }),
}))

jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }))

jest.mock('../lib/themes', () => ({
  getAllThemeMetadata: jest.fn().mockResolvedValue([]),
  THEME_CATEGORIES: [
    'Active & Sports',
    'Wellness & Relaxation',
    'Culture & History',
    'Food',
    'Social & Family',
    'Celebrations & Milestones',
    'Nature & Sea',
    'Lifestyle & Connoisseur',
  ],
}))

beforeEach(() => {
  jest.clearAllMocks()
  // Default: empty metadata → fallback layout
  ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([])
})

describe('Experiences Page — Hero Section', () => {
  test('renders "Greek Sailing Adventures" as main heading', async () => {
    render(await ExperiencesPage())
    expect(
      screen.getByRole('heading', { level: 1, name: 'Greek Sailing Adventures' })
    ).toBeInTheDocument()
  })

  test('renders subtitle with correct spelling', async () => {
    render(await ExperiencesPage())
    expect(
      screen.getByText('Curated themed experiences across the Greek islands')
    ).toBeInTheDocument()
  })

  test('renders description mentioning culinary journeys and wellness retreats', async () => {
    render(await ExperiencesPage())
    expect(
      screen.getByText(/From culinary journeys to wellness retreats/)
    ).toBeInTheDocument()
  })

  test('hero View Destinations button links to /destinations', async () => {
    render(await ExperiencesPage())
    const links = screen.getAllByRole('link', { name: /View Destinations/ })
    expect(links.length).toBeGreaterThan(0)
    links.forEach(link => expect(link).toHaveAttribute('href', '/destinations'))
  })
})

describe('Experiences Page — Adventure Categories (fallback layout)', () => {
  const categories = [
    'Active & Sports',
    'Wellness & Relaxation',
    'Culture & History',
    'Food',
    'Social & Family',
    'Celebrations & Milestones',
    'Nature & Sea',
  ]

  categories.forEach(category => {
    test(`renders "${category}" category section heading`, async () => {
      render(await ExperiencesPage())
      expect(screen.getByRole('heading', { name: category })).toBeInTheDocument()
    })
  })
})

describe('Experiences Page — Greek Destinations Preview Section', () => {
  test('renders "Discover Greek Destinations" heading', async () => {
    render(await ExperiencesPage())
    expect(
      screen.getByRole('heading', { name: 'Discover Greek Destinations' })
    ).toBeInTheDocument()
  })

  test('destinations section describes hidden coves and vibrant harbors', async () => {
    render(await ExperiencesPage())
    expect(
      screen.getByText(/From hidden coves to vibrant harbors/)
    ).toBeInTheDocument()
  })

  test('Explore All Destinations link points to /destinations', async () => {
    render(await ExperiencesPage())
    const link = screen.getByRole('link', { name: /Explore All Destinations/ })
    expect(link).toHaveAttribute('href', '/destinations')
  })
})

describe('Experiences Page — Luxury Yacht CTA Section', () => {
  test('renders "Prefer a Luxury Yacht Experience?" heading', async () => {
    render(await ExperiencesPage())
    expect(
      screen.getByRole('heading', { name: 'Prefer a Luxury Yacht Experience?' })
    ).toBeInTheDocument()
  })

  test('renders flagship BlueOne catamaran description', async () => {
    render(await ExperiencesPage())
    expect(
      screen.getByText(/Discover our flagship BlueOne catamaran/)
    ).toBeInTheDocument()
  })

  test('Explore BlueOne Yacht link points to home page', async () => {
    render(await ExperiencesPage())
    const link = screen.getByRole('link', { name: 'Explore BlueOne Yacht' })
    expect(link).toHaveAttribute('href', '/')
  })
})

describe('Experiences Page — Adventure Theme Cards (fallback layout)', () => {
  test('renders "View Experience" links for each adventure', async () => {
    render(await ExperiencesPage())
    const links = screen.getAllByRole('link', { name: 'View Experience' })
    expect(links.length).toBeGreaterThan(0)
  })

  test('each View Experience link has a /themes/ href', async () => {
    render(await ExperiencesPage())
    const links = screen.getAllByRole('link', { name: 'View Experience' })
    links.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/themes\/\d+$/)
    })
  })
})

describe('Experiences Page — Dynamic layout (Firestore metadata)', () => {
  const mockMeta = [
    { id: '1', category: 'Active & Sports',       order: 0, visible: true,  featured: true  },
    { id: '2', category: 'Active & Sports',       order: 1, visible: false, featured: false },
    { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true,  featured: false },
  ]

  beforeEach(() => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue(mockMeta)
  })

  test('shows ★ Featured badge for featured themes', async () => {
    render(await ExperiencesPage())
    expect(screen.getByText(/★ Featured/)).toBeInTheDocument()
  })

  test('does not show Featured badge for non-featured themes', async () => {
    render(await ExperiencesPage())
    // Only one featured badge expected (id '1')
    expect(screen.getAllByText(/★ Featured/).length).toBe(1)
  })

  test('hides themes marked as visible=false', async () => {
    render(await ExperiencesPage())
    // Adventure id '2' is 'Family Sailing School' — marked not visible
    expect(screen.queryByText('Family Sailing School')).not.toBeInTheDocument()
  })

  test('shows themes marked as visible=true', async () => {
    render(await ExperiencesPage())
    // Adventure id '1' is 'Wind Sports Adventure' — visible
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
  })

  test('renders only categories that have visible themes', async () => {
    render(await ExperiencesPage())
    // 'Active & Sports' has one visible theme; it should be shown
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    // 'Culture & History' has no themes in mock data; it should not appear
    expect(screen.queryByRole('heading', { name: 'Culture & History' })).not.toBeInTheDocument()
  })

  test('calls getAllThemeMetadata once per render', async () => {
    await ExperiencesPage()
    expect(getAllThemeMetadata).toHaveBeenCalledTimes(1)
  })
})

describe('Experiences Page — Firestore error fallback', () => {
  test('renders hardcoded layout when getAllThemeMetadata returns empty array', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([])
    render(await ExperiencesPage())
    // All 8 hardcoded categories should appear in fallback
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
  })

  test('renders hardcoded layout when getAllThemeMetadata throws (e.g. Firebase SDK fails server-side)', async () => {
    // This is the scenario that was previously hidden: Firebase client SDK can fail when
    // called from a Next.js server component. Without this test, the silent try/catch
    // in the old getAllThemeMetadata masked the problem entirely.
    ;(getAllThemeMetadata as jest.Mock).mockRejectedValue(new Error('Firebase connection failed'))
    render(await ExperiencesPage())
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Greek Sailing Adventures' })).toBeInTheDocument()
  })

  test('falls back to hardcoded layout when all metadata IDs are unknown adventures', async () => {
    // All IDs are unknown → adventureMap.get() returns undefined for each → dynamic groups stay empty
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '999', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
  })
})

describe('Experiences Page — Robustness with missing Firestore fields', () => {
  test('does not crash when some metadata docs are missing the category field', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: undefined, order: 0, visible: true,  featured: false, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    // Must not throw — page renders in some valid state
    render(await ExperiencesPage())
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  test('does not crash when some metadata docs are missing the order field', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports', order: undefined, visible: true, featured: false, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: undefined, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  test('falls back to hardcoded layout when all visible docs are missing category', async () => {
    // All docs have category: undefined → dynamic build produces zero groups → fallback
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: undefined, order: 0, visible: true, featured: false, updatedAt: null },
      { id: '2', category: undefined, order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
  })

  test('renders themes with valid category and skips docs with missing category', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports',       order: 0, visible: true, featured: false, updatedAt: null },
      { id: '2', category: undefined,               order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    // id '1' = 'Wind Sports Adventure' — has valid category, must appear
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
    // id '2' = 'Family Sailing School' — missing category, must be skipped
    expect(screen.queryByText('Family Sailing School')).not.toBeInTheDocument()
  })

  test('does not crash when visible=true docs have both category and order missing', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: undefined, order: undefined, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

// ── Admin change scenarios ────────────────────────────────────────────────────
// Each test simulates a specific admin action (represented as the resulting
// Firestore metadata state) and asserts the expected impact on the public page.

describe('Experiences Page — admin hides a theme', () => {
  test('hidden theme does not appear on the page', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports', order: 0, visible: true,  featured: false, updatedAt: null },
      { id: '2', category: 'Active & Sports', order: 1, visible: false, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
    expect(screen.queryByText('Family Sailing School')).not.toBeInTheDocument()
  })

  test('hiding all themes in a category removes the category heading', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1',  category: 'Active & Sports',       order: 0, visible: false, featured: false, updatedAt: null },
      { id: '2',  category: 'Active & Sports',       order: 1, visible: false, featured: false, updatedAt: null },
      { id: '12', category: 'Active & Sports',       order: 2, visible: false, featured: false, updatedAt: null },
      { id: '3',  category: 'Wellness & Relaxation', order: 0, visible: true,  featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.queryByRole('heading', { name: 'Active & Sports' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
  })
})

describe('Experiences Page — admin un-hides a theme', () => {
  test('previously hidden theme appears after being marked visible', async () => {
    // Simulates the state after admin flips visible:false → visible:true for id '2'
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '2', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByText('Family Sailing School')).toBeInTheDocument()
  })
})

describe('Experiences Page — admin changes a theme category', () => {
  test('theme appears under the new category after reassignment', async () => {
    // Admin moves 'Wind Sports Adventure' (id '1') from Active & Sports → Food
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Food', order: 2, visible: true, featured: false, updatedAt: null },
      { id: '6', category: 'Food', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByRole('heading', { name: 'Food' })).toBeInTheDocument()
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
  })

  test('old category heading disappears when its last visible theme is moved away', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Food', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    // 'Active & Sports' now has no themes → section must not appear
    expect(screen.queryByRole('heading', { name: 'Active & Sports' })).not.toBeInTheDocument()
  })

  test('theme does not appear under its previous category after reassignment', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Food',            order: 0, visible: true, featured: false, updatedAt: null },
      { id: '2', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    const { container } = render(await ExperiencesPage())

    // Each category renders as a <section> — find by its h2 text
    const sections = Array.from(container.querySelectorAll('section'))
    const foodSection   = sections.find(s => s.querySelector('h2')?.textContent?.trim() === 'Food')
    const activeSection = sections.find(s => s.querySelector('h2')?.textContent?.trim() === 'Active & Sports')

    expect(foodSection).toBeTruthy()
    expect(activeSection).toBeTruthy()

    // 'Wind Sports Adventure' must be inside the Food section, not Active & Sports
    expect(foodSection!.textContent).toContain('Wind Sports Adventure')
    expect(activeSection!.textContent).not.toContain('Wind Sports Adventure')
    // 'Family Sailing School' stays in Active & Sports
    expect(activeSection!.textContent).toContain('Family Sailing School')
  })

  test('assigning multiple themes to same category groups them under one heading', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1',  category: 'Food', order: 0, visible: true, featured: false, updatedAt: null },
      { id: '6',  category: 'Food', order: 1, visible: true, featured: false, updatedAt: null },
      { id: '10', category: 'Food', order: 2, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getAllByRole('heading', { name: 'Food' }).length).toBe(1)
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
    expect(screen.getByText('Culinary Traditions')).toBeInTheDocument()
    expect(screen.getByText('Mediterranean Flavors')).toBeInTheDocument()
  })
})

describe('Experiences Page — admin reorders themes', () => {
  test('order 0 theme renders before order 1 theme in the same category', async () => {
    // Default order: id '1' first, id '2' second.
    // After swap:    id '2' order 0, id '1' order 1 → Family Sailing School first
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports', order: 1, visible: true, featured: false, updatedAt: null },
      { id: '2', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    const { container } = render(await ExperiencesPage())
    const h3s = Array.from(container.querySelectorAll('h3')).map(h => h.textContent?.trim())
    const idx1 = h3s.indexOf('Wind Sports Adventure')
    const idx2 = h3s.indexOf('Family Sailing School')
    expect(idx2).toBeGreaterThan(-1)
    expect(idx1).toBeGreaterThan(-1)
    // Family Sailing School (order 0) must appear before Wind Sports Adventure (order 1)
    expect(idx2).toBeLessThan(idx1)
  })

  test('order is independent across categories — each category starts from its own order 0', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: false, updatedAt: null },
      { id: '4', category: 'Wellness & Relaxation', order: 1, visible: true, featured: false, updatedAt: null },
      { id: '1', category: 'Active & Sports',       order: 0, visible: true, featured: false, updatedAt: null },
      { id: '2', category: 'Active & Sports',       order: 1, visible: true, featured: false, updatedAt: null },
    ])
    const { container } = render(await ExperiencesPage())
    const h3s = Array.from(container.querySelectorAll('h3')).map(h => h.textContent?.trim())
    // Active & Sports comes before Wellness & Relaxation in THEME_CATEGORIES
    const idxWind   = h3s.indexOf('Wind Sports Adventure')
    const idxFamily = h3s.indexOf('Family Sailing School')
    const idxYoga   = h3s.indexOf('Yoga & Wellness Retreat')
    expect(idxWind).toBeLessThan(idxYoga)
    expect(idxFamily).toBeLessThan(idxYoga)
  })
})

describe('Experiences Page — admin changes featured status', () => {
  test('marking a theme featured adds the ★ Featured badge', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports', order: 0, visible: true, featured: true, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByText(/★ Featured/)).toBeInTheDocument()
  })

  test('removing featured from all themes removes every ★ Featured badge', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports',       order: 0, visible: true, featured: false, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.queryByText(/★ Featured/)).not.toBeInTheDocument()
  })

  test('multiple themes can be featured simultaneously', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports',       order: 0, visible: true, featured: true, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: true, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getAllByText(/★ Featured/).length).toBe(2)
  })

  test('featured badge does not appear for a theme that is hidden', async () => {
    // featured:true + visible:false → card is not rendered → badge must not appear
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports',       order: 0, visible: false, featured: true,  updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true,  featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.queryByText('Wind Sports Adventure')).not.toBeInTheDocument()
    expect(screen.queryByText(/★ Featured/)).not.toBeInTheDocument()
  })
})

describe('Experiences Page — category display order', () => {
  test('section order follows THEME_CATEGORIES regardless of metadata insertion order', async () => {
    // Metadata lists Food before Active & Sports, but page must show Active & Sports first
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '6', category: 'Food',            order: 0, visible: true, featured: false, updatedAt: null },
      { id: '1', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    const { container } = render(await ExperiencesPage())
    const h2s = Array.from(container.querySelectorAll('h2')).map(h => h.textContent?.trim())
    const activeIdx = h2s.indexOf('Active & Sports')
    const foodIdx   = h2s.indexOf('Food')
    expect(activeIdx).toBeGreaterThan(-1)
    expect(foodIdx).toBeGreaterThan(-1)
    expect(activeIdx).toBeLessThan(foodIdx)
  })

  test('only categories with at least one visible theme appear as sections', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '5', category: 'Culture & History', order: 0, visible: true,  featured: false, updatedAt: null },
      { id: '6', category: 'Food',              order: 0, visible: false, featured: false, updatedAt: null },
    ])
    render(await ExperiencesPage())
    expect(screen.getByRole('heading', { name: 'Culture & History' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Food' })).not.toBeInTheDocument()
  })
})
