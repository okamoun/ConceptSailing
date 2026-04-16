import type { Metadata } from 'next';
import DestinationsClient from './DestinationsClient';

export const metadata: Metadata = {
  title: 'Greek Islands Sailing Destinations | BlueOne Yacht Charters',
  description: 'Explore stunning Greek islands destinations aboard BlueOne. From Rhodes to hidden coves, discover the best sailing spots in the Aegean Sea with luxury yacht charters.',
  keywords: ['Greek islands destinations', 'sailing Greece', 'Rhodes yacht charter', 'Aegean Sea sailing', 'Greek island hopping', 'luxury sailing destinations'],
  openGraph: {
    title: 'Greek Islands Sailing Destinations | BlueOne Yacht Charters',
    description: 'Explore stunning Greek islands destinations aboard BlueOne. From Rhodes to hidden coves, discover the best sailing spots in the Aegean Sea.',
    type: 'website',
    url: 'https://www.blueoneyacht.com/destinations',
    images: [
      {
        url: '/destinations/Rhodes.jpg',
        width: 1200,
        height: 630,
        alt: 'Greek Islands Sailing Destinations - BlueOne Yacht Charters',
      },
    ],
  },
};

export default function DestinationsPage() {
  return <DestinationsClient />;
}
