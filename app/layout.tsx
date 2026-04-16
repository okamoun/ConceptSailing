import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import Script from "next/script"
import { BlueOneProvider } from "./contexts/BlueOneContext"
import Navigation from "./components/Navigation"
import Footer from "./components/Footer"
import "./globals.css"
import "./animations.css"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.blueoneyacht.com'),
  title: {
    default: 'BlueOne Luxury Yacht Charters | Sailing Adventures in Greece',
    template: '%s | BlueOne Luxury Yacht Charters'
  },
  description: 'Experience luxury sailing adventures in Greece aboard the BlueOne catamaran. Premium yacht charters with island hopping, sunset cruises, and all-inclusive experiences.',
  keywords: ['luxury yacht charter Greece', 'BlueOne catamaran', 'sailing holidays Greece', 'Greek islands sailing', 'premium yacht experiences', 'Athens yacht charter'],
  authors: [{ name: 'BlueOne Luxury Yacht Charters' }],
  creator: 'BlueOne Luxury Yacht Charters',
  publisher: 'BlueOne Luxury Yacht Charters',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.blueoneyacht.com',
    siteName: 'BlueOne Luxury Yacht Charters',
    title: 'BlueOne Luxury Yacht Charters | Sailing Adventures in Greece',
    description: 'Experience luxury sailing adventures in Greece aboard the BlueOne catamaran. Premium yacht charters with island hopping, sunset cruises, and all-inclusive experiences.',
    images: [
      {
        url: '/images/boats/blueone/External_sailing.jpg',
        width: 1200,
        height: 630,
        alt: 'BlueOne Luxury Catamaran Sailing in Greece',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlueOne Luxury Yacht Charters | Sailing Adventures in Greece',
    description: 'Experience luxury sailing adventures in Greece aboard the BlueOne catamaran. Premium yacht charters with island hopping, sunset cruises, and all-inclusive experiences.',
    images: ['/images/boats/blueone/External_sailing.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TouristInformationCenter',
      '@id': 'https://www.blueoneyacht.com/#organization',
      name: 'BlueOne Luxury Yacht Charters',
      url: 'https://www.blueoneyacht.com',
      logo: 'https://www.blueoneyacht.com/images/boats/blueone/logo_blueone.png',
      image: 'https://www.blueoneyacht.com/images/boats/blueone/External_sailing.jpg',
      description: 'Premium luxury yacht charter company offering curated sailing experiences across the Greek islands aboard the BlueOne Fountaine Pajot Aura 51 catamaran.',
      telephone: '+33675604532',
      email: 'contact@nj3cruises.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Alimos Marina',
        addressLocality: 'Athens',
        addressCountry: 'GR',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Greece',
      },
      priceRange: '$$$',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.blueoneyacht.com/#website',
      url: 'https://www.blueoneyacht.com',
      name: 'BlueOne Luxury Yacht Charters',
      publisher: { '@id': 'https://www.blueoneyacht.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.blueoneyacht.com/experiences?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen bg-blue-900">
        <BlueOneProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </BlueOneProvider>
      </body>
    </html>
  )
}
