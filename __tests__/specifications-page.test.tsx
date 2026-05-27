import React from 'react'
import { render, screen } from '@testing-library/react'
import SpecificationsPage from '../app/specifications/page'

describe('Specifications Page — Page Header', () => {
  test('renders "BlueOne Specifications" as main heading', () => {
    render(<SpecificationsPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'BlueOne Specifications' })
    ).toBeInTheDocument()
  })

  test('renders subtitle with model name — correct spelling', () => {
    render(<SpecificationsPage />)
    expect(
      screen.getByText('Complete Technical Details - Fountaine Pajot Aura 51')
    ).toBeInTheDocument()
  })

  test('intro mentions first hybrid commercial catamaran in Greek waters', () => {
    render(<SpecificationsPage />)
    expect(
      screen.getByText(/first hybrid commercial catamaran operating in Greek waters/)
    ).toBeInTheDocument()
  })

  test('intro mentions luxury, sustainability and exceptional performance', () => {
    render(<SpecificationsPage />)
    expect(
      screen.getByText(/luxury, sustainability, and exceptional performance/)
    ).toBeInTheDocument()
  })
})

describe('Specifications Page — Quick Facts Section', () => {
  test('renders "Quick Facts" section heading', () => {
    render(<SpecificationsPage />)
    expect(screen.getByRole('heading', { name: 'Quick Facts' })).toBeInTheDocument()
  })

  test('renders Vessel Information card heading', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText(/Vessel Information/)).toBeInTheDocument()
  })

  test('Vessel Name is BlueOne', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Vessel Name:')).toBeInTheDocument()
    // BlueOne appears multiple times; just check it is present
    expect(screen.getAllByText('BlueOne').length).toBeGreaterThan(0)
  })

  test('Manufacturer is Fountaine Pajot', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Manufacturer:')).toBeInTheDocument()
    expect(screen.getAllByText('Fountaine Pajot').length).toBeGreaterThan(0)
  })

  test('Model is Aura 51', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Model:')).toBeInTheDocument()
    expect(screen.getByText('Aura 51')).toBeInTheDocument()
  })

  test('Year Built is 2025', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Year Built:')).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()
  })

  test('Type is Luxury Catamaran', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Luxury Catamaran')).toBeInTheDocument()
  })
})

describe('Specifications Page — Dimensions Card', () => {
  test('renders Dimensions card heading', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText(/Dimensions/)).toBeInTheDocument()
  })

  test('Length is 51 Feet', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('51 Feet')).toBeInTheDocument()
  })

  test('Beam (Width) is 26.70 Feet', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('26.70 Feet')).toBeInTheDocument()
  })

  test('Draft is 4.70 Feet', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('4.70 Feet')).toBeInTheDocument()
  })

  test('Max Capacity is 10 Persons', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('10 Persons')).toBeInTheDocument()
  })
})

describe('Specifications Page — Performance Card', () => {
  test('renders Performance card heading', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText(/Performance/)).toBeInTheDocument()
  })

  test('Cruising Speed is 7 Knots', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('7 Knots')).toBeInTheDocument()
  })

  test('Max Speed is 10 Knots', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('10 Knots')).toBeInTheDocument()
  })

  test('Engines are 2 x 70A', () => {
    render(<SpecificationsPage />)
    expect(screen.getAllByText('2 x 70A').length).toBeGreaterThan(0)
  })

  test('Generator is Kohler 32 kVA', () => {
    render(<SpecificationsPage />)
    expect(screen.getAllByText('Kohler 32 kVA').length).toBeGreaterThan(0)
  })
})

describe('Specifications Page — Accommodations Card', () => {
  test('renders Accommodations card heading', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText(/Accommodations/)).toBeInTheDocument()
  })

  test('Total Cabins is 7 (5 Guest + 2 Crew)', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('7 (5 Guest + 2 Crew)')).toBeInTheDocument()
  })

  test('Configuration is 5 Double + 2 Crew', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('5 Double + 2 Crew')).toBeInTheDocument()
  })
})

describe('Specifications Page — Sustainability Card', () => {
  test('renders Sustainability card heading', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText(/Sustainability/)).toBeInTheDocument()
  })

  test('Power System is Solar + Hybrid', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Solar + Hybrid')).toBeInTheDocument()
  })

  test('Internet is Starlink', () => {
    render(<SpecificationsPage />)
    expect(screen.getAllByText('Starlink').length).toBeGreaterThan(0)
  })

  test('Emissions are Zero Noise/Air', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Zero Noise/Air')).toBeInTheDocument()
  })
})

