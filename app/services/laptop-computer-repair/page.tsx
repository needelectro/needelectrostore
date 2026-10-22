import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BUSINESS_INFO,
  generateSeoMetadata,
  buildBreadcrumbSchema,
  buildServiceSchema
} from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import {
  Laptop, Monitor, Wrench, ShieldCheck, Clock, CheckCircle2,
  Phone, MessageCircle, MapPin, Zap, ArrowRight, Cpu, HardDrive
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Laptop & Computer Repair in Moulvibazar | NEED ELECTRO',
    description:
      'Professional chip-level laptop repair, motherboard diagnostics, screen & keyboard replacement, NVMe SSD & RAM upgrades in Moulvibazar, Bangladesh.',
    path: '/services/laptop-computer-repair',
    keywords: [
      'Laptop and computer servicing',
      'Laptop repair in Moulvibazar',
      'Computer repair Moulvibazar',
      'Laptop servicing Moulvibazar',
      'HP laptop repair Moulvibazar',
      'Dell laptop repair Moulvibazar',
      'Lenovo laptop repair Moulvibazar',
      'Laptop screen replacement Moulvibazar',
      'Laptop battery replacement Moulvibazar',
      'Desktop PC repair Moulvibazar',
      'SSD upgrade Moulvibazar',
      'ল্যাপটপ মেরামত মৌলভীবাজার',
      'কম্পিউটার সার্ভিসিং মৌলভীবাজার',
    ],
  });
}

const COMMON_ISSUES = [
  { title: 'No Power / Motherboard Dead', desc: 'Short-circuit diode diagnosis, IC replacement, and power rail voltage restoration.' },
  { title: 'Broken Display / Screen Flickering', desc: 'Original IPS FHD & 4K panel replacement with zero dead-pixel guarantee.' },
  { title: 'Overheating & Loud Fan Noise', desc: 'Thermal paste replacement (Arctic MX-4), copper heatsink dusting, and fan lubrication.' },
  { title: 'Sluggish Performance & Freezing', desc: 'High-speed NVMe PCIe Gen 4 SSD installation and DDR4/DDR5 RAM memory upgrades.' },
  { title: 'Liquid Spill & Water Damage', desc: 'Ultrasonic board cleaning, corrosion removal, and keyboard membrane replacement.' },
  { title: 'Battery Not Charging / Fast Drain', desc: 'Authentic HP, Dell, and Lenovo battery replacement with health diagnostics.' },
];

export default function LaptopRepairPage() {
  const breadcrumbs = [
    { name: 'Services', path: '/services' },
    { name: 'Laptop & Computer Repair', path: '/services/laptop-computer-repair' },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  const serviceSchema = buildServiceSchema({
    name: 'Laptop and Computer Repair Service',
    serviceType: 'ComputerRepairAndMaintenance',
    description:
      'Professional chip-level laptop repair, component upgrades, and desktop PC maintenance at NEED ELECTRO technical hub in Moulvibazar, Bangladesh.',
    path: '/services/laptop-computer-repair',
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-12 px-4 bg-gradient-to-b from-[#081621] to-[#040e19] text-white">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0084d6]/20 border border-[#0084d6]/40 text-sky-300">
            <Wrench size={13} />
            <span>Moulvibazar Dedicated Hardware Repair Lab</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Laptop &amp; Desktop Computer Repair in Moulvibazar
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Fast, transparent, and chip-level hardware repair for HP, Dell, Lenovo, Acer, Asus, and custom desktops. Connect with our Moulvibazar technical lab or schedule technician diagnosis today.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="px-5 py-2.5 rounded-xl bg-[#0084d6] hover:bg-[#0073bc] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all"
            >
              <Phone size={14} />
              <span>Call Technician: {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20need%20laptop%2Fcomputer%20repair%20service%20in%20Moulvibazar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Diagnosis</span>
            </a>
          </div>
        </div>
      </section>

      {/* Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-10">
        {/* Problems Solved Grid */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Common Laptop &amp; Computer Issues We Fix
            </h2>
            <p className="text-xs text-slate-500">Same-day turnaround for standard upgrades &amp; screen replacements</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMON_ISSUES.map((issue, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-[#0084d6] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0084d6] flex items-center justify-center font-bold text-xs font-mono">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {issue.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {issue.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Upgrade Services */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 rounded-3xl p-6 sm:p-8 border border-blue-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-[#0084d6] dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Cpu size={15} />
            <span>Hardware Speed Boost Packages</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Make Your Laptop 10x Faster with NVMe SSD &amp; RAM Upgrades
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Don't replace your sluggish laptop before upgrading its drive. Switching from a mechanical hard disk to an original NVMe M.2 SSD makes boot time under 10 seconds and eliminates app freezes.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Free Data Backup &amp; Migration</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Original Samsung, WD &amp; Crucial Spares</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>3 Years Replacement Warranty on SSDs</span>
            </div>
          </div>
        </section>

        {/* Technical Service & Repair Hub */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Wrench size={14} className="text-[#0084d6]" />
            <span>Technical Service &amp; Diagnosis Operations</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Professional Laptop &amp; Computer Servicing Based in Moulvibazar
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion}, Bangladesh. Call our hotline at {BUSINESS_INFO.phone} for technician consultation, pickup arrangement, or on-site diagnosis.
          </p>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
