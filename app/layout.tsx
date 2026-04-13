import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import { BlueOneProvider } from "./contexts/BlueOneContext"
import Navigation from "./components/Navigation"
import Footer from "./components/Footer"
import "./globals.css"
import "./animations.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://blueone-yacht.com'),
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
    url: 'https://blueone-yacht.com',
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="canonical" href="https://blueone-yacht.com" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <BlueOneProvider>
          <Navigation />
          <main className="pt-6">{children}</main>
          <Footer />
        </BlueOneProvider>
      </body>
    </html>
  )
}
