import type { Metadata } from 'next';
import AvailabilityClient from './AvailabilityClient';

export const metadata: Metadata = {
  title: 'Availability — BlueOne Luxury Yacht',
  description: 'Check the availability of BlueOne catamaran for your sailing experience in the Greek islands.',
};

export default function AvailabilityPage() {
  return <AvailabilityClient />;
}
