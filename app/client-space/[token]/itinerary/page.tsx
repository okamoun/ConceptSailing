import { type Metadata } from 'next';
import ItineraryBuilderClient from './ItineraryBuilderClient';

export const metadata: Metadata = {
  title: 'Itinerary Builder | BlueOne Luxury Yacht Charters',
  description: 'Build and personalise your sailing itinerary.',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ItineraryPage({ params }: Props) {
  const { token } = await params;
  return <ItineraryBuilderClient token={token} />;
}
