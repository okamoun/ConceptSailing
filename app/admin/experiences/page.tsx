import type { Metadata } from 'next';
import ExperiencesListClient from './ExperiencesListClient';

export const metadata: Metadata = {
  title: 'Experiences Manager | Admin',
  robots: { index: false, follow: false },
};

export default function ExperiencesAdminPage() {
  return <ExperiencesListClient />;
}
