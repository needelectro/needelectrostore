import type { Metadata } from 'next';
import { buildNoIndexMetadata } from '@/lib/seoConfig';

export const metadata: Metadata = buildNoIndexMetadata(
  'Customer Account Portal',
  'Manage your NEED ELECTRO orders, saved delivery addresses, profile, and hardware reviews.'
);

export default function CustomerAccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

