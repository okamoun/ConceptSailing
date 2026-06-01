import type { Metadata } from 'next';
import ThemesAdminClient from './ThemesAdminClient';

export const metadata: Metadata = {
  title: 'Themes Manager | Admin',
  robots: { index: false, follow: false },
};

export default function ThemesAdminPage() {
  return <ThemesAdminClient />;
}
