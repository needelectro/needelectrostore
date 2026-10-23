export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from 'next';
import AdminLoginClient from './AdminLoginClient';

export const metadata: Metadata = {
  title: 'Admin Portal Login | NEED ELECTRO ERP',
  description: 'Secure enterprise administrative access for NEED ELECTRO management and staff.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
