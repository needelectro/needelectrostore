import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { Truck, ShieldCheck, CheckCircle2, Phone, MapPin, Clock, PackageCheck } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Laptop & Technology Delivery in Moulvibazar & Bangladesh | NEED ELECTRO',
    description: 'Learn about NEED ELECTRO delivery policies. Same-day hand delivery across Moulvibazar town, secure courier shipping across all 64 districts in Bangladesh, and open-box verification before final payment.',
    path: '/delivery',
    keywords: [
      'Laptop delivery Moulvibazar',
      'Laptop delivery Bangladesh',
      'Computer delivery Moulvibazar',
      'CCTV courier Bangladesh',
      'মৌলভীবাজার ল্যাপটপ ডেলিভারি',
    ],
  });
}

export default function DeliveryPage() {
  const breadcrumbs = [{ name: 'Delivery Policy', path: '/delivery' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Truck size={14} />
            <span>Fast, Insured Tech Delivery</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Laptop & Electronics Delivery in Moulvibazar & Across Bangladesh
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Every product shipped from {BUSINESS_INFO.name} is double-boxed, bubble-wrapped, and fully insured. We guarantee safe arrival with complete verification before final payment.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Same-Day Moulvibazar Delivery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Orders placed before 4:00 PM inside Moulvibazar town (Kusumbag, Chowmuhana, Sreemangal Road) are hand-delivered within 2 to 4 hours by our showroom staff.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PackageCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Open-Box Verification First</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You are entitled to open the parcel and power on your laptop or verify the hardware condition in front of the delivery courier before making the final payment.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Truck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Nationwide Courier Coverage</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We partner with Steadfast, Sundarban, and SA Paribahan couriers to deliver laptops and tech accessories safely to all 64 districts in Bangladesh within 24 to 48 hours.
            </p>
          </div>
        </div>

        {/* Delivery Details Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delivery Areas, Timelines & Charges</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Delivery Zone</th>
                  <th className="py-3 px-4">Typical Delivery Time</th>
                  <th className="py-3 px-4">Courier / Method</th>
                  <th className="py-3 px-4">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Moulvibazar Town</td>
                  <td className="py-3 px-4 text-blue-600 dark:text-cyan-400 font-bold">2 - 4 Hours (Same Day)</td>
                  <td className="py-3 px-4">NEED ELECTRO Hand Delivery</td>
                  <td className="py-3 px-4">Cash on Delivery / bKash</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Sreemangal, Kulaura, Rajnagar</td>
                  <td className="py-3 px-4">Same-Day / Next-Day</td>
                  <td className="py-3 px-4">Express Courier / Showroom Staff</td>
                  <td className="py-3 px-4">Cash on Delivery / bKash</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Sylhet City & Surrounding</td>
                  <td className="py-3 px-4">24 Hours</td>
                  <td className="py-3 px-4">Steadfast Courier</td>
                  <td className="py-3 px-4">Cash on Delivery (Small Booking Advance)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Dhaka, Chittagong & Rest of Bangladesh</td>
                  <td className="py-3 px-4">24 - 48 Hours</td>
                  <td className="py-3 px-4">Sundarban / Steadfast Courier</td>
                  <td className="py-3 px-4">Cash on Delivery (Courier Condition)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
