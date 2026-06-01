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
