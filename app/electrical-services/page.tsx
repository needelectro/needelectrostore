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
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-12 px-4 border-b border-slate-800/80 bg-gradient-to-b from-amber-950/20 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-900/40 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
            <Zap size={14} />
            <span>Certified Electrical Engineering Solutions</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Electrical Services in Moulvibazar — Installation, Wiring & Maintenance
          </h1>

          <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Electrical safety is non-negotiable. Whether wiring a new residential apartment, setting up a 3-phase commercial distribution board, resolving sudden short-circuits, or conducting a safety inspection, {BUSINESS_INFO.name} dispatches certified, experienced electricians across Moulvibazar.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/services/electrician"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
            >
              <Wrench size={15} />
              <span>Book an Electrician Now →</span>
            </Link>
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700/80 transition-colors inline-flex items-center gap-1.5"
            >
              <Phone size={14} className="text-amber-400" />
              <span>Immediate Support: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Service Grid */}
      <section className="py-14 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Professional Electrical Solutions
          </h2>
          <p className="text-xs text-slate-400">
            Compliant with Bangladesh National Building Code (BNBC) electrical standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Residential & Apartment Wiring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete conduit cabling, concealed wall wiring, switchboard mounting, and light fixture installation for new homes and renovation projects.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Distribution Board (DB) & Breakers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Main distribution panel wiring, load balancing across phases, MCB and RCCB circuit breaker setup to prevent electrical fires and shock hazards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wrench size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Electrical Troubleshooting & Repair</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rapid diagnosis of flickering lights, tripping circuit breakers, burning smells, voltage fluctuations, and grounded short circuits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Earthing & Surge Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Copper earthing rod installation and lightning surge arrestors to safeguard computers, laptops, televisions, and heavy appliances.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Commercial & Retail Lighting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-efficiency LED panel lights, track spotlights for retail showrooms, emergency backup exit signs, and exterior security floodlights.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <MapPin size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Generator & IPS Wiring Setup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic transfer switch (ATS) wiring, inverter IPS battery connections, and backup load segregation for uninterrupted power.
            </p>
          </div>
        </div>
      </section>

      {/* Coverage & Booking CTA */}
      <section className="py-12 px-4 bg-slate-950/80 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Need an Experienced Electrician in Moulvibazar Today?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Our electricians are ready for dispatch across Moulvibazar Town (Kusumbag, Chowmuhana, Shamshernagar Road, Sreemangal Road), as well as Sreemangal, Kulaura, and Rajnagar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services/electrician"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Book Service Online →
            </Link>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20need%20an%20electrician%20for%20my%20home/office%20in%20Moulvibazar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
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
