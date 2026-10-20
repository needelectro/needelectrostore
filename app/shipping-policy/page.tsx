import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { Truck, ShieldCheck, Clock, MapPin, CheckCircle2, Phone, PackageCheck, ArrowRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Shipping & Delivery Policy | Cash on Delivery Across Bangladesh | NEED ELECTRO',
    description:
      'Official shipping and delivery terms for NEED ELECTRO. Flat ৳60 shipping within Sylhet Division, ৳120 nationwide to all 64 districts. Open-box inspection before payment.',
    path: '/shipping-policy',
    keywords: [
      'NEED ELECTRO shipping policy',
      'Laptop delivery Bangladesh',
      'Cash on delivery laptop',
      'Delivery charges Moulvibazar',
      'Open box delivery Bangladesh',
    ],
  });
}

export default function ShippingPolicyPage() {
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shipping Policy', path: '/shipping-policy' },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-10 px-4 bg-gradient-to-b from-[#081621] to-[#040e19] text-white">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0084d6]/20 border border-[#0084d6]/40 text-sky-300">
            <Truck size={13} />
            <span>Nationwide Logistics &amp; Courier Terms</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            At {BUSINESS_INFO.name}, we partner with top-tier courier networks to guarantee secure, rapid delivery to your doorstep across all 64 districts in Bangladesh with full package insurance and open-box verification.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8 text-xs sm:text-sm">
        {/* Rates Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={16} className="text-[#0084d6]" />
            <span>Delivery Rates &amp; Estimated Transit Times</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Coverage Region</th>
                  <th className="py-3 px-4">Delivery Rate</th>
                  <th className="py-3 px-4">Estimated Transit Time</th>
                  <th className="py-3 px-4">Payment Methods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">Moulvibazar Town (Local)</td>
                  <td className="py-3.5 px-4 font-bold text-[#0084d6]">৳60 (Free on Select Laptops)</td>
                  <td className="py-3.5 px-4">Same-Day (2 – 4 Hours)</td>
                  <td className="py-3.5 px-4">Cash on Delivery, bKash, Showroom POS</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">Sylhet Division (Habiganj, Sunamganj, Sylhet)</td>
                  <td className="py-3.5 px-4 font-bold text-[#0084d6]">৳60</td>
                  <td className="py-3.5 px-4">24 – 48 Hours</td>
                  <td className="py-3.5 px-4">Cash on Delivery, bKash, Nagad</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">All Other Districts Across Bangladesh</td>
                  <td className="py-3.5 px-4 font-bold text-[#0084d6]">৳120</td>
                  <td className="py-3.5 px-4">48 – 72 Hours</td>
                  <td className="py-3.5 px-4">Cash on Delivery, Bank Transfer, bKash</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Box Verification */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800/80 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <PackageCheck size={18} />
            <span>Open-Box Verification Guarantee</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
            Customers have the full right to open and inspect the physical condition of laptops, CCTV kits, and electronics in front of the courier rider before paying the remaining cash amount. If any physical transit damage is observed, you can refuse the parcel immediately with zero cancellation fee.
          </p>
        </div>

        {/* Courier Partners */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Authorized Logistics Partners</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            We partner with Bangladesh’s leading courier networks including Steadfast Courier, Pathao Courier, RedX Logistics, and Sundarban Courier Service. Every consignment generates a digital tracking number that you can trace 24/7 on our live <Link href="/track-order" className="text-[#0084d6] font-bold underline">Order Tracking Portal</Link>.
          </p>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
