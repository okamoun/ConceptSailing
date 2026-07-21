import { type Metadata } from 'next';
import ManifestClient from './ManifestClient';

export const metadata: Metadata = {
  title: 'Crew Manifest | BlueOne Luxury Yacht Charters',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ManifestPage({ params }: Props) {
  const { token } = await params;
  return <ManifestClient token={token} />;
}
