import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | BlueOne Luxury Yacht Charters',
  description: 'Get in touch with BlueOne Luxury Yacht Charters. Plan your dream Greek sailing holiday, ask about availability, or request a custom yacht charter experience in Greece.',
  keywords: ['contact BlueOne', 'yacht charter enquiry', 'book sailing Greece', 'Greek yacht charter contact', 'sailing holiday enquiry', 'Alimos Marina Athens'],
  openGraph: {
    title: 'Contact BlueOne Luxury Yacht Charters',
    description: 'Get in touch to plan your dream Greek sailing holiday. Bespoke yacht charters, island hopping, and luxury experiences aboard the BlueOne catamaran.',
    type: 'website',
    url: 'https://www.blueoneyacht.com/contact',
    images: [
      {
        url: '/images/boats/blueone/External_sailing.jpg',
        width: 1200,
        height: 630,
        alt: 'BlueOne Luxury Catamaran - Contact Us',
      },
    ],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