describe('Specifications Page — Crew Card', () => {
  test('renders Crew card heading', () => {
    render(<SpecificationsPage />)
    // The h3 has emoji + "Crew"; target the heading element specifically
    const crewHeading = screen.getByRole('heading', { name: /Crew/ })
    expect(crewHeading).toBeInTheDocument()
  })

  test('Captain is Professional', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Captain:')).toBeInTheDocument()
    expect(screen.getAllByText('Professional').length).toBeGreaterThanOrEqual(2)
  })

  test('Experience is 6+ years', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('6+ years')).toBeInTheDocument()
  })

  test('Cuisine is Mediterranean', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Mediterranean')).toBeInTheDocument()
  })
})

describe('Specifications Page — Complete Specifications Table', () => {
  test('renders "Complete Specifications" section heading', () => {
    render(<SpecificationsPage />)
    expect(screen.getByRole('heading', { name: 'Complete Specifications' })).toBeInTheDocument()
  })

  test('table has Category, Specification, Details column headers', () => {
    render(<SpecificationsPage />)
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Specification' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Details' })).toBeInTheDocument()
  })

  test('renders ONBOARD SYSTEMS & POWER section', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('ONBOARD SYSTEMS & POWER')).toBeInTheDocument()
  })

  test('renders AMENITIES section', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('AMENITIES')).toBeInTheDocument()
  })

  test('renders WATER SPORTS & ACTIVITIES section', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('WATER SPORTS & ACTIVITIES')).toBeInTheDocument()
  })

  test('Air Conditioning row shows full vessel coverage', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Full - Throughout vessel')).toBeInTheDocument()
  })

  test('Internet row shows Starlink High-Speed Internet', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Starlink High-Speed Internet')).toBeInTheDocument()
  })

  test('Power System row shows Solar Panels & Hybrid Systems', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Solar Panels & Hybrid Systems')).toBeInTheDocument()
  })

  test('Seabobs row shows premium underwater scooter', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('1 x Premium underwater scooter')).toBeInTheDocument()
  })

  test('Equipment row shows water sports list', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('SUP, Wakeboard, Kayak, Snorkel Gear')).toBeInTheDocument()
  })
})

describe('Specifications Page — Why Choose BlueOne Highlight Box', () => {
  test('renders "Why Choose BlueOne?" heading', () => {
    render(<SpecificationsPage />)
    expect(screen.getByRole('heading', { name: 'Why Choose BlueOne?' })).toBeInTheDocument()
  })

  test('renders Eco-Conscious Luxury bullet point', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Eco-Conscious Luxury:')).toBeInTheDocument()
  })

  test('Eco-Conscious Luxury text mentions first hybrid catamaran', () => {
    render(<SpecificationsPage />)
    expect(
      screen.getByText(/The first hybrid commercial catamaran in Greek waters/)
    ).toBeInTheDocument()
  })

  test('renders Expert Crew bullet point', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Expert Crew:')).toBeInTheDocument()
  })

  test('Expert Crew text mentions 6+ years maritime experience', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText(/6\+ years of maritime experience/)).toBeInTheDocument()
  })

  test('renders Modern Amenities bullet point', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText('Modern Amenities:')).toBeInTheDocument()
  })

  test('Modern Amenities text mentions Starlink internet', () => {
    render(<SpecificationsPage />)
    expect(screen.getByText(/Starlink internet/)).toBeInTheDocument()
  })
})

describe('Specifications Page — CTA Buttons', () => {
  test('renders "Ready for Your BlueOne Adventure?" CTA heading', () => {
    render(<SpecificationsPage />)
    expect(
      screen.getByRole('heading', { name: 'Ready for Your BlueOne Adventure?' })
    ).toBeInTheDocument()
  })

  test('renders Get a Quote link pointing to /contact', () => {
    render(<SpecificationsPage />)
    const link = screen.getByRole('link', { name: 'Get a Quote' })
    expect(link).toHaveAttribute('href', '/contact')
  })

  test('renders View More link pointing to /blueone', () => {
    render(<SpecificationsPage />)
    const link = screen.getByRole('link', { name: 'View More' })
    expect(link).toHaveAttribute('href', '/blueone')
  })
})
