import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, generateSeoMetadata, buildOrganizationSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { Building2, ShieldCheck, Award, HeartHandshake, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'About Us | NEED ELECTRO — Trusted Solutions in Moulvibazar',
    description: 'Learn about NEED ELECTRO, founded by Amdadur Rahman. Discover our mission to provide authentic laptops, technology solutions, certified electrician services, and laptop EMI in Moulvibazar, Bangladesh.',
    path: '/about',
    keywords: [
      'About NEED ELECTRO',
      'Amdadur Rahman NEED ELECTRO',
      'Laptop shop Moulvibazar history',
      'Electronics showroom Moulvibazar',
    ],
  });
}

export default function AboutPage() {
  const orgSchema = buildOrganizationSchema();
  const breadcrumbs = [{ name: 'About Us', path: '/about' }];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-300">
            <Building2 size={14} />
            <span>Our Journey & Commitment</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            About NEED ELECTRO — Trusted Electrical & Technological Solutions
          </h1>

          <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Founded with a vision to deliver authentic, high-reliability technological hardware and certified electrical engineering to the people of Moulvibazar, {BUSINESS_INFO.name} has grown into one of Sylhet Division's most respected tech destinations.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 max-w-5xl mx-auto w-full flex-1 space-y-12">
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-white">Our Founding Mission</h2>
          <p>
            For years, students, freelancers, and small business owners in Moulvibazar faced two major dilemmas: purchasing expensive brand-new laptops with high markups, or taking risks with unverified secondhand sellers who offered zero after-sales accountability.
          </p>
          <p>
            {BUSINESS_INFO.name} was established by <strong>{BUSINESS_INFO.founder}</strong> to eliminate this dilemma. We set up an enterprise-level 24-point diagnostic testing laboratory in Moulvibazar town. Every single laptop we curate — from HP EliteBooks to Dell Latitudes and Lenovo ThinkPads — is rigorously bench-tested for battery health, thermals, SSD integrity, and display purity before it ever reaches our showroom shelf.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <ShieldCheck size={28} className="text-cyan-400" />
            <h3 className="text-base font-bold text-white">Uncompromising Authenticity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never sell refurbished devices disguised as new or counterfeit components. Every charger, battery, SSD, and cable is genuine and backed by transparent warranty terms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Award size={28} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Technical Competence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our in-house staff includes certified electricians and computer hardware technicians ready to diagnose, repair, and install hardware on-site with speed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <HeartHandshake size={28} className="text-emerald-400" />
            <h3 className="text-base font-bold text-white">Customer-First Financing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Through our proprietary ERP installment system, we make high-performance computing affordable for college students and small businesses via flexible monthly EMI.
            </p>
          </div>
        </div>

        {/* Showroom Visit Box */}
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white">Visit Our Kusumbag Showroom</h2>
          <div className="flex flex-col md:flex-row gap-6 text-xs text-slate-300">
            <div className="space-y-1.5 flex-1">
              <span className="font-semibold text-white block">Physical Location:</span>
              <p>{BUSINESS_INFO.address.streetAddress}, {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion} - {BUSINESS_INFO.address.postalCode}, Bangladesh.</p>
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="font-semibold text-white block">Opening Hours:</span>
              <p>Saturday – Thursday: 9:30 AM – 9:30 PM (Friday Closed)</p>
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="font-semibold text-white block">Direct Hotline:</span>
              <p>{BUSINESS_INFO.phone}</p>
            </div>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
