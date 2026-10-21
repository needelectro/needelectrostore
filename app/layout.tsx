import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#008CFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.needelectro.store'),
  title: {
    default: 'NEED ELECTRO | Laptop, Computer, CCTV & Electrical Store in Bangladesh',
    template: '%s | NEED ELECTRO',
  },
  description:
    'Premier destination for authentic laptops (HP, Dell, Lenovo), custom computers, CCTV security camera systems, electrical products, certified electrician services, and laptop EMI in Moulvibazar, Sylhet & nationwide across Bangladesh.',
  keywords: [
    'NEED ELECTRO',
    'NEED ELECTRO SHOP',
    'Computer shop in Moulvibazar',
    'Computer price in Moulvibazar',
    'Laptop shop in Moulvibazar',
    'Laptop price in Moulvibazar',
    'CCTV camera shop in Moulvibazar',
    'CCTV camera price in Bangladesh',
    'Tech gadgets in Moulvibazar',
    'Tech gadgets price in Bangladesh',
    'Laptop price in Bangladesh',
    'HP EliteBook price in Bangladesh',
    'Desktop computer price in Bangladesh',
    'Computer accessories in Bangladesh',
    'Electrical shop online Bangladesh',
    'Electrical services in Moulvibazar',
    'Electrician service in Bangladesh',
    'CCTV installation service',
    'Laptop and computer servicing',
    'Networking and Wi-Fi installation',
    'Electrical products online Bangladesh',
    'Genuine laptop with warranty in Bangladesh',
    'Moulvibazar',
    'Sylhet',
    'Bangladesh',
    'মৌলভীবাজার ল্যাপটপ',
    'মৌলভীবাজার কম্পিউটার দোকান',
    'মৌলভীবাজার সিসিটিভি',
  ],
  authors: [{ name: 'Amdadur Rahman' }],
  creator: 'NEED ELECTRO',
  publisher: 'NEED ELECTRO',
  category: 'technology',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.needelectro.store',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.needelectro.store',
    siteName: 'NEED ELECTRO',
    title: 'NEED ELECTRO | Laptop, Computer, CCTV & Electrical Store in Bangladesh',
    description:
      'Premier destination for authentic laptops (HP, Dell, Lenovo), custom computers, CCTV security camera systems, electrical products, certified electrician services, and laptop EMI in Moulvibazar, Sylhet & nationwide across Bangladesh.',
    images: [
      {
        url: '/banners/need-electro-laptops-flagship.jpg',
        width: 1200,
        height: 630,
        alt: 'NEED ELECTRO - Authentic Laptops, CCTV & Electrical Solutions',
      },
      {
        url: '/logo-dark-transparent.png',
        width: 800,
        height: 600,
        alt: 'NEED ELECTRO Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEED ELECTRO | Laptop, Computer, CCTV & Electrical Store in Bangladesh',
    description:
      'Premier destination for authentic laptops, computers, CCTV security cameras & electrician services in Moulvibazar, Sylhet.',
    images: ['/banners/need-electro-laptops-flagship.jpg'],
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
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
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
