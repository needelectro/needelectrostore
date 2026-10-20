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
import { MobileBottomNav } from '@/src/components/customer/MobileBottomNav';

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
          <MobileBottomNav />
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
