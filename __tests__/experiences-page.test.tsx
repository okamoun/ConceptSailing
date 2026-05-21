import React from 'react'
import { render, screen } from '@testing-library/react'
import ExperiencesPage from '../app/experiences/page'

// Adventures data has Image components and feature icons — mock them
jest.mock('../app/feature-icons', () => ({
  featureIconMap: new Proxy({}, { get: () => '⚡' }),
}))

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

describe('Experiences Page — Adventure Categories', () => {
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

describe('Experiences Page — Adventure Theme Cards', () => {
  test('renders "View Experience" buttons for each adventure', () => {
    render(<ExperiencesPage />)
    const viewExperienceButtons = screen.getAllByRole('link', { name: 'View Experience' })
    expect(viewExperienceButtons.length).toBeGreaterThan(0)
  })

  test('each View Experience link has a /themes/ href', () => {
    render(<ExperiencesPage />)
    const viewExperienceLinks = screen.getAllByRole('link', { name: 'View Experience' })
    viewExperienceLinks.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/themes\/\d+$/)
    })
  })
})
