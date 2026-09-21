// NEED ELECTRO ERP & Customer Website — Robots Configuration
import { MetadataRoute } from 'next';
import { BUSINESS_INFO } from '@/lib/seoConfig';

export default function robots(): MetadataRoute.Robots {
  const domain = BUSINESS_INFO.domain.replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/laptops/',
          '/laptops/*',
          '/computers/',
          '/cctv/',
          '/electrical-products/',
          '/computer-accessories/',
          '/networking/',
          '/smart-devices/',
          '/electrical-services/',
          '/services/*',
          '/laptop-emi/',
          '/delivery/',
          '/moulvibazar/',
          '/sreemangal/',
          '/kulaura/',
          '/rajnagar/',
          '/blog/',
          '/blog/*',
          '/product/*',
          '/about/',
          '/contact/',
          '/faq/',
        ],
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/dashboard/',
          '/dashboard/*',
          '/erp/',
          '/erp/*',
          '/login/',
          '/account/private/',
          '/_next/',
          '/*.json$',
        ],
      },
    ],
    sitemap: `${domain}/sitemap.xml`,
    host: domain,
  };
}
