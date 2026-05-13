import type { Metadata } from 'next';
import BookingSummaryClient from './BookingSummaryClient';

export const metadata: Metadata = {
  title: 'Booking Summary | Admin',
  robots: { index: false, follow: false },
};

export default function BookingSummaryPage() {
  return <BookingSummaryClient />;
}
