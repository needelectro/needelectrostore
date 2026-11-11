import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import {
  BUSINESS_INFO,
  DEFAULT_OG_IMAGE,
  buildGlobalSiteGraphSchema,
} from '@/lib/seoConfig';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bangla',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#008CFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const ROOT_DESCRIPTION =
  'Computer and laptop shop in Moulvibazar. Buy genuine HP, Dell, and Lenovo laptops, desktop PCs, monitors, and accessories with warranty at NEED ELECTRO.';

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_INFO.domain),
  title: {
    default: 'Computer & Laptop Shop in Moulvibazar | NEED ELECTRO',
    template: '%s | NEED ELECTRO',
  },
  description: ROOT_DESCRIPTION,
  keywords: [
    'NEED ELECTRO',
    'Computer shop in Moulvibazar',
    'Laptop shop in Moulvibazar',
    'Computer price in Moulvibazar',
    'Laptop price in Moulvibazar',
    'Desktop PC Moulvibazar',
    'Computer accessories in Moulvibazar',
    'HP EliteBook price in Bangladesh',
    'Laptop price in Bangladesh',
    'CCTV camera shop in Moulvibazar',
    'মৌলভীবাজার ল্যাপটপ',
    'মৌলভীবাজার কম্পিউটার দোকান',
  ],
  authors: [{ name: 'Amdadur Rahman' }],
  creator: 'NEED ELECTRO',
  publisher: 'NEED ELECTRO',
  category: 'technology',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : {}),
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BUSINESS_INFO.domain,
    siteName: 'NEED ELECTRO',
    title: 'Computer & Laptop Shop in Moulvibazar | NEED ELECTRO',
    description: ROOT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'NEED ELECTRO — Computer & Laptop Shop in Moulvibazar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Computer & Laptop Shop in Moulvibazar | NEED ELECTRO',
    description: ROOT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    creator: '@needelectro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NEED ELECTRO',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/logo-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

import { CartProvider } from '@/src/services/cartContext';
import { LanguageProvider } from '@/src/services/languageContext';
import { CustomerAuthProvider } from '@/src/services/customerAuthContext';
import { MobileBottomNav } from '@/src/components/customer/MobileBottomNav';
import { PwaInstallPrompt } from '@/src/components/pwa/PwaInstallPrompt';
import { VoiceWelcome } from '@/src/components/common/VoiceWelcome';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalSiteGraphSchema = buildGlobalSiteGraphSchema();

  return (
    <html
      lang="en"
      data-theme="light"
      className={`${plusJakartaSans.variable} ${hindSiliguri.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSiteGraphSchema) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var isStaff = window.location.pathname.startsWith('/admin');
                if (isStaff) {
                  var staffTheme = localStorage.getItem('needelectro_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', staffTheme);
                } else {
                  var custTheme = localStorage.getItem('customer_theme') || 'light';
                  document.documentElement.setAttribute('data-theme', custTheme);
                }
                var savedLang = localStorage.getItem('need_electro_language') || 'en';
                document.documentElement.setAttribute('lang', savedLang);
                if (savedLang === 'bn') {
                  document.documentElement.classList.add('font-bangla');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <CustomerAuthProvider>
            <CartProvider>
              {children}
              <MobileBottomNav />
              <PwaInstallPrompt />
              <VoiceWelcome />
            </CartProvider>
          </CustomerAuthProvider>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('NEED ELECTRO Service Worker active:', reg.scope);
                    reg.update().catch(function() {});
                  }).catch(function(err) {
                    console.warn('Service Worker registration skipped:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
