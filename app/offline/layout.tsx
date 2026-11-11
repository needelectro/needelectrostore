import type { Metadata } from 'next';
import { buildNoIndexMetadata } from '@/lib/seoConfig';

export const metadata: Metadata = buildNoIndexMetadata(
  'Offline Mode',
  'You are currently offline. Reconnect to browse live NEED ELECTRO stock and prices.'
);

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

