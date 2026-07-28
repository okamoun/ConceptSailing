import { type Metadata } from 'next';
import ItineraryReportClient from './ItineraryReportClient';

export const metadata: Metadata = {
  title: 'Itinerary Report | BlueOne Luxury Yacht Charters',
  description: 'Your personalised sailing itinerary.',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ItineraryReportPage({ params }: Props) {
  const { token } = await params;
  return <ItineraryReportClient token={token} />;
}
