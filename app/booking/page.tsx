import type { Metadata } from 'next';
import BookingClient from './booking-client';

export const metadata: Metadata = {
  title: 'Book Your BlueOne Yacht Charter | Luxury Sailing Greece',
  description: 'Reserve your luxury sailing adventure in Greece. Book the BlueOne catamaran for island hopping, sunset cruises, and premium yacht experiences.',
  keywords: ['book yacht Greece', 'BlueOne reservation', 'luxury sailing booking', 'Greek islands charter', 'catamaran rental Greece', 'Athens yacht booking'],
  openGraph: {
    title: 'Book Your BlueOne Yacht Charter | Luxury Sailing Greece',
    description: 'Reserve your luxury sailing adventure in Greece. Book the BlueOne catamaran for island hopping and premium yacht experiences.',
    type: 'website',
    url: 'https://www.blueoneyacht.com/booking',
    images: [
      {
        url: '/images/boats/blueone/External_sailing.jpg',
        width: 1200,
        height: 630,
        alt: 'BlueOne Luxury Catamaran - Book Your Charter',
      },
    ],
  },
};

export default function BookingPage() {
  return <BookingClient />;
}
