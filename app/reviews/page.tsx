import type { Metadata } from 'next';
import ReviewsClient from './ReviewsClient';

export const metadata: Metadata = {
  title: 'Guest Reviews | BlueOne Luxury Yacht Charters',
  description: 'Read what our guests say about their sailing experiences aboard BlueOne in the Greek islands.',
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}
