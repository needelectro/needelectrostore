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
  Wifi, ShieldCheck, Clock, CheckCircle2, Phone,
  MessageCircle, MapPin, ArrowRight, Layers, Cpu, Server
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Networking & Wi-Fi Installation in Moulvibazar | Office & Home Setup | NEED ELECTRO',
    description:
      'Professional Wi-Fi router setup, Cat6 structured cabling, Gigabit network switches, optical fiber ONU configuration, and dead-zone elimination for homes and businesses in Moulvibazar.',
    path: '/services/networking',
    keywords: [
      'Networking and Wi-Fi installation',
      'Wi-Fi installation Moulvibazar',
      'Router setup Moulvibazar',
      'Office networking Moulvibazar',
      'Cat6 cabling Moulvibazar',
      'Mesh Wi-Fi setup Bangladesh',
      'Network switch installation',
      'ওয়াইফাই সেটআপ মৌলভীবাজার',
      'নেটওয়ার্কিং সার্ভিস মৌলভীবাজার',
    ],
  });
}

const NETWORKING_SOLUTIONS = [
  {
    title: 'Whole-Home Mesh Wi-Fi 6 Setup',
    desc: 'Eliminate dead zones in multi-story houses and apartments with TP-Link Deco and Mercusys seamless roaming mesh systems.',
  },
  {
    title: 'Office Structured LAN Cabling',
    desc: 'Cat6 copper ethernet network drops, RJ45 patch panels, server rack management, and clean cable trunking.',
  },
  {
    title: 'Gigabit Switch & VLAN Configuration',
    desc: 'High-bandwidth managed and unmanaged 8/16/24-port switch deployment for reliable POS, CCTV, and workstation connectivity.',
  },
  {
    title: 'Optical Fiber ONU & Dual-Band Routers',
    desc: 'FTTH fiber router configuration, PPPoE/Static IP setup, bandwidth QoS throttling, and guest network isolation.',
  },
];

export default function NetworkingServicePage() {
  const breadcrumbs = [
    { name: 'Services', path: '/services' },
    { name: 'Networking & Wi-Fi Installation', path: '/services/networking' },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  const serviceSchema = buildServiceSchema({
    name: 'Networking and Wi-Fi Installation Service',
    serviceType: 'ComputerNetworkingServices',
    description:
      'Structured Cat6 ethernet cabling, mesh Wi-Fi 6 routers, and business network installation in Moulvibazar and Sylhet Division.',
    path: '/services/networking',
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
            <Wifi size={13} />
            <span>Enterprise &amp; Residential Connectivity</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Networking &amp; Wi-Fi Installation in Moulvibazar
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            High-speed, seamless internet connectivity for homes, hotels, restaurants, corporate offices, and tea garden bungalows. Professional Cat6 structured cabling, dual-band Wi-Fi 6 deployment, and Gigabit switch management.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="px-5 py-2.5 rounded-xl bg-[#0084d6] hover:bg-[#0073bc] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all"
            >
              <Phone size={14} />
              <span>Call Network Engineer: {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20need%20networking%20and%20Wi-Fi%20installation%20service%20in%20Moulvibazar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Booking</span>
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-10">
        <section className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Structured Networking Solutions
            </h2>
            <p className="text-xs text-slate-500">Engineered for low-latency, zero-dropouts, and maximum data throughput</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NETWORKING_SOLUTIONS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-[#0084d6] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Server size={20} />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Routers & Hardware Store Link */}
        <section className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-800/80 rounded-3xl p-6 sm:p-8 border border-violet-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
              Hardware Equipment
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              Need Routers, Switches, or Cat6 Cables?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We stock authentic TP-Link, D-Link, Tenda, and Totolink dual-band routers, Gigabit switches, and certified copper patch cords at showroom prices.
            </p>
          </div>
          <Link
            href="/networking"
            className="px-5 py-2.5 rounded-xl bg-[#0084d6] hover:bg-[#0073bc] text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-md transition-all"
          >
            <span>Browse Networking Hardware</span>
            <ArrowRight size={14} />
          </Link>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
