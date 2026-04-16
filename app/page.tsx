import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'BlueOne Luxury Yacht Charters | Sailing Adventures in Greece',
  description: 'Experience luxury sailing adventures in Greece aboard the BlueOne catamaran. Premium yacht charters with island hopping, sunset cruises, and all-inclusive experiences.',
  keywords: ['luxury yacht charter Greece', 'BlueOne catamaran', 'sailing holidays Greece', 'Greek islands sailing', 'premium yacht experiences', 'Athens yacht charter'],
  openGraph: {
    title: 'BlueOne Luxury Yacht Charters | Sailing Adventures in Greece',
    description: 'Experience luxury sailing adventures in Greece aboard the BlueOne catamaran. Premium yacht charters with island hopping and sunset cruises.',
    type: 'website',
    url: 'https://www.blueoneyacht.com',
    images: [
      {
        url: '/images/boats/blueone/External_sailing.jpg',
        width: 1200,
        height: 630,
        alt: 'BlueOne Luxury Catamaran Sailing in Greece',
      },
    ],
  },
};

export default function Home() {
  return <HomeClient />;
}
