import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#008CFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://needelectroerp.vercel.app'),
  title: {
    default: 'NEED ELECTRO | Laptop, Computer, CCTV & Electrical Solutions in Moulvibazar',
    template: '%s | NEED ELECTRO',
  },
  description:
    'Premier destination for authentic laptops (HP, Dell, Lenovo), custom computers, CCTV camera security, electrical products, certified electrician services, and flexible laptop EMI in Moulvibazar, Sylhet, Bangladesh.',
  keywords: [
    'NEED ELECTRO',
    'Laptop shop in Moulvibazar',
    'Computer shop in Moulvibazar',
    'CCTV camera in Moulvibazar',
    'Electrician in Moulvibazar',
    'Electrical products in Moulvibazar',
    'Laptop EMI in Moulvibazar',
    'মৌলভীবাজার ল্যাপটপ',
    'মৌলভীবাজার কম্পিউটার দোকান',
    'মৌলভীবাজার সিসিটিভি',
    'Moulvibazar',
    'Sylhet',
    'Bangladesh',
  ],
  authors: [{ name: 'Amdadur Rahman' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NEED ELECTRO',
  },
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

import { CartProvider } from '@/src/services/cartContext';

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
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
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
