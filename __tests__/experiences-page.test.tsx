import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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

// ── Hero Section ──────────────────────────────────────────────────────────────

describe('Experiences Page — Hero Section', () => {
  test('renders "Greek Sailing Adventures" as main heading', () => {
    render(<ExperiencesPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Greek Sailing Adventures' })
    ).toBeInTheDocument()
  })

  test('renders subtitle with correct spelling', () => {
    render(<ExperiencesPage />)
    expect(
      screen.getByText('Curated themed experiences across the Greek islands')
    ).toBeInTheDocument()
  })

  test('renders description mentioning culinary journeys and wellness retreats', () => {
    render(<ExperiencesPage />)
    expect(
      screen.getByText(/From culinary journeys to wellness retreats/)
    ).toBeInTheDocument()
  })

  test('hero View Destinations button links to /destinations', () => {
    render(<ExperiencesPage />)
    const links = screen.getAllByRole('link', { name: /View Destinations/ })
    expect(links.length).toBeGreaterThan(0)
    links.forEach(link => expect(link).toHaveAttribute('href', '/destinations'))
  })
})

// ── Fallback layout (hardcoded) ───────────────────────────────────────────────
// ThemeSections initialises with HARDCODED_CATEGORIES as its default state,
// so these headings are present immediately without waiting for Firebase.

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
    test(`renders "${category}" category section heading`, () => {
      render(<ExperiencesPage />)
      expect(screen.getByRole('heading', { name: category })).toBeInTheDocument()
    })
  })
})

// ── Greek Destinations Preview Section ────────────────────────────────────────

describe('Experiences Page — Greek Destinations Preview Section', () => {
  test('renders "Discover Greek Destinations" heading', () => {
    render(<ExperiencesPage />)
    expect(
      screen.getByRole('heading', { name: 'Discover Greek Destinations' })
    ).toBeInTheDocument()
  })

  test('destinations section describes hidden coves and vibrant harbors', () => {
    render(<ExperiencesPage />)
    expect(
      screen.getByText(/From hidden coves to vibrant harbors/)
    ).toBeInTheDocument()
  })

  test('Explore All Destinations link points to /destinations', () => {
    render(<ExperiencesPage />)
    const link = screen.getByRole('link', { name: /Explore All Destinations/ })
    expect(link).toHaveAttribute('href', '/destinations')
  })
})

// ── Luxury Yacht CTA Section ──────────────────────────────────────────────────

describe('Experiences Page — Luxury Yacht CTA Section', () => {
  test('renders "Prefer a Luxury Yacht Experience?" heading', () => {
    render(<ExperiencesPage />)
    expect(
      screen.getByRole('heading', { name: 'Prefer a Luxury Yacht Experience?' })
    ).toBeInTheDocument()
  })

  test('renders flagship BlueOne catamaran description', () => {
    render(<ExperiencesPage />)
    expect(
      screen.getByText(/Discover our flagship BlueOne catamaran/)
    ).toBeInTheDocument()
  })

  test('Explore BlueOne Yacht link points to home page', () => {
    render(<ExperiencesPage />)
    const link = screen.getByRole('link', { name: 'Explore BlueOne Yacht' })
    expect(link).toHaveAttribute('href', '/')
  })
})

// ── Adventure Theme Cards (fallback layout) ───────────────────────────────────

describe('Experiences Page — Adventure Theme Cards (fallback layout)', () => {
  test('renders "View Experience" links for each adventure', () => {
    render(<ExperiencesPage />)
    const links = screen.getAllByRole('link', { name: 'View Experience' })
    expect(links.length).toBeGreaterThan(0)
  })

  test('each View Experience link has a /themes/ href', () => {
    render(<ExperiencesPage />)
    const links = screen.getAllByRole('link', { name: 'View Experience' })
    links.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/themes\/\d+$/)
    })
  })
})

