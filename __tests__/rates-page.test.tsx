import React from 'react'
import { render, screen } from '@testing-library/react'
import RatesPage from '../app/rates/page'

describe('Rates Page — Page Header', () => {
  test('renders "Charter Rates" as main heading', () => {
    render(<RatesPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Charter Rates' })).toBeInTheDocument()
  })

  test('renders subtitle with year and crew info — correct spelling', () => {
    render(<RatesPage />)
    expect(
      screen.getByText('Summer 2026 weekly rates — all-inclusive of professional crew')
    ).toBeInTheDocument()
  })

  test('renders Back to The Yacht link', () => {
    render(<RatesPage />)
    const link = screen.getByRole('link', { name: /Back to The Yacht/ })
    expect(link).toHaveAttribute('href', '/blueone')
  })
})

describe('Rates Page — Season Rate Cards', () => {
  test('renders High Season card', () => {
    render(<RatesPage />)
    expect(screen.getByText('High Season')).toBeInTheDocument()
  })

  test('High Season shows July & August months', () => {
    render(<RatesPage />)
    expect(screen.getByText('July & August')).toBeInTheDocument()
  })

  test('High Season rate is €24,000', () => {
    render(<RatesPage />)
    expect(screen.getByText('€24,000')).toBeInTheDocument()
  })

  test('renders Mid Season card', () => {
    render(<RatesPage />)
    expect(screen.getByText('Mid Season')).toBeInTheDocument()
  })

  test('Mid Season shows June & September months', () => {
    render(<RatesPage />)
    expect(screen.getByText('June & September')).toBeInTheDocument()
  })

  test('Mid Season rate is €21,000', () => {
    render(<RatesPage />)
    expect(screen.getByText('€21,000')).toBeInTheDocument()
  })

  test('renders Low Season card', () => {
    render(<RatesPage />)
    expect(screen.getByText('Low Season')).toBeInTheDocument()
  })

  test('Low Season shows All other months', () => {
    render(<RatesPage />)
    expect(screen.getByText('All other months')).toBeInTheDocument()
  })

  test('Low Season rate is €18,000', () => {
    render(<RatesPage />)
    expect(screen.getByText('€18,000')).toBeInTheDocument()
  })

  test('each season card shows "per week" label', () => {
    render(<RatesPage />)
    const perWeekLabels = screen.getAllByText('per week')
    expect(perWeekLabels).toHaveLength(3)
  })
})

describe('Rates Page — Expenses & Fees', () => {
  test('renders MYBA expenses note', () => {
    render(<RatesPage />)
    expect(screen.getByText('All rates are Plus Expenses (MYBA terms)')).toBeInTheDocument()
  })

  test('renders VAT and APA disclaimer', () => {
    render(<RatesPage />)
    expect(screen.getByText(/VAT 13%.*APA 25% apply on top of the base rate/)).toBeInTheDocument()
  })

  test('renders Relocation Fees section heading', () => {
    render(<RatesPage />)
    expect(screen.getByText(/Relocation Fees/)).toBeInTheDocument()
  })

  test('Cyclades relocation fee is €1,000', () => {
    render(<RatesPage />)
    expect(screen.getByText('Cyclades :')).toBeInTheDocument()
    const fees = screen.getAllByText('€1,000')
    expect(fees.length).toBeGreaterThanOrEqual(3)
  })

  test('Sporades relocation fee is listed', () => {
    render(<RatesPage />)
    expect(screen.getByText('Sporades :')).toBeInTheDocument()
  })

  test('Ionian relocation fee is listed', () => {
    render(<RatesPage />)
    expect(screen.getByText('Ionian :')).toBeInTheDocument()
  })

  test('renders Santorini extra day note', () => {
    render(<RatesPage />)
    expect(
      screen.getByText(/Charters with embarkation\/disembarkation in Santorini/)
    ).toBeInTheDocument()
  })
})

describe('Rates Page — Base Port & Area', () => {
  test('renders Base Port & Area section heading', () => {
    render(<RatesPage />)
    expect(screen.getByText(/Base Port.*Area/)).toBeInTheDocument()
  })

  test('renders Nea Peramos as base port', () => {
    render(<RatesPage />)
    const nea = screen.getAllByText('Nea Peramos, Athens, Greece')
    expect(nea.length).toBeGreaterThanOrEqual(1)
  })

  test('renders Summer Base Port label', () => {
    render(<RatesPage />)
    expect(screen.getByText('Summer Base Port')).toBeInTheDocument()
  })

  test('renders Operating Area label', () => {
    render(<RatesPage />)
    expect(screen.getByText('Operating Area')).toBeInTheDocument()
  })

  test('renders Greece as operating area', () => {
    render(<RatesPage />)
    expect(screen.getByText('Greece (Summer & Winter)')).toBeInTheDocument()
  })
})

describe('Rates Page — Experience Package Section', () => {
  test('renders "All-Inclusive Option" badge', () => {
    render(<RatesPage />)
    expect(screen.getByText('All-Inclusive Option')).toBeInTheDocument()
  })

  test('renders "Curated Experience Packages" heading', () => {
    render(<RatesPage />)
    expect(
      screen.getByRole('heading', { name: 'Curated Experience Packages' })
    ).toBeInTheDocument()
  })

  test('renders Custom Itinerary package card', () => {
    render(<RatesPage />)
    expect(screen.getByRole('heading', { name: 'Custom Itinerary' })).toBeInTheDocument()
  })

  test('Custom Itinerary description mentions day-by-day route', () => {
    render(<RatesPage />)
    expect(screen.getByText(/A day-by-day route designed around your interests/)).toBeInTheDocument()
  })

  test('renders Curated Activities package card', () => {
    render(<RatesPage />)
    expect(screen.getByRole('heading', { name: 'Curated Activities' })).toBeInTheDocument()
  })

  test('renders Full Board & Beverages package card', () => {
    render(<RatesPage />)
    expect(screen.getByRole('heading', { name: 'Full Board & Beverages' })).toBeInTheDocument()
  })

  test('Full Board description mentions Chef Andreas', () => {
    render(<RatesPage />)
    expect(screen.getByText(/Chef Andreas/)).toBeInTheDocument()
  })

  test('renders Browse Experiences link pointing to /experiences', () => {
    render(<RatesPage />)
    const link = screen.getByRole('link', { name: /Browse Experiences/ })
    expect(link).toHaveAttribute('href', '/experiences')
  })

  test('renders Request a Custom Package link', () => {
    render(<RatesPage />)
    expect(
      screen.getByRole('link', { name: 'Request a Custom Package' })
    ).toBeInTheDocument()
  })

  test('mentions Greek Heritage Explorer experience', () => {
    render(<RatesPage />)
    expect(screen.getByText(/Greek Heritage Explorer/)).toBeInTheDocument()
  })

  test('mentions Culinary Traditions experience', () => {
    render(<RatesPage />)
    expect(screen.getByText(/Culinary Traditions/)).toBeInTheDocument()
  })
})

describe('Rates Page — CTA', () => {
  test('renders Request a Booking CTA link', () => {
    render(<RatesPage />)
    const link = screen.getByRole('link', { name: /Request a Booking/ })
    expect(link).toHaveAttribute('href', '/booking?boat=BlueOne')
  })
})

describe('Rates Page — VAT Legal Disclaimer', () => {
  test('renders VAT legislative disclaimer text', () => {
    render(<RatesPage />)
    expect(
      screen.getByText(/VAT rate is determined by applicable tax legislation/)
    ).toBeInTheDocument()
  })
})
