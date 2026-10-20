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
          '/shop/',
          '/shop/*',
          '/laptops/',
          '/laptops/*',
          '/computers/',
          '/cctv/',
          '/electrical-products/',
          '/computer-accessories/',
          '/networking/',
          '/smart-devices/',
          '/electrical-services/',
          '/services/',
          '/services/*',
          '/locations/*',
          '/laptop-emi/',
          '/delivery/',
          '/shipping-policy/',
          '/return-refund-policy/',
          '/warranty-policy/',
          '/moulvibazar/',
          '/sylhet/',
          '/sreemangal/',
          '/kulaura/',
          '/rajnagar/',
          '/blog/',
          '/blog/*',
          '/product/*',
          '/about/',
          '/contact/',
          '/faq/',
          '/api/feed/google-merchant',
        ],
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/checkout/',
          '/checkout/*',
          '/order-confirmation/',
          '/order-confirmation/*',
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
