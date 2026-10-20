import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ShieldCheck, Award, CheckCircle2, Clock, MapPin, Phone, HelpCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Official Warranty Policy | Hardware Support & Guarantees | NEED ELECTRO',
    description:
      'Official hardware warranty terms at NEED ELECTRO. 2-year service warranty, 1 to 3-year brand warranties on HP, Dell, Lenovo, and Hikvision CCTV in Moulvibazar, Bangladesh.',
    path: '/warranty-policy',
    keywords: [
      'NEED ELECTRO warranty policy',
      'Laptop warranty Bangladesh',
      'HP laptop warranty Moulvibazar',
      'Dell laptop warranty Moulvibazar',
      'CCTV warranty Bangladesh',
    ],
  });
}

export default function WarrantyPolicyPage() {
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Warranty Policy', path: '/warranty-policy' },
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
            <Award size={13} />
            <span>Official Warranty &amp; Service Assurances</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Warranty Policy &amp; Terms
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Every product sold at {BUSINESS_INFO.name} is guaranteed 100% genuine and comes with verified manufacturer or showroom service warranty coverage.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8 text-xs sm:text-sm">
        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0084d6] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Brand Warranty</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
              Brand-new laptops, monitors, CCTV cameras, and networking devices carry 1 to 3 years of official manufacturer warranty handled through authorized service centers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">7-Day Replacement</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
              All laptops and hardware include a 7-day one-to-one replacement guarantee if any internal motherboard, display, or hardware fault is identified.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Award size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">2-Year Service Warranty</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
              Enterprise and certified tested laptops include 2 years of free labor support, thermal paste renewal, dusting, and operating system diagnostics at our Kusumbag lab.
            </p>
          </div>
        </div>

        {/* Exclusions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle size={18} className="text-slate-400" />
            <span>Warranty Exclusions &amp; Void Conditions</span>
          </h2>

          <p className="text-slate-600 dark:text-slate-400">
            Standard warranty protection applies to inherent technical and manufacturing defects. Warranty does not cover:
          </p>

          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Physical breakage, cracked screen panels, or casing drop impact.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Liquid spills, corrosion, water ingress, or pest infestation.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Severe electrical surge, high-voltage burning without protective stabilizer.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Tampered, broken, or missing warranty serial number stickers.</span>
            </li>
          </ul>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
