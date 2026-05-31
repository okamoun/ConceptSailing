import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import HomeClient from '../app/HomeClient'

jest.mock('../app/contexts/BlueOneContext', () => ({
  useBlueOneMode: () => ({
    isBlueOneMode: false,
    setIsBlueOneMode: jest.fn(),
    resetTheme: jest.fn(),
  }),
}))

jest.mock('../lib/reviews', () => ({
  getConfirmedReviews: jest.fn().mockResolvedValue([]),
}))

jest.mock('../app/components/StructuredData', () => ({
  LocalBusinessStructuredData: () => null,
  TouristTripStructuredData: () => null,
}))

jest.mock('../app/components/ReviewCard', () => ({
  __esModule: true,
  default: ({ review }: { review: { name: string } }) => (
    <div data-testid="review-card">{review.name}</div>
  ),
}))

describe('HomeClient — Hero Section', () => {
  beforeEach(() => jest.clearAllMocks())

  test('renders main heading with correct spelling', () => {
    render(<HomeClient />)
    // h1 contains both "BlueOne" and "Experiences" as spans
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('BlueOne')
    expect(h1).toHaveTextContent('Experiences')
  })

  test('renders hero description mentioning electric engines', () => {
    render(<HomeClient />)
    expect(screen.getByText(/electric engines in complete silence/)).toBeInTheDocument()
  })

  test('hero description mentions Fountaine Pajot catamaran', () => {
    render(<HomeClient />)
    expect(screen.getByText(/Fountaine Pajot Aura 51 catamaran/)).toBeInTheDocument()
  })

  test('Explore Experiences link points to /experiences', () => {
    render(<HomeClient />)
    const link = screen.getByRole('link', { name: /Explore Experiences/ })
    expect(link).toHaveAttribute('href', '/experiences')
  })

  test('Discover The Yacht link points to /blueone', () => {
    render(<HomeClient />)
    const link = screen.getByRole('link', { name: /Discover The Yacht/ })
    expect(link).toHaveAttribute('href', '/blueone')
  })
})

describe('HomeClient — Features Section', () => {
  beforeEach(() => jest.clearAllMocks())

  test('renders section heading "Why Choose BlueOne?"', () => {
    render(<HomeClient />)
    expect(screen.getByRole('heading', { name: 'Why Choose BlueOne?' })).toBeInTheDocument()
  })

  test('renders section subheading about luxury and silence', () => {
    render(<HomeClient />)
    expect(
      screen.getByText(/perfect blend of luxury, silence, and adventure/)
    ).toBeInTheDocument()
  })

  test('renders Premium Comfort feature card heading', () => {
    render(<HomeClient />)
    expect(screen.getByRole('heading', { name: 'Premium Comfort' })).toBeInTheDocument()
  })

  test('Premium Comfort description mentions spacious cabins', () => {
    render(<HomeClient />)
    expect(screen.getByText(/Spacious cabins, luxurious furnishings/)).toBeInTheDocument()
  })

  test('renders Silent Electric feature card heading', () => {
    render(<HomeClient />)
    expect(screen.getByRole('heading', { name: 'Silent Electric' })).toBeInTheDocument()
  })

  test('Silent Electric description mentions solar-powered', () => {
    render(<HomeClient />)
    expect(screen.getByText(/Solar-powered hybrid engines/)).toBeInTheDocument()
  })

  test('renders All-Inclusive feature card heading', () => {
    render(<HomeClient />)
    expect(screen.getByRole('heading', { name: 'All-Inclusive' })).toBeInTheDocument()
  })

  test('All-Inclusive description mentions professional crew', () => {
    render(<HomeClient />)
    expect(screen.getByText(/Professional crew, gourmet meals/)).toBeInTheDocument()
  })
})

describe('HomeClient — CTA Section', () => {
  beforeEach(() => jest.clearAllMocks())

  test('renders CTA heading with correct spelling', () => {
    render(<HomeClient />)
    expect(
      screen.getByRole('heading', { name: 'Ready for Your BlueOne Adventure?' })
    ).toBeInTheDocument()
  })

  test('renders CTA subtext about booking a sailing experience', () => {
    render(<HomeClient />)
    expect(
      screen.getByText(/Request a quote and we.ll craft a sailing experience/)
    ).toBeInTheDocument()
  })

  test('Booking Request link points to /booking', () => {
    render(<HomeClient />)
    const link = screen.getByRole('link', { name: 'Booking Request' })
    expect(link).toHaveAttribute('href', '/booking')
  })

  test('Contact Us link in CTA points to /contact', () => {
    render(<HomeClient />)
    const link = screen.getByRole('link', { name: 'Contact Us' })
    expect(link).toHaveAttribute('href', '/contact')
  })
})

describe('HomeClient — Reviews Section', () => {
  test('does not render reviews section when there are no reviews', async () => {
    render(<HomeClient />)
    await waitFor(() => {
      expect(screen.queryByText('What Our Guests Say')).not.toBeInTheDocument()
    })
  })

  test('renders reviews section heading and sub-label when reviews exist', async () => {
    const { getConfirmedReviews } = require('../lib/reviews')
    getConfirmedReviews.mockResolvedValueOnce([
      { id: '1', name: 'Alice', title: 'Fantastic!', description: 'Amazing trip', rating: 5 },
      { id: '2', name: 'Bob', title: 'Loved it', description: 'Will return', rating: 5 },
      { id: '3', name: 'Carol', title: 'Perfect', description: 'Best vacation', rating: 5 },
    ])
    render(<HomeClient />)
    await waitFor(() => {
      expect(screen.getByText('What Our Guests Say')).toBeInTheDocument()
    })
    expect(screen.getByText('Real experiences from real sailors')).toBeInTheDocument()
  })

  test('renders Testimonials label in reviews section', async () => {
    const { getConfirmedReviews } = require('../lib/reviews')
    getConfirmedReviews.mockResolvedValueOnce([
      { id: '1', name: 'Alice', title: 'Fantastic!', description: 'Amazing trip', rating: 5 },
    ])
    render(<HomeClient />)
    await waitFor(() => {
      expect(screen.getByText('Testimonials')).toBeInTheDocument()
    })
  })

  test('renders See All Reviews link pointing to /reviews', async () => {
    const { getConfirmedReviews } = require('../lib/reviews')
    getConfirmedReviews.mockResolvedValueOnce([
      { id: '1', name: 'Alice', title: 'Fantastic!', description: 'Great', rating: 5 },
    ])
    render(<HomeClient />)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /See All Reviews/ })
      expect(link).toHaveAttribute('href', '/reviews')
    })
  })

  test('renders at most 3 review cards', async () => {
    const { getConfirmedReviews } = require('../lib/reviews')
    getConfirmedReviews.mockResolvedValueOnce([
      { id: '1', name: 'A', title: 'T1', description: 'D1', rating: 5 },
      { id: '2', name: 'B', title: 'T2', description: 'D2', rating: 4 },
      { id: '3', name: 'C', title: 'T3', description: 'D3', rating: 5 },
      { id: '4', name: 'D', title: 'T4', description: 'D4', rating: 3 },
    ])
    render(<HomeClient />)
    await waitFor(() => {
      const cards = screen.getAllByTestId('review-card')
      expect(cards).toHaveLength(3)
    })
  })
})
