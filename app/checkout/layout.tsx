import type { Metadata } from 'next';
import { buildNoIndexMetadata } from '@/lib/seoConfig';

export const metadata: Metadata = buildNoIndexMetadata(
  'Secure Checkout',
  'Complete your NEED ELECTRO order with Cash on Delivery across Bangladesh.'
);

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

