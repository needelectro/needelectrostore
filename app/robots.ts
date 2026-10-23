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
  '/cctv',
  '/electrical-products',
  '/computer-accessories',
  '/networking',
  '/smart-devices',
  '/electrical-services',
  '/services',
  '/services/*',
  '/laptop-emi',
  '/delivery',
  '/shipping-policy',
  '/return-refund-policy',
  '/warranty-policy',
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
  '/api/admin',
  '/api/admin/*',
  '/api/erp',
  '/api/erp/*',
  '/api/auth',
  '/api/auth/*',
  '/api/upload',
  '/api/upload/*',
  '/api/pos',
  '/api/pos/*',
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

