import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { MapPin, Phone, MessageCircle, Laptop, Camera, Zap, ShieldCheck } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Laptop Shop, CCTV & Electrician in Rajnagar | NEED ELECTRO',
    description: 'NEED ELECTRO provides prompt laptop delivery, tested HP/Dell/Lenovo laptops with EMI, CCTV security setups, and certified electricians for Rajnagar Upazila from Moulvibazar town.',
    path: '/rajnagar',
    keywords: [
      'Laptop shop Rajnagar',
      'Laptop in Rajnagar',
      'CCTV camera Rajnagar',
      'Electrician in Rajnagar',
      'রাজনগর ল্যাপটপ',
    ],
  });
}

export default function RajnagarPage() {
  const breadcrumbs = [{ name: 'Rajnagar Hub', path: '/rajnagar' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 dark:bg-blue-900/40 dark:border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 dark:text-cyan-300">
            <MapPin size={14} />
            <span>Rajnagar Service Area</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Laptop, CCTV & Electrical Solutions in Rajnagar
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Directly neighboring Moulvibazar town, Rajnagar residents enjoy fast same-day hardware delivery and technician dispatch from {BUSINESS_INFO.name}. Explore tested enterprise laptops with installment financing, CCTV surveillance camera installations, and licensed electricians.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <Phone size={14} />
              <span>Call Rajnagar Dispatch: {BUSINESS_INFO.phone}</span>
            </a>
            <Link
              href="/laptops"
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 shadow-xs transition-colors"
            >
              Explore Laptops & EMI →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <Laptop size={24} className="text-blue-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Laptops for Students & Freelancers</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              HP, Dell, and Lenovo business laptops with replacement warranty and easy monthly installment plans available in Rajnagar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <Camera size={24} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">CCTV Installation in Rajnagar</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Surveillance setups for poultry farms, agricultural centers, retail stores, and private homes in Rajnagar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <Zap size={24} className="text-amber-500 dark:text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Certified Electrician Services</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Distribution boards, motor wiring, home electrical troubleshooting, and earthing setups dispatched promptly from Moulvibazar.
            </p>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