// ── Dynamic layout (Firestore metadata) ──────────────────────────────────────
// These scenarios depend on the useEffect in ThemeSections completing,
// so assertions use waitFor to wait for the state update.

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
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText(/★ Featured/)).toBeInTheDocument())
  })

  test('does not show Featured badge for non-featured themes', async () => {
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getAllByText(/★ Featured/).length).toBe(1))
  })

  test('hides themes marked as visible=false', async () => {
    render(<ExperiencesPage />)
    // Adventure id '2' is 'Family Sailing School' — marked not visible
    await waitFor(() => expect(screen.queryByText('Family Sailing School')).not.toBeInTheDocument())
  })

  test('shows themes marked as visible=true', async () => {
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())
  })

  test('renders only categories that have visible themes', async () => {
    render(<ExperiencesPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Culture & History' })).not.toBeInTheDocument()
    })
  })

  test('calls getAllThemeMetadata once per render', async () => {
    render(<ExperiencesPage />)
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalledTimes(1))
  })
})

// ── Firestore error fallback ──────────────────────────────────────────────────

describe('Experiences Page — Firestore error fallback', () => {
  test('renders hardcoded layout when getAllThemeMetadata returns empty array', () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([])
    render(<ExperiencesPage />)
    // Initial state is HARDCODED_CATEGORIES — no waitFor needed
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
  })

  test('renders hardcoded layout when getAllThemeMetadata throws (e.g. Firebase SDK fails server-side)', async () => {
    // ThemeSections catches the rejection and keeps hardcoded initial state
    ;(getAllThemeMetadata as jest.Mock).mockRejectedValue(new Error('Firebase connection failed'))
    render(<ExperiencesPage />)
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalled())
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Greek Sailing Adventures' })).toBeInTheDocument()
  })

  test('falls back to hardcoded layout when all metadata IDs are unknown adventures', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '999', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    // dynamic build produces zero groups → state stays HARDCODED_CATEGORIES
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalled())
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
  })
})

// ── Robustness with missing Firestore fields ──────────────────────────────────

describe('Experiences Page — Robustness with missing Firestore fields', () => {
  test('does not crash when some metadata docs are missing the category field', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: undefined, order: 0, visible: true,  featured: false, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalled())
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  test('does not crash when some metadata docs are missing the order field', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports', order: undefined, visible: true, featured: false, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: undefined, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalled())
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  test('falls back to hardcoded layout when all visible docs are missing category', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: undefined, order: 0, visible: true, featured: false, updatedAt: null },
      { id: '2', category: undefined, order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalled())
    expect(screen.getByRole('heading', { name: 'Active & Sports' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
  })

  test('renders themes with valid category and skips docs with missing category', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
      { id: '2', category: undefined,         order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())
    expect(screen.queryByText('Family Sailing School')).not.toBeInTheDocument()
  })

  test('does not crash when visible=true docs have both category and order missing', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: undefined, order: undefined, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalled())
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

// ── Admin change scenarios ────────────────────────────────────────────────────

describe('Experiences Page — admin hides a theme', () => {
  test('hidden theme does not appear on the page', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports', order: 0, visible: true,  featured: false, updatedAt: null },
      { id: '2', category: 'Active & Sports', order: 1, visible: false, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())
    expect(screen.queryByText('Family Sailing School')).not.toBeInTheDocument()
  })

  test('hiding all themes in a category removes the category heading', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1',  category: 'Active & Sports',       order: 0, visible: false, featured: false, updatedAt: null },
      { id: '2',  category: 'Active & Sports',       order: 1, visible: false, featured: false, updatedAt: null },
      { id: '12', category: 'Active & Sports',       order: 2, visible: false, featured: false, updatedAt: null },
      { id: '3',  category: 'Wellness & Relaxation', order: 0, visible: true,  featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Active & Sports' })).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'Wellness & Relaxation' })).toBeInTheDocument()
  })
})

describe('Experiences Page — admin un-hides a theme', () => {
  test('previously hidden theme appears after being marked visible', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '2', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText('Family Sailing School')).toBeInTheDocument())
  })
})

