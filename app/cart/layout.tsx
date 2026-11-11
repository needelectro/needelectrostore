import type { Metadata } from 'next';
import { buildNoIndexMetadata } from '@/lib/seoConfig';

export const metadata: Metadata = buildNoIndexMetadata(
  'Shopping Cart',
  'Review items in your NEED ELECTRO shopping cart before Cash on Delivery checkout.'
);

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

