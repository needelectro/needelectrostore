import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata, buildServiceSchema, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ElectricianBookingForm } from './ElectricianBookingForm';
import { Wrench, ShieldCheck, Clock, CheckCircle2, Phone, MessageCircle, MapPin, Zap } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Book Certified Electrician in Moulvibazar | Home & Commercial Wiring | NEED ELECTRO',
    description: 'Book licensed and certified electricians in Moulvibazar at NEED ELECTRO. Same-day technician dispatch for home wiring, circuit breaker installation, DB panel maintenance, and short-circuit troubleshooting.',
    path: '/services/electrician',
    keywords: [
      'Electrician in Moulvibazar',
      'Electrician Moulvibazar',
      'Book electrician Moulvibazar',
      'Electrical service Moulvibazar',
      'Home electrician Moulvibazar',
      'Short circuit repair Moulvibazar',
      'ইলেকট্রিশিয়ান মৌলভীবাজার',
      'মৌলভীবাজার ইলেকট্রিক্যাল কাজ',
    ],
  });
}

export default function ElectricianBookingPage() {
  const serviceSchema = buildServiceSchema({
    name: 'Certified Electrician Booking Service',
    serviceType: 'ElectricianServices',
    description: 'Licensed and background-verified electricians for residential, commercial, and industrial electrical wiring and repairs in Moulvibazar, Sylhet, Bangladesh.',
    path: '/services/electrician',
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Electrical Services', path: '/electrical-services' },
    { name: 'Book Electrician', path: '/services/electrician' },
  ]);

  const breadcrumbs = [
    { name: 'Services', path: '/electrical-services' },
    { name: 'Book Electrician', path: '/services/electrician' },
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
      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-amber-50/70 via-transparent to-transparent dark:from-amber-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-500/30 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Wrench size={14} />
            <span>Certified Electrician Booking in Moulvibazar</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Book a Certified Electrician in Moulvibazar
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Need an experienced electrician for your home, showroom, or industrial facility? {BUSINESS_INFO.name} provides certified technicians with transparent rates, prompt dispatch, and guaranteed workmanship across Moulvibazar.
          </p>
        </div>
      </section>

      {/* Main Content & Booking Form */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Col: Info & Standards */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Why Choose NEED ELECTRO Electricians?</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <ShieldCheck size={22} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Certified & Vetted Professionals</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Our electricians possess formal training in single-phase and 3-phase systems, circuit breaker calculations, and short-circuit fault identification.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <Clock size={22} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rapid Same-Day Dispatch</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Technicians are dispatched locally from Kusumbag, Moulvibazar, reaching Kusumbag, Chowmuhana, and Shamshernagar Road within 30 to 60 minutes.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
                <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transparent Pricing — No Hidden Fees</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Clear service estimates before starting work. You only pay for the actual labor and genuine components installed.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Zap size={16} />
                <span>Electrical Safety Guarantee</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All wiring installations use high-grade copper cables with flame-retardant PVC insulation and genuine Miniature Circuit Breakers (MCBs) adhering strictly to Bangladesh National Building Code (BNBC) fire safety guidelines.
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Need Immediate Assistance?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                For urgent power tripping, sparks, or electrical emergencies in Moulvibazar town:
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs"
                >
                  <Phone size={14} />
                  <span>Call {BUSINESS_INFO.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO,%20I%20need%20urgent%20electrician%20assistance%20in%20Moulvibazar`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Technician Dispatch</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Col: Interactive ERP Booking Form */}
          <div className="lg:col-span-5">
            <ElectricianBookingForm />
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
