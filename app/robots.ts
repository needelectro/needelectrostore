// NEED ELECTRO ERP & Customer Website — Robots Configuration
import { MetadataRoute } from 'next';
import { BUSINESS_INFO } from '@/lib/seoConfig';

const PUBLIC_ALLOW_PATHS = [
  '/',
  '/shop',
  '/shop/*',
  '/laptops',
  '/laptops/*',
  '/computers',
  '/computers/*',
  '/cctv',
  '/cctv/*',
  '/electrical-products',
  '/electrical-products/*',
  '/computer-accessories',
  '/computer-accessories/*',
  '/networking',
  '/networking/*',
  '/smart-devices',
  '/smart-devices/*',
  '/electrical-services',
  '/services',
  '/services/*',
  '/laptop-emi',
  '/delivery',
  '/shipping-policy',
  '/return-refund-policy',
  '/warranty-policy',
  '/privacy-policy',
  '/terms-conditions',
  '/track-order',
  '/moulvibazar',
  '/sylhet',
  '/sreemangal',
  '/kulaura',
  '/rajnagar',
  '/blog',
  '/blog/*',
  '/product/*',
  '/about',
  '/contact',
  '/faq',
  '/locations',
  '/locations/*',
  '/guides',
  '/guides/*',
  '/api/feed/google-merchant',
  '/api/indexnow',
];

const DISALLOW_PATHS = [
  '/admin',
  '/admin/*',
  '/account',
  '/account/*',
  '/cart',
  '/cart/*',
  '/checkout',
  '/checkout/*',
  '/order-confirmation',
  '/order-confirmation/*',
  '/dashboard',
  '/dashboard/*',
  '/erp',
  '/erp/*',
  '/login',
  '/customer/profile',
  '/customer/orders',
  '/customer/dashboard',
  '/customer/settings',
  '/api/',
  '/*?*q=', // Disallow crawling internal query string searches to prevent thin faceted duplicate URLs
];

export default function robots(): MetadataRoute.Robots {
  const domain = BUSINESS_INFO.domain.replace(/\/+$/, '');
  const host = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: PUBLIC_ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: ['Bingbot', 'msnbot'],
        allow: PUBLIC_ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot'],
        allow: PUBLIC_ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },
    ],
    sitemap: `${domain}/sitemap.xml`,
    host: host,
  };
}

