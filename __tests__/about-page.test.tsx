import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutPage from '../app/about/page'

describe('About Page — Branding & Headings', () => {
  test('renders BlueOne logo', () => {
    render(<AboutPage />)
    expect(screen.getByAltText('BlueOne Logo')).toBeInTheDocument()
  })

  test('renders "Premium Yacht Experiences" tagline with correct spelling', () => {
    render(<AboutPage />)
    expect(screen.getByText('Premium Yacht Experiences')).toBeInTheDocument()
  })

  test('renders "About BlueOne" as main heading', () => {
    render(<AboutPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'About BlueOne' })).toBeInTheDocument()
  })
})

describe('About Page — Mission Content & Spelling', () => {
  test('mentions redefining sailing holidays for families', () => {
    render(<AboutPage />)
    // Text is split: <strong>BlueOne</strong> + text node; match the text-node portion
    expect(
      screen.getByText(/is redefining the way families experience sailing holidays in Greece/)
    ).toBeInTheDocument()
  })

  test('mentions heart of a truly memorable holiday', () => {
    render(<AboutPage />)
    expect(screen.getByText(/heart of a truly memorable holiday/)).toBeInTheDocument()
  })

  test('mentions families and experiences at the center', () => {
    render(<AboutPage />)
    // "families" and "experiences" are each in their own <span>; check the parent paragraph
    // by looking for the shared text node that follows
    expect(
      screen.getByText((_, el) =>
        el?.tagName === 'P' &&
        (el?.textContent ?? '').includes('families') &&
        (el?.textContent ?? '').includes('experiences') &&
        (el?.textContent ?? '').includes('at the center')
      )
    ).toBeInTheDocument()
  })

  test('mentions curated sailing themes', () => {
    render(<AboutPage />)
    expect(screen.getByText(/curated sailing themes ensure every moment is meaningful/)).toBeInTheDocument()
  })

  test('renders welcome-aboard closing sentence', () => {
    render(<AboutPage />)
    expect(screen.getByText(/Welcome aboard a journey/)).toBeInTheDocument()
  })
})

describe('About Page — Values Section', () => {
  test('renders "Our Values" section heading', () => {
    render(<AboutPage />)
    expect(screen.getByRole('heading', { name: 'Our Values' })).toBeInTheDocument()
  })

  test('renders "Sustainable" value heading', () => {
    render(<AboutPage />)
    expect(screen.getByRole('heading', { name: 'Sustainable' })).toBeInTheDocument()
  })

  test('Sustainable value description mentions solar panels', () => {
    render(<AboutPage />)
    expect(screen.getByText(/Solar panels and eco-friendly practices/)).toBeInTheDocument()
  })

  test('renders "Family-First" value heading with correct hyphenation', () => {
    render(<AboutPage />)
    expect(screen.getByRole('heading', { name: 'Family-First' })).toBeInTheDocument()
  })

  test('Family-First description mentions families and memories', () => {
    render(<AboutPage />)
    expect(screen.getByText(/Designed for families to connect and create memories/)).toBeInTheDocument()
  })

  test('renders "Premium" value heading', () => {
    render(<AboutPage />)
    expect(screen.getByRole('heading', { name: 'Premium' })).toBeInTheDocument()
  })

  test('Premium value description mentions luxury amenities and professional crew', () => {
    render(<AboutPage />)
    expect(screen.getByText(/Luxury amenities with professional crew service/)).toBeInTheDocument()
  })
})

describe('About Page — Structure', () => {
  test('renders as main element', () => {
    render(<AboutPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  test('all three value cards are present', () => {
    render(<AboutPage />)
    const valueHeadings = ['Sustainable', 'Family-First', 'Premium']
    valueHeadings.forEach(name => {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    })
  })
})
