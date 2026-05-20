import { type Metadata } from 'next';
import ProposalClient from './ProposalClient';

export const metadata: Metadata = {
  title: 'Charter Proposal | BlueOne Luxury Yacht Charters',
  description: 'Your personalised yacht charter proposal from BlueOne.',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ProposalPage({ params }: Props) {
  const { token } = await params;
  return <ProposalClient token={token} />;
}
