import type { Metadata } from 'next';
import { buildNoIndexMetadata } from '@/lib/seoConfig';

export const metadata: Metadata = buildNoIndexMetadata(
  'Order Confirmation',
  'Your NEED ELECTRO order confirmation and invoice summary.'
);

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

