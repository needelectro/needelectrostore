import React from 'react';
import type { Metadata } from 'next';
import {
  BUSINESS_INFO,
  generateSeoMetadata,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
} from '@/lib/seoConfig';
import ClientApp from './ClientApp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'NEED ELECTRO | Laptop, Computer, CCTV & Electrical Solutions in Moulvibazar',
    description:
      'Premier destination for authentic laptops (HP, Dell, Lenovo), custom computers, CCTV camera security, electrical products, certified electrician services, and flexible laptop EMI in Moulvibazar, Sylhet, Bangladesh.',
    path: '/',
    keywords: [
      'Laptop seller in Moulvibazar',
      'Laptop shop in Moulvibazar',
      'Computer shop in Moulvibazar',
      'Laptop price in Moulvibazar',
      'Used laptop in Moulvibazar',
      'HP laptop in Moulvibazar',
      'Dell laptop in Moulvibazar',
      'Lenovo laptop in Moulvibazar',
      'CCTV camera in Moulvibazar',
      'CCTV installation in Moulvibazar',
      'Electrical service in Moulvibazar',
      'Electrician in Moulvibazar',
      'Electrical products in Moulvibazar',
      'Computer accessories in Moulvibazar',
      'Networking products in Moulvibazar',
      'Laptop EMI in Moulvibazar',
      'Laptop delivery in Bangladesh',
      'Laptop shop Bangladesh',
      'Computer shop Bangladesh',
      'CCTV shop Bangladesh',
      'Electrical service Bangladesh',
      'Technology products Bangladesh',
    ],
  });
}

export default function HomePage() {
  const localBusinessSchema = buildLocalBusinessSchema();
  const organizationSchema = buildOrganizationSchema();
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_INFO.name,
    url: BUSINESS_INFO.domain,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BUSINESS_INFO.domain}/api/catalog/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Single Semantic Primary H1 for the Homepage */}
      <h1 className="sr-only">
        Trusted Electrical & Technological Solutions in Moulvibazar — NEED ELECTRO
      </h1>
      <ClientApp />
    </>
  );
}
