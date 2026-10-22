import type { Metadata } from 'next';
import { generateSeoMetadata } from '@/lib/seoConfig';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Contact Us | NEED ELECTRO Bangladesh',
    description:
      'Get in touch with NEED ELECTRO for laptop sales, CCTV setups, electrical products and services in Bangladesh. Hotline: +880 1733-983752.',
    path: '/contact',
    keywords: [
      'Contact NEED ELECTRO',
      'NEED ELECTRO hotline',
      'Laptop shop Moulvibazar contact',
      'Electrician booking contact',
      'CCTV installation contact',
    ],
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
