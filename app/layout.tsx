import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#008CFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'NEED ELECTRO ERP — Trusted Electrical & Technological Solutions',
  description:
    'Commercial enterprise ERP, Point of Sale (POS), Laptop EMI & Installment Management, Inventory Control, and Accounting platform for NEED ELECTRO.',
  keywords: [
    'NEED ELECTRO',
    'ERP',
    'POS',
    'Laptop EMI',
    'Inventory',
    'Accounting',
    'Moulvibazar',
    'Bangladesh',
  ],
  authors: [{ name: 'Amdadur Rahman' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NEED ELECTRO ERP',
  },
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
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
