import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2, ShieldCheck, Award, HeartHandshake, Phone, MapPin,
  CheckCircle2, User, Mail, Globe, Laptop, Camera, Zap, Wifi,
  Cpu, Layers, Briefcase, GraduationCap, Sparkles, ArrowRight,
  Code2, ShieldAlert, Wrench, Compass, Target, Smartphone,
  Headphones, MessageCircle, ExternalLink, HelpCircle
} from 'lucide-react';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'About NEED ELECTRO | Founder, Products & Services Bangladesh',
    description: 'Discover NEED ELECTRO, founded by Amdadur Rahman. Explore electrical products, laptops, computers, CCTV solutions, technical services, and software development in Bangladesh.',
    path: '/about',
    keywords: [
      'About NEED ELECTRO',
      'Amdadur Rahman NEED ELECTRO',
      'Trusted Electrical and Technological Solutions',
      'AMDADS GROUP sister concern',
      'Electrical products in Bangladesh',
      'Laptop shop Moulvibazar',
      'Computer shop Bangladesh',
      'CCTV camera installation Bangladesh',
      'Electrician services Moulvibazar',
      'Software development Bangladesh',
      'Electrical and technology platform Bangladesh',
      'Tech skills development Bangladesh'
    ],
  });
}

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
  ];

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${BUSINESS_INFO.domain}/about#webpage`,
    url: `${BUSINESS_INFO.domain}/about`,
    name: 'About NEED ELECTRO | Founder, Products & Services Bangladesh',
    description: 'Discover NEED ELECTRO, founded by Amdadur Rahman. Explore electrical products, laptops, computers, CCTV solutions, technical services, and software development in Bangladesh.',
    mainEntity: {
      '@type': 'Organization',
      '@id': `${BUSINESS_INFO.domain}/#organization`,
      name: 'NEED ELECTRO',
      alternateName: 'NEED ELECTRO STORE',
      legalName: 'NEED ELECTRO',
      tagline: 'Trusted Electrical and Technological Solutions',
      founder: {
        '@type': 'Person',
        name: 'Amdadur Rahman',
        jobTitle: 'Founder & CEO',
      },
      parentOrganization: {
        '@type': 'Organization',
        name: 'AMDADS GROUP',
      },
      url: BUSINESS_INFO.domain,
      logo: `${BUSINESS_INFO.domain}/logo-icon.png`,
      email: 'needelectro23@gmail.com',
      telephone: '+8801733983752',
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_INFO.address.streetAddress,
        addressLocality: BUSINESS_INFO.address.addressLocality,
        addressRegion: BUSINESS_INFO.address.addressRegion,
        postalCode: BUSINESS_INFO.address.postalCode,
        addressCountry: 'BD',
      },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* 1. HERO HEADER */}
      <section className="relative py-12 sm:py-16 px-3 sm:px-6 lg:px-8 3xl:px-12 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-blue-50/80 via-white to-transparent dark:from-blue-950/25 dark:via-[#060a14] dark:to-transparent overflow-hidden">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto space-y-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 bg-[#008CFF]/10 border border-[#008CFF]/20 text-[#008CFF] px-3.5 py-1 rounded-full text-xs font-bold tracking-wide">
              <Sparkles size={13} className="text-[#008CFF]" />
              <span>A Sister Concern of AMDADS GROUP</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-1 rounded-full text-xs font-semibold">
              <Building2 size={13} />
              <span>Operational Base: Moulvibazar, Bangladesh</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl 3xl:text-6xl font-black text-[#002B5B] dark:text-white tracking-tight leading-tight">
            About NEED ELECTRO — Trusted Electrical &amp; Technological Solutions
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
            NEED ELECTRO is a technology-driven electrical, electronics, and digital solutions platform in Bangladesh. Founded by <strong>Amdadur Rahman</strong>, we are building an integrated ecosystem where customers can explore electrical equipment, purchase laptops and computers, discover CCTV and security systems, book certified on-site technical services, and access bespoke software development through one dependable digital platform.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="#contact-info"
              className="bg-[#008CFF] hover:bg-[#0070cc] text-white px-5 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#008CFF]/25 transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Phone size={15} />
              <span>Contact &amp; Inquire</span>
            </a>
            <Link
              href="/shop"
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-5 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700/80 transition-colors inline-flex items-center gap-2 shadow-xs active:scale-95"
            >
              <span>Explore Marketplace →</span>
            </Link>
            <Link
              href="/services"
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-5 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700/80 transition-colors inline-flex items-center gap-2 shadow-xs active:scale-95"
            >
              <Wrench size={15} className="text-[#008CFF]" />
              <span>Book Technical Services</span>
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full px-3 sm:px-6 lg:px-8 3xl:px-12 py-10 sm:py-14 flex-1 space-y-12 sm:space-y-16">

        {/* 2. WHO WE ARE */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-md space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#008CFF] bg-[#008CFF]/10 px-3 py-1 rounded-full border border-[#008CFF]/20">
            <Compass size={13} />
            <span>Who We Are</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white tracking-tight">
            Connecting Electrical Expertise with Modern Technology
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              NEED ELECTRO is a technology-driven electrical, electronics, and digital solutions platform in Bangladesh, operating as a proud sister concern of <strong>AMDADS GROUP</strong>. Founded by <strong>Amdadur Rahman</strong>, NEED ELECTRO was established with a clear vision: to make electrical services, modern computing products, and transformative digital solutions accessible to individuals, households, offices, retailers, and educational organizations.
            </p>
            <p>
              Our tagline, <strong>“Trusted Electrical and Technological Solutions,”</strong> reflects our core commitment to connecting verified, reliable electrical engineering with state-of-the-art technological hardware and modern software. We are building an integrated platform where customers can browse high-grade electrical components, purchase laptops and desktop computers, deploy CCTV security systems, request on-site technical services, and commission software development solutions through one convenient digital hub.
            </p>
            <p>
              With our operational base in Moulvibazar, Bangladesh, NEED ELECTRO serves clients locally across Sylhet Division and nationwide through our online marketplace, verified courier delivery, and certified technician network. Product delivery and on-site technical services depend on product availability, delivery coverage, service location, and operational capacity.
            </p>
            <p className="font-semibold text-slate-900 dark:text-white bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200/70 dark:border-blue-900/50">
              💡 <strong>Our Primary Objective:</strong> To simplify how people find technology products, maintain electrical systems, enhance premises security, and adopt modern digital solutions for everyday life and business growth.
            </p>
          </div>
        </section>

        {/* 3. FOUNDER AND LEADERSHIP */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Executive Badge / Avatar Column */}
            <div className="lg:col-span-4 flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#002B5B] via-[#008CFF] to-sky-400 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-xl shadow-[#008CFF]/25 border-4 border-white dark:border-slate-800 mb-4">
                AR
              </div>
              <h3 className="text-xl font-black text-[#002B5B] dark:text-white">
                Amdadur Rahman
              </h3>
              <p className="text-xs font-bold text-[#008CFF] uppercase tracking-wider mt-0.5">
                Founder &amp; CEO
              </p>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                NEED ELECTRO • AMDADS GROUP
              </span>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/80 w-full flex items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-[#008CFF]" /> Moulvibazar, BD
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" /> Executive Head
                </span>
              </div>
            </div>

            {/* Leadership Story */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#008CFF] bg-[#008CFF]/10 px-3 py-1 rounded-full border border-[#008CFF]/20">
                <User size={13} />
                <span>Our Founder &amp; Leadership</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white tracking-tight">
                A Vision for an Integrated Tech Ecosystem in Bangladesh
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  Amdadur Rahman founded NEED ELECTRO with the ambition of developing a unified electrical, technological, and software ecosystem for Bangladesh. His vision is to bring electrical engineering services, computing electronics, security systems, enterprise software, and vocational skills development together into a single, seamless platform.
                </p>
                <p>
                  He aims to build a customer-focused technology company that addresses practical problems faced by households, university students, freelance professionals, entrepreneurs, and commercial organizations. The vision extends beyond selling hardware: it includes making technical assistance easier to access, supporting digital transformation for local businesses, and creating tangible pathways for youths to develop employable technical skills.
                </p>
                <p>
                  Under his leadership, NEED ELECTRO focuses on digital innovation, customer convenience, responsible technical execution, and long-term sustainable growth. The company aspires to become the country&apos;s most trusted destination for integrated electrical and technological solutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MISSION & VISION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Mission Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-200/90 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#008CFF] flex items-center justify-center border border-blue-200/80 dark:border-blue-800">
                <Target size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white">
                Our Mission
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Our mission is to make electrical and technological solutions safer, more accessible, convenient, and reliable for customers throughout Bangladesh.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We aim to connect people with relevant products, professional technical assistance, and digital services through a customer-focused online platform. By combining product discovery, online ordering, service booking, and custom software, we seek to simplify finding appropriate support for everyday technological needs.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We also believe that practical skills and employment opportunities are essential for sustainable economic empowerment. Through our broader ecosystem, we actively encourage technical learning and hands-on skill development.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-[#008CFF] flex items-center gap-1.5">
              <span>Safety • Accessibility • Convenience • Reliability</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-200/90 dark:border-sky-900/60 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/80 dark:border-sky-800">
                <Compass size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] dark:text-white">
                Our Vision
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Our vision is to become the leading integrated electrical and technology platform in Bangladesh, bringing products, professional engineering, software solutions, skills development, and employment opportunities together within one ecosystem.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We want NEED ELECTRO to be the most dependable destination for people searching for laptops, desktop computers, CCTV cameras, electrical equipment, technical services, and digital business solutions.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Through continuous improvement, responsible business practices, and customer-oriented innovation, we aim to contribute meaningfully to a more connected, digitally enabled Bangladesh.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <span>One Platform • Connected Future • Empowered Bangladesh</span>
            </div>
          </div>
        </section>

        {/* 5. OUR PRODUCTS: ELECTRICAL EQUIPMENT & MODERN TECHNOLOGY */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#008CFF] bg-[#008CFF]/10 px-3 py-1 rounded-full border border-[#008CFF]/20 mb-2">
                <Layers size={13} />
                <span>Our Products Marketplace</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white tracking-tight">
                Electrical Equipment &amp; Modern Technology
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs sm:text-sm font-bold text-[#008CFF] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore All Products in Store</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
            NEED ELECTRO provides an online marketplace for electrical products, computing devices, electronics, and technology accessories. Our goal is to help customers discover suitable products for personal, educational, residential, and professional requirements with verified specifications and official showroom warranties.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Category 1: Laptops and Computers */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#008CFF] transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#008CFF] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Laptop size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B] dark:text-white group-hover:text-[#008CFF] transition-colors">
                  Laptops and Computers
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We serve students, freelancers, office professionals, businesses, and organizations looking for reliable computing. Customers can explore business laptops, student laptops, desktop computers, monitors, and parts from HP, Dell, and Lenovo with flexible in-house EMI installment plans.
                </p>
              </div>
              <Link
                href="/laptops"
                className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1"
              >
                <span>Browse Laptops &amp; PCs →</span>
              </Link>
            </div>

            {/* Category 2: CCTV Cameras and Security Systems */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#008CFF] transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B] dark:text-white group-hover:text-cyan-600 transition-colors">
                  CCTV Cameras &amp; Security Systems
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  High-definition surveillance equipment for homes, offices, retail shops, and warehouses. We supply crystal-clear IP and HD analog cameras, DVR/NVR recorders, surveillance hard drives, and complete turnkey technician installation with real-time smartphone remote viewing.
                </p>
              </div>
              <Link
                href="/cctv"
                className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1"
              >
                <span>View CCTV Systems →</span>
              </Link>
            </div>

            {/* Category 3: Electrical Products and Components */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B] dark:text-white group-hover:text-amber-600 transition-colors">
                  Electrical Products &amp; Components
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Certified copper wiring, miniature circuit breakers (MCB), residual current circuit breakers (RCCB), main distribution boards (DB), heavy-duty switches, conduit fittings, and industrial hardware meeting Bangladesh National Building Code (BNBC) safety standards.
                </p>
              </div>
              <Link
                href="/electrical-products"
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                <span>Explore Electrical Supplies →</span>
              </Link>
            </div>

            {/* Category 4: Networking Equipment & Smart Devices */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#008CFF] transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wifi size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B] dark:text-white group-hover:text-indigo-600 transition-colors">
                  Networking Equipment &amp; Smart Devices
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dual-band and Wi-Fi 6 wireless routers, high-capacity Gigabit PoE switches for CCTV, optical fiber ONU modems, router mini UPS backups, intelligent home automation plugs, and high-resolution display adapters.
                </p>
              </div>
              <Link
                href="/networking"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>View Networking Hardware →</span>
              </Link>
            </div>

            {/* Category 5: Technology Accessories */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#008CFF] transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Cpu size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B] dark:text-white group-hover:text-purple-600 transition-colors">
                  Technology Accessories &amp; Upgrades
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  High-speed NVMe and SATA SSD upgrades, DDR4/DDR5 laptop and desktop RAM modules, wireless ergonomic mice, mechanical keyboards, gaming headsets, USB Type-C hubs, power adapters, and display converters with replacement warranties.
                </p>
              </div>
              <Link
                href="/computer-accessories"
                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
              >
                <span>Browse Accessories →</span>
              </Link>
            </div>

            {/* Marketplace Quality Assurance Note */}
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#002B5B] to-[#008CFF] text-white flex flex-col justify-between space-y-3 shadow-md">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-200 block">
                  Transparency Notice
                </span>
                <h3 className="text-base font-bold">
                  Verified Pricing &amp; Showroom Warranty
                </h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Product prices, specifications, availability, warranty conditions, and delivery options may vary. Customers can review full specifications or contact our team directly for up-to-date quotes and stock verification before ordering.
                </p>
              </div>
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-xl transition-all self-start inline-flex items-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call Hotline: {BUSINESS_INFO.phone}</span>
              </a>
            </div>
          </div>
        </section>

        {/* 6. ENGINEERING & TECHNICAL SERVICES */}
        <section className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#008CFF] bg-[#008CFF]/10 px-3 py-1 rounded-full border border-[#008CFF]/20 mb-2">
              <Wrench size={13} />
              <span>Professional Technical Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white tracking-tight">
              Electrical, Security &amp; Software Engineering
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl mt-1 leading-relaxed">
              We connect homes and businesses with certified technical professionals rather than forcing customers to attempt hazardous electrical repairs or complex IT setups alone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service 1: Electrical Installation & Repair */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B] dark:text-white">
                  Electrical Installation, Maintenance &amp; Repair
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Residential and commercial conduit wiring, distribution board (DB) load balancing, circuit breaker upgrades, earth resistance testing, short-circuit troubleshooting, and emergency callouts.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Single-phase &amp; 3-phase inspection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Concealed wiring &amp; DB load balancing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Emergency electrician dispatch</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/services/electrician"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs text-center transition-colors shadow-xs"
              >
                Book an Electrician →
              </Link>
            </div>

            {/* Service 2: CCTV Installation & Technical Support */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center border border-cyan-200">
                  <Camera size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B] dark:text-white">
                  CCTV Installation &amp; Technical Support
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Turnkey security surveillance deployment for homes, retail stores, tea estates, and institutions. Includes NVR/DVR setup, Cat6 cabling, mobile live streaming, computer diagnostics, and IPS/inverter power backup.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Hikvision &amp; Dahua IP camera setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Smartphone remote live view configuration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Solar IPS &amp; inverter power backups</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/services/cctv-installation"
                className="w-full py-2.5 px-4 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs text-center transition-colors shadow-xs"
              >
                Book CCTV Installation →
              </Link>
            </div>

            {/* Service 3: Software Development & Digital Solutions */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#008CFF] flex items-center justify-center border border-blue-200">
                  <Code2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#002B5B] dark:text-white">
                  Software Development &amp; Digital Business Solutions
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We empower organizations with more than just an online presence. We build structured digital systems for inventory tracking, automated sales reporting, customer accounts, and integrated workflows.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Website design &amp; enterprise web applications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Accounting, inventory &amp; POS systems</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Enterprise Resource Planning (ERP)</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/services/networking"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors shadow-xs"
              >
                Inquire Software Solutions →
              </Link>
            </div>
          </div>
        </section>

        {/* 7. SKILLS DEVELOPMENT & EMPLOYMENT OPPORTUNITIES */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50/60 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 shadow-md space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            <GraduationCap size={14} />
            <span>Youth Empowerment &amp; Practical Education</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white tracking-tight">
            Skills Development &amp; Employment Opportunities
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              Skills development is an integral pillar of the broader NEED ELECTRO ecosystem. We recognize the profound value of practical, hands-on technical education, especially for energetic young individuals who wish to build employable technical careers in Bangladesh.
            </p>
            <p>
              Our broader initiative supports hands-on learning across critical vocational disciplines: <strong>electrical installation, wiring fundamentals, CCTV surveillance setup, computer hardware diagnostics, thermal servicing, and network cabling</strong>.
            </p>
            <p>
              Our long-term objective is to bridge learning with real-world experience and direct employment opportunities. By mentoring capable technical professionals, we strengthen our own engineering service network while empowering youths to apply their technical knowledge to build stable, rewarding livelihoods.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg block">01. Practical Training</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Real-world wiring, computer diagnostic testing, and CCTV configuration in our workshop.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[#008CFF] font-black text-lg block">02. Field Experience</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Accompanying verified senior technicians on actual residential and commercial service calls.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-purple-600 dark:text-purple-400 font-black text-lg block">03. Career Placement</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Opportunities to join the NEED ELECTRO technician fleet or partner service hubs.</p>
            </div>
          </div>
        </section>

        {/* 8. WHY CHOOSE NEED ELECTRO? (7 PILLARS) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#008CFF] bg-[#008CFF]/10 px-3 py-1 rounded-full border border-[#008CFF]/20">
              <Award size={13} />
              <span>Core Strengths</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white tracking-tight">
              Why Choose NEED ELECTRO?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              The seven principles that drive our customer service and technical excellence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#008CFF] font-mono">01. Integrated Platform</span>
              <h3 className="font-bold text-sm text-[#002B5B] dark:text-white">All-in-One Destination</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We connect electrical products, laptops, security hardware, professional repairs, and software through one unified platform.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#008CFF] font-mono">02. Customer Convenience</span>
              <h3 className="font-bold text-sm text-[#002B5B] dark:text-white">Fast Ordering &amp; Booking</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Streamlined marketplace checkout, open-box cash on delivery, and instant online technician scheduling at your fingertips.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#008CFF] font-mono">03. Technology-Driven</span>
              <h3 className="font-bold text-sm text-[#002B5B] dark:text-white">Smart ERP Infrastructure</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Live inventory tracking, automated serialized warranties, SMS dispatch notifications, and modern digital portals.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#008CFF] font-mono">04. Practical Solutions</span>
              <h3 className="font-bold text-sm text-[#002B5B] dark:text-white">Tailored to Real Needs</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We solve actual problems faced by homeowners, students, freelancers, retail shops, and offices within realistic budgets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#008CFF] font-mono">05. Nationwide Ambition</span>
              <h3 className="font-bold text-sm text-[#002B5B] dark:text-white">Nationwide Delivery</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Headquartered in Moulvibazar, serving all 64 districts in Bangladesh with safe insured courier delivery.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-[#008CFF] font-mono">06. Skills &amp; Opportunity</span>
              <h3 className="font-bold text-sm text-[#002B5B] dark:text-white">Vocational Empowerment</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practical technical education, mentoring, and direct career opportunities for aspiring electrical and IT technicians.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 sm:col-span-2">
              <span className="text-xs font-bold text-[#008CFF] font-mono">07. Commitment to Trust</span>
              <h3 className="font-bold text-sm text-[#002B5B] dark:text-white">Uncompromising Honesty &amp; Transparency</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We believe trust grows through clear product specifications, honest pricing, responsible technical workmanship, and continuous improvement. We give customers the exact information they need to make confident decisions.
              </p>
            </div>
          </div>
        </section>

        {/* 9. WHO WE SERVE */}
        <section className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#008CFF] bg-[#008CFF]/10 px-3 py-1 rounded-full border border-[#008CFF]/20 mb-2">
              <Briefcase size={13} />
              <span>Target Customers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white tracking-tight">
              Who We Serve
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Tailoring technology and electrical services to distinct lifestyle and commercial requirements
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#008CFF] flex items-center justify-center font-bold">
                🏠
              </div>
              <h3 className="font-bold text-base text-[#002B5B] dark:text-white">Households</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Safe home electrical wiring, circuit breaker maintenance, security camera installation, smart devices, and solar/IPS power backup.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                🎓
              </div>
              <h3 className="font-bold text-base text-[#002B5B] dark:text-white">Students &amp; Freelancers</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Affordable laptops with monthly EMI plans, high-speed NVMe upgrades, chip-level servicing, and high-performance study/work tools.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                🏢
              </div>
              <h3 className="font-bold text-base text-[#002B5B] dark:text-white">Offices &amp; Organizations</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Desktop PC fleets, structured Cat6 LAN cabling, Gigabit switches, attendance biometric systems, and continuous IT support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                🏪
              </div>
              <h3 className="font-bold text-base text-[#002B5B] dark:text-white">Retailers &amp; Businesses</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Commercial electrical panels, 24/7 CCTV surveillance with remote viewing, custom point-of-sale (POS), and enterprise software.
              </p>
            </div>
          </div>
        </section>

        {/* 10. OUR COMMITMENT & LOOKING AHEAD */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#008CFF] bg-[#008CFF]/10 px-3 py-1 rounded-full border border-[#008CFF]/20">
            <Globe size={13} />
            <span>National Vision</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white tracking-tight">
            Our Commitment to Bangladesh &amp; Looking Ahead
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              Bangladesh is experiencing a rapidly accelerating demand for computing hardware, electrical safety infrastructure, security surveillance, and digital business automation. NEED ELECTRO is dedicated to contributing to this developing landscape by making relevant products and certified engineering services transparent and easily accessible.
            </p>
            <p>
              From our operational headquarters in Moulvibazar, we are building a scalable digital platform with national ambitions. We continuously refine our product marketplace, strengthen technician dispatch coordination, expand computing categories, and deploy practical software tools for enterprises.
            </p>
            <p>
              <strong>NEED ELECTRO is more than an online product marketplace.</strong> It represents our ambition to build an integrated electrical and technological ecosystem for modern Bangladesh. Our journey is guided by a simple, enduring purpose: to make electrical and technological solutions more accessible, practical, and convenient for the people and businesses we serve.
            </p>
          </div>
        </section>

        {/* 11. OFFICIAL COMPANY PROFILE & CONTACT CARD */}
        <section id="contact-info" className="glass-panel p-6 sm:p-10 rounded-3xl border border-[#008CFF]/30 bg-gradient-to-br from-white via-blue-50/40 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#008CFF]">
                Official Profile &amp; Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#002B5B] dark:text-white mt-1">
                Contact NEED ELECTRO
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Showroom &amp; Support Open
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Company Name</span>
              <span className="font-extrabold text-[#002B5B] dark:text-white text-base">NEED ELECTRO</span>
              <p className="text-[11px] text-slate-500">A Sister Concern of AMDADS GROUP</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Founder &amp; CEO</span>
              <span className="font-extrabold text-[#002B5B] dark:text-white text-base">Amdadur Rahman</span>
              <p className="text-[11px] text-slate-500">Executive Head of NEED ELECTRO</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Tagline</span>
              <span className="font-extrabold text-[#008CFF] text-sm block">
                &ldquo;Trusted Electrical and Technological Solutions&rdquo;
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Operational Base</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {BUSINESS_INFO.address.streetAddress}, {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion} - {BUSINESS_INFO.address.postalCode}, Bangladesh.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Direct Phone Hotline</span>
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="font-bold text-[#008CFF] hover:underline font-mono text-base block"
              >
                +880 1733-983752
              </a>
              <p className="text-[11px] text-slate-500">Sat – Thu: 9:30 AM – 9:30 PM</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Email</span>
              <a
                href="mailto:needelectro23@gmail.com"
                className="font-bold text-[#008CFF] hover:underline font-mono text-sm block truncate"
              >
                needelectro23@gmail.com
              </a>
              <p className="text-[11px] text-slate-500">Inquiries, quotes &amp; corporate support</p>
            </div>
          </div>

          {/* Interactive Action Bar */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="px-5 py-2.5 min-h-[42px] rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#008CFF]/20 transition-all active:scale-95"
              >
                <Phone size={14} />
                <span>Call +880 1733-983752</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <MessageCircle size={14} />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href="mailto:needelectro23@gmail.com"
                className="px-5 py-2.5 min-h-[42px] rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-2"
              >
                <Mail size={14} className="text-[#008CFF]" />
                <span>Send Email</span>
              </a>
            </div>

            <p className="text-xs font-bold text-[#002B5B] dark:text-white">
              NEED ELECTRO — Trusted Electrical and Technological Solutions for Bangladesh.
            </p>
          </div>
        </section>

      </main>

      <CustomerFooter />
    </div>
  );
}
