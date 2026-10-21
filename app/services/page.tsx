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
  Wrench, Camera, Laptop, Wifi, Zap, ShieldCheck,
  Phone, MessageCircle, MapPin, CheckCircle2, ArrowRight, Award, Clock
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Technical & Engineering Services in Moulvibazar | NEED ELECTRO',
    description:
      'Certified electrician booking, CCTV surveillance installation, laptop chip-level repair, desktop PC maintenance, and commercial Wi-Fi networking in Moulvibazar, Sylhet Division, Bangladesh.',
    path: '/services',
    keywords: [
      'Electrical services in Moulvibazar',
      'Electrician service in Bangladesh',
      'CCTV installation service',
      'Laptop and computer servicing',
      'Networking and Wi-Fi installation',
      'Laptop repair in Moulvibazar',
      'Computer repair Moulvibazar',
      'CCTV camera installation in Moulvibazar',
      'Home electrician Moulvibazar',
      'ইলেকট্রিক্যাল সার্ভিস মৌলভীবাজার',
      'ল্যাপটপ সার্ভিসিং মৌলভীবাজার',
    ],
  });
}

const SERVICES_LIST = [
  {
    id: 'electrician',
    title: 'Certified Electrician & Wiring Services',
    href: '/services/electrician',
    icon: Zap,
    badge: 'Moulvibazar Town & Districts',
    color: 'from-amber-500 to-orange-500',
    description:
      'Residential and commercial wiring, short-circuit diagnostics, circuit breaker upgrades, distribution board (DB) balance, and emergency technician callout.',
    features: [
      'Single-phase & 3-phase wiring inspection',
      'Schneider & Super Star MCB breaker installation',
      'Emergency same-day callout in Moulvibazar',
    ],
    cta: 'Book Electrician Now',
  },
  {
    id: 'cctv',
    title: 'CCTV Camera Installation & Maintenance',
    href: '/services/cctv-installation',
    icon: Camera,
    badge: 'Hikvision & Dahua Certified',
    color: 'from-cyan-600 to-teal-500',
    description:
      'Turnkey HD & IP security surveillance installation for residences, retail showrooms, tea estates, schools, and offices with real-time smartphone remote viewing.',
    features: [
      'Indoor & outdoor weather-resistant turret setup',
      'NVR/DVR hard drive storage configuration',
      'Mobile app live streaming & motion push alerts',
    ],
    cta: 'Book CCTV Installation',
  },
  {
    id: 'laptop-repair',
    title: 'Laptop & Computer Repair / Servicing',
    href: '/services/laptop-computer-repair',
    icon: Laptop,
    badge: 'Hardware & Chip-Level',
    color: 'from-blue-600 to-sky-500',
    description:
      'Professional laptop motherboards repair, thermal paste replacement, SSD/RAM upgrades, screen/keyboard replacements, and desktop PC deep-cleaning diagnostics.',
    features: [
      'Official HP, Dell, Lenovo motherboard diagnostics',
      'High-speed NVMe SSD & DDR4/DDR5 RAM upgrades',
      'Genuine Windows 11 installation & driver tuning',
    ],
    cta: 'Explore Laptop Servicing',
  },
  {
    id: 'networking',
    title: 'Networking & Wi-Fi Installation',
    href: '/services/networking',
    icon: Wifi,
    badge: 'Home & Office Enterprise',
    color: 'from-violet-600 to-purple-500',
    description:
      'High-speed structured LAN cabling, Gigabit switch configuration, dual-band Wi-Fi 6 mesh setup, ONU optical fiber routing, and dead-zone elimination.',
    features: [
      'Seamless multi-story mesh Wi-Fi roaming',
      'Cat6 RJ45 patch panel & rack mounting',
      'Bandwidth optimization for office & home freelance',
    ],
    cta: 'Book Networking Setup',
  },
];

export default function ServicesHubPage() {
  const breadcrumbs = [{ name: 'Services', path: '/services' }];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  const serviceSchema = buildServiceSchema({
    name: 'NEED ELECTRO Technical & Engineering Services',
    serviceType: 'TechnicalSupportAndElectricalServices',
    description:
      'Certified technical services including electrical wiring, CCTV installation, laptop repair, and networking in Moulvibazar, Sylhet Division, Bangladesh.',
    path: '/services',
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col">
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
      <section className="py-12 px-4 bg-gradient-to-br from-white via-[#F4F6F8] to-[#EAF4FF] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF4FF] border border-[#008CFF]/20 text-[#008CFF]">
            <Wrench size={13} />
            <span>On-Site Technical &amp; Engineering Services</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#002B5B] tracking-tight leading-tight">
            Certified Electrical, CCTV &amp; Computer Services in Moulvibazar
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            From residential wiring and circuit breaker maintenance to high-definition CCTV security deployment and chip-level laptop servicing, {BUSINESS_INFO.name} offers certified engineering with guaranteed warranty and transparent pricing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="px-5 py-2.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Phone size={14} />
              <span>Call Hotline: {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Booking</span>
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002B5B]">
            Our Core Technical Services
          </h2>
          <p className="text-xs text-slate-500 mt-1">Available across Moulvibazar Sadar, Sreemangal, Kulaura, Rajnagar, and Sylhet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES_LIST.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${srv.color} text-white flex items-center justify-center shadow-xs`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#002B5B]">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#002B5B]">
                    {srv.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.description}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                    {srv.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    href={srv.href}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <span>{srv.cta}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Showroom & Service Guarantee */}
        <section className="bg-gradient-to-br from-[#EAF4FF] via-white to-sky-50 text-[#002B5B] rounded-3xl p-6 sm:p-8 border border-slate-200/90 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#008CFF] font-bold text-xs">
            <Award size={15} />
            <span>Guaranteed Quality &amp; Genuine Spares</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#002B5B]">
            Why Moulvibazar Residents Rely on NEED ELECTRO
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Unlike informal freelancers, our technicians operate from a physical, registered showroom at MR Plaza in Kusumbag. Every replacement component, cable, breaker, and camera comes with official warranty protection and direct showroom support.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
              <Clock size={16} className="text-[#008CFF] shrink-0" />
              <span className="font-medium text-slate-700">Prompt Emergency Dispatch</span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span className="font-medium text-slate-700">Transparent Pricing &amp; No Hidden Fees</span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
              <MapPin size={16} className="text-[#008CFF] shrink-0" />
              <span className="font-medium text-slate-700">Kusumbag Showroom Verification</span>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
