import { type Metadata } from 'next';
import ClientSpaceClient from './ClientSpaceClient';

export const metadata: Metadata = {
  title: 'Holiday Preparation | BlueOne Luxury Yacht Charters',
  description: 'Prepare for your upcoming sailing holiday.',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ClientSpacePage({ params }: Props) {
  const { token } = await params;
  return <ClientSpaceClient token={token} />;
}
