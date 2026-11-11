import type { Metadata } from 'next';
import { buildNoIndexMetadata } from '@/lib/seoConfig';

export const metadata: Metadata = buildNoIndexMetadata(
  'ERP Admin Portal',
  'Restricted NEED ELECTRO internal ERP and inventory administration workspace.'
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

