import type { Metadata } from 'next';
import BlueOneClient from './BlueOneClient';

export const metadata: Metadata = {
  title: 'BlueOne Luxury Catamaran | Premium Yacht Charter Greece',
  description: 'Discover the BlueOne catamaran - a luxury 51-foot Fountaine Pajot yacht perfect for Greek island sailing. Premium amenities, spacious cabins, and exceptional service.',
  keywords: ['BlueOne catamaran', 'Fountaine Pajot Aura 51', 'luxury yacht Greece', 'Greek islands catamaran', 'premium sailing yacht', 'Athens luxury charter'],
  openGraph: {
    title: 'BlueOne Luxury Catamaran | Premium Yacht Charter Greece',
    description: 'Discover the BlueOne catamaran - a luxury 51-foot Fountaine Pajot yacht perfect for Greek island sailing.',
    type: 'website',
    url: 'https://blueone-yacht.com/blueone',
    images: [
      {
        url: '/images/boats/blueone/External_sailing.jpg',
        width: 1200,
        height: 630,
        alt: 'BlueOne Luxury Catamaran - Fountaine Pajot Aura 51',
      },
    ],
  },
};

export default function BlueOnePage() {
  return <BlueOneClient />;
}
