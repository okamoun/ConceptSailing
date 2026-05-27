import type { Metadata } from 'next';
import FinancialClient from './FinancialClient';

export const metadata: Metadata = {
  title: 'Financial Planning | Admin',
  robots: { index: false, follow: false },
};

export default function FinancialPage() {
  return <FinancialClient />;
}
