import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata, buildServiceSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { Wrench, Zap, ShieldCheck, CheckCircle2, Phone, MessageCircle, Clock, MapPin, ArrowRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Electrical Services in Moulvibazar | Installation, Maintenance & Wiring | NEED ELECTRO',
    description: 'Looking for dependable electrical services in Moulvibazar? NEED ELECTRO provides certified residential and commercial electrical wiring, distribution board setup, short-circuit troubleshooting, and licensed electrician dispatch.',
    path: '/electrical-services',
    keywords: [
      'Electrical service in Moulvibazar',
      'Electrician in Moulvibazar',
      'Electrical installation Moulvibazar',
      'Electrical maintenance Moulvibazar',
      'Home electrician Moulvibazar',
      'Electrical troubleshooting Moulvibazar',
      'মৌলভীবাজার ইলেকট্রিক্যাল সার্ভিস',
    ],
  });
}

export default function ElectricalServicesPage() {
  const serviceSchema = buildServiceSchema({
    name: 'Electrical Installation & Maintenance Service',
    serviceType: 'ElectricalEngineering',
    description: 'Certified residential and commercial electrical wiring, circuit breaker installation, distribution board maintenance, and electrical troubleshooting in Moulvibazar, Bangladesh.',
    path: '/electrical-services',
  });

  const breadcrumbs = [{ name: 'Electrical Services', path: '/electrical-services' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 3xl:px-12 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-amber-50/70 via-transparent to-transparent dark:from-amber-950/20">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-500/30 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Zap size={14} />
            <span>Certified Electrician & Engineering Services</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Electrical Service in Moulvibazar — Wiring, DB Panel & Electrician Solutions
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed">
            Protect your property with safe, certified electrical installations from {BUSINESS_INFO.name}. Our background-checked licensed electricians provide complete home and industrial wiring, distribution board (DB) load balancing, earthing resistance testing, and emergency electrical troubleshooting across Moulvibazar.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/services/electrician"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 min-h-[42px] rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all inline-flex items-center gap-2"
            >
              <Wrench size={15} />
              <span>Book an Electrician Now →</span>
            </Link>
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Phone size={14} className="text-amber-500 dark:text-amber-400" />
              <span>Immediate Support: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Service Grid */}
      <section className="py-10 sm:py-14 px-3 sm:px-6 lg:px-8 3xl:px-12 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Professional Electrical Solutions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compliant with Bangladesh National Building Code (BNBC) electrical standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Residential & Apartment Wiring</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Complete conduit cabling, concealed wall wiring, switchboard mounting, and light fixture installation for new homes and renovation projects.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Distribution Board (DB) & Breakers</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Main distribution panel wiring, load balancing across phases, MCB and RCCB circuit breaker setup to prevent electrical fires and shock hazards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wrench size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Electrical Troubleshooting & Repair</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Rapid diagnosis of flickering lights, tripping circuit breakers, burning smells, voltage fluctuations, and grounded short circuits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Earthing & Surge Protection</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Copper earthing rod installation and lightning surge arrestors to safeguard computers, laptops, televisions, and heavy appliances.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Commercial & Retail Lighting</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              High-efficiency LED panel lights, track spotlights for retail showrooms, emergency backup exit signs, and exterior security floodlights.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <MapPin size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Generator & IPS Wiring Setup</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automatic transfer switch (ATS) wiring, inverter IPS battery connections, and backup load segregation for uninterrupted power.
            </p>
          </div>
        </div>
      </section>

      {/* Coverage & Booking CTA */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Need an Experienced Electrician in Moulvibazar Today?
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Our electricians are ready for dispatch across Moulvibazar Town (Kusumbag, Chowmuhana, Shamshernagar Road, Sreemangal Road), as well as Sreemangal, Kulaura, and Rajnagar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services/electrician"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              Book Service Online →
            </Link>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20need%20an%20electrician%20for%20my%20home/office%20in%20Moulvibazar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Technician Dispatch</span>
            </a>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
