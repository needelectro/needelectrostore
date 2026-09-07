import type { Metadata } from 'next';
import './globals.css';

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
  icons: {
    icon: '/favicon.ico',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
