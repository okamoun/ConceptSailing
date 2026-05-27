import { type Metadata } from 'next';
import SummaryClient from './SummaryClient';

export const metadata: Metadata = {
  title: 'Preference Summary | BlueOne Luxury Yacht Charters',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SummaryPage({ params }: Props) {
  const { token } = await params;
  return <SummaryClient token={token} />;
}
