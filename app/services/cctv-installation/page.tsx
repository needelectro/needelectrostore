import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata, buildServiceSchema, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { CctvBookingForm } from './CctvBookingForm';
import { Video, ShieldCheck, CheckCircle2, Phone, MessageCircle, Eye, Wifi, HardDrive, Smartphone, ArrowRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'CCTV Camera Installation in Moulvibazar | Site Survey, Cabling & Setup | NEED ELECTRO',
    description: 'Professional CCTV camera security installation in Moulvibazar. Site inspection, HD & IP camera setup, DVR/NVR surveillance hard drive storage, night vision, and mobile live viewing configuration by NEED ELECTRO technicians.',
    path: '/services/cctv-installation',
    keywords: [
      'CCTV camera installation Moulvibazar',
      'CCTV setup Moulvibazar',
      'Security camera Moulvibazar',
      'CCTV camera Moulvibazar',
      'IP camera installation Moulvibazar',
      'CCTV shop Moulvibazar',
      'মৌলভীবাজার সিসিটিভি ক্যামেরা',
      'সিসিটিভি ইনস্টলেশন মৌলভীবাজার',
    ],
  });
}

export default function CctvInstallationPage() {
  const serviceSchema = buildServiceSchema({
    name: 'CCTV Camera Security Installation Service',
    serviceType: 'SecuritySystemInstallation',
    description: 'Turnkey CCTV security surveillance installation, coaxial/Cat6 concealed cabling, DVR/NVR setup, surveillance storage configuration, and smartphone live streaming in Moulvibazar, Sylhet, Bangladesh.',
    path: '/services/cctv-installation',
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'CCTV & Security', path: '/cctv' },
    { name: 'CCTV Installation', path: '/services/cctv-installation' },
  ]);

  const breadcrumbs = [
    { name: 'CCTV & Security', path: '/cctv' },
    { name: 'CCTV Installation', path: '/services/cctv-installation' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Video size={14} />
            <span>Turnkey CCTV Surveillance Installation</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            CCTV Camera Installation in Moulvibazar — Site Survey, Cabling & Setup
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Protect your family, retail business, or warehouse with professional CCTV installation from {BUSINESS_INFO.name}. Our experienced technicians handle complete on-site camera positioning, concealed coaxial/Cat6 cabling, DVR/NVR configuration, surveillance hard drive setup, and mobile live viewing on your smartphone.
          </p>
        </div>
      </section>

      {/* Main Content & Booking Form */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Col: Features & Architecture */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete 4-Step Surveillance Deployment</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Free On-Site Security Survey</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    We inspect your property in Moulvibazar to eliminate blind spots, determine camera viewing angles, and calculate exact cable lengths.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Concealed & Weatherproof Cabling</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Heavy-duty copper cabling secured inside PVC conduits protects against rats, rainwater, and physical tampering.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Surveillance Hard Drive Setup</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Genuine Western Digital Purple or Seagate SkyHawk drives optimized for continuous 24/7 video writes with up to 30 days of retention.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shrink-0 text-sm">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mobile Phone Remote Live Streaming</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    P2P encrypted cloud setup allows you to view live video feeds, receive motion alerts, and play back recordings anywhere in the world on Android or iOS.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
              <h3 className="text-sm font-bold text-blue-700 dark:text-cyan-300 flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>1-Year Complete Equipment Warranty</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All cameras and DVR/NVR recorders supplied by {BUSINESS_INFO.name} include a minimum 1-year official brand replacement warranty and free maintenance support.
              </p>
            </div>
          </div>

          {/* Right Col: Interactive ERP Booking Form */}
          <div className="lg:col-span-5">
            <CctvBookingForm />
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