describe('Experiences Page — admin changes a theme category', () => {
  test('theme appears under the new category after reassignment', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Food', order: 2, visible: true, featured: false, updatedAt: null },
      { id: '6', category: 'Food', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Food' })).toBeInTheDocument())
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
  })

  test('old category heading disappears when its last visible theme is moved away', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Food', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Active & Sports' })).not.toBeInTheDocument())
  })

  test('theme does not appear under its previous category after reassignment', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Food',            order: 0, visible: true, featured: false, updatedAt: null },
      { id: '2', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    const { container } = render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())

    const sections = Array.from(container.querySelectorAll('section'))
    const foodSection   = sections.find(s => s.querySelector('h2')?.textContent?.trim() === 'Food')
    const activeSection = sections.find(s => s.querySelector('h2')?.textContent?.trim() === 'Active & Sports')

    expect(foodSection).toBeTruthy()
    expect(activeSection).toBeTruthy()
    expect(foodSection!.textContent).toContain('Wind Sports Adventure')
    expect(activeSection!.textContent).not.toContain('Wind Sports Adventure')
    expect(activeSection!.textContent).toContain('Family Sailing School')
  })

  test('assigning multiple themes to same category groups them under one heading', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1',  category: 'Food', order: 0, visible: true, featured: false, updatedAt: null },
      { id: '6',  category: 'Food', order: 1, visible: true, featured: false, updatedAt: null },
      { id: '10', category: 'Food', order: 2, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getAllByRole('heading', { name: 'Food' }).length).toBe(1))
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
    expect(screen.getByText('Culinary Traditions')).toBeInTheDocument()
    expect(screen.getByText('Mediterranean Flavors')).toBeInTheDocument()
  })
})

describe('Experiences Page — admin reorders themes', () => {
  test('order 0 theme renders before order 1 theme in the same category', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports', order: 1, visible: true, featured: false, updatedAt: null },
      { id: '2', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    const { container } = render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText('Family Sailing School')).toBeInTheDocument())

    const h3s = Array.from(container.querySelectorAll('h3')).map(h => h.textContent?.trim())
    const idx1 = h3s.indexOf('Wind Sports Adventure')
    const idx2 = h3s.indexOf('Family Sailing School')
    expect(idx2).toBeGreaterThan(-1)
    expect(idx1).toBeGreaterThan(-1)
    expect(idx2).toBeLessThan(idx1)
  })

  test('order is independent across categories', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: false, updatedAt: null },
      { id: '4', category: 'Wellness & Relaxation', order: 1, visible: true, featured: false, updatedAt: null },
      { id: '1', category: 'Active & Sports',       order: 0, visible: true, featured: false, updatedAt: null },
      { id: '2', category: 'Active & Sports',       order: 1, visible: true, featured: false, updatedAt: null },
    ])
    const { container } = render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText('Yoga & Wellness Retreat')).toBeInTheDocument())

    const h3s = Array.from(container.querySelectorAll('h3')).map(h => h.textContent?.trim())
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
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByText(/★ Featured/)).toBeInTheDocument())
  })

  test('removing featured from all themes removes every ★ Featured badge', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports',       order: 0, visible: true, featured: false, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalled())
    expect(screen.queryByText(/★ Featured/)).not.toBeInTheDocument()
  })

  test('multiple themes can be featured simultaneously', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports',       order: 0, visible: true, featured: true, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: true, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getAllByText(/★ Featured/).length).toBe(2))
  })

  test('featured badge does not appear for a theme that is hidden', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: 'Active & Sports',       order: 0, visible: false, featured: true,  updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true,  featured: false, updatedAt: null },
    ])
    render(<ExperiencesPage />)
    await waitFor(() => expect(getAllThemeMetadata).toHaveBeenCalled())
    expect(screen.queryByText('Wind Sports Adventure')).not.toBeInTheDocument()
    expect(screen.queryByText(/★ Featured/)).not.toBeInTheDocument()
  })
})

describe('Experiences Page — category display order', () => {
  test('section order follows THEME_CATEGORIES regardless of metadata insertion order', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '6', category: 'Food',            order: 0, visible: true, featured: false, updatedAt: null },
      { id: '1', category: 'Active & Sports', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    const { container } = render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Food' })).toBeInTheDocument())

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
    render(<ExperiencesPage />)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Culture & History' })).toBeInTheDocument())
    expect(screen.queryByRole('heading', { name: 'Food' })).not.toBeInTheDocument()
  })
})
