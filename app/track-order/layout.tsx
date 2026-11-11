import type { Metadata } from 'next';
import { buildNoIndexMetadata } from '@/lib/seoConfig';

export const metadata: Metadata = buildNoIndexMetadata(
  'Track Your Order Live',
  'Track your NEED ELECTRO laptop, hardware, or courier parcel dispatch status in real time.'
);

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

