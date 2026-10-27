import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  BUSINESS_INFO,
  generateSeoMetadata,
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
  buildItemListSchema,
} from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import {
  MapPin, Phone, MessageCircle, Laptop, Camera, Zap,
  ShieldCheck, CheckCircle2, Clock, CreditCard, ArrowRight,
  Truck, Cpu, HelpCircle, Star, Wrench, ChevronRight
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Computer & Laptop Shop in Moulvibazar | NEED ELECTRO',
    description:
      "Moulvibazar's trusted computer and laptop shop. Buy genuine HP, Dell, Lenovo laptops, desktop PCs, and CCTV cameras with warranty & fast local delivery.",
    path: '/moulvibazar',
    keywords: [
      'Computer shop in Moulvibazar',
      'Computer shop Moulvibazar',
      'Laptop shop in Moulvibazar',
      'Laptop shop Moulvibazar',
      'Computer store Moulvibazar',
      'Computer showroom Moulvibazar',
      'Computer dealer Moulvibazar',
      'Computer shop in Moulvibazar Bangladesh',
      'Best computer shop in Moulvibazar',
      'Best laptop shop in Moulvibazar',
      'Where to buy laptop in Moulvibazar',
      'Where to buy computer in Moulvibazar',
      'Computer accessories in Moulvibazar',
      'Laptop price in Bangladesh',
      'Laptop price in Moulvibazar',
      'Computer price in Moulvibazar',
      'Desktop price Moulvibazar',
      'Monitor price Moulvibazar',
      'Router price Moulvibazar',
      'SSD price Moulvibazar',
      'Printer price Moulvibazar',
      'CCTV camera shop in Moulvibazar',
      'CCTV camera Moulvibazar',
      'CCTV installation in Moulvibazar',
      'Computer service Moulvibazar',
      'Laptop repair Moulvibazar',
      'Used laptop in Moulvibazar',
      'HP laptop in Moulvibazar',
      'Dell laptop in Moulvibazar',
      'Lenovo laptop in Moulvibazar',
      'Electrician in Moulvibazar',
      'Laptop EMI in Moulvibazar',
      'মৌলভীবাজার ল্যাপটপের দোকান',
      'কম্পিউটার দোকান মৌলভীবাজার',
      'সিসিটিভি ক্যামেরা মৌলভীবাজার',
      'ল্যাপটপ কিস্তিতে',
      'মৌলভীবাজার কম্পিউটার দোকান',
      'মৌলভীবাজার ল্যাপটপ শপ',
      'মৌলভীবাজার সিসি ক্যামেরা',
      'মৌলভীবাজার কম্পিউটার সার্ভিসিং',
      'মৌলভীবাজার সিসি ক্যামেরা ইনস্টলেশন',
      'ল্যাপটপ কিস্তিতে মৌলভীবাজার',
    ],
  });
}

export default async function MoulvibazarPage() {
  const localSchema = buildLocalBusinessSchema();

  // Query top featured products in Moulvibazar active stock
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        brand: true,
        model: true,
        description: true,
        imageUrl: true,
        retailPrice: true,
        emiPrice: true,
        currentStock: true,
        warrantyPeriodMonths: true,
        specs: true,
      },
      take: 12,
      orderBy: [{ currentStock: 'desc' }, { updatedAt: 'desc' }],
    });
  } catch (err) {
    console.error('Moulvibazar query error:', err);
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Moulvibazar Hub', path: '/moulvibazar' },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  const featuredItemListSchema = buildItemListSchema({
    name: 'Top Laptops and Computers in Moulvibazar Stock',
    description: 'Authentic laptops, desktop computers, CCTV equipment and accessories in Moulvibazar, Bangladesh.',
    url: '/moulvibazar',
    items: products.slice(0, 8).map((p) => ({
      name: p.name,
      url: `/product/${p.name ? p.name.toLowerCase().replace(/[\s\W-]+/g, '-') : 'product'}-${p.sku.toLowerCase()}`,
      image: p.imageUrl,
      price: Number(p.retailPrice),
      brand: p.brand,
      category: p.category,
    })),
  });

  const faqs = [
    {
      question: 'Can I get laptops on EMI in Moulvibazar?',
      answer:
        'Yes! NEED ELECTRO provides flexible 0% interest laptop and desktop computer installment plans (3 to 12 months) for eligible students, professionals, and residents in Moulvibazar. Check our dedicated EMI page or contact our team on WhatsApp for fast qualification with local guarantor or NID.',
    },
    {
      question: 'Do you provide home delivery in Moulvibazar & Sylhet?',
      answer:
        'Yes. We provide express doorstep delivery across Moulvibazar town, all upazilas (Sreemangal, Kulaura, Rajnagar, Kamalganj, Barlekha), and Sylhet Division. Local delivery is same-day or within 24 hours with Cash on Delivery (COD), bKash payment, and open-box parcel inspection before payment.',
    },
    {
      question: 'Do you offer CCTV camera installation in Moulvibazar?',
      answer:
        'Yes. Our certified security technicians provide on-site HD and IP CCTV camera installation, DVR/NVR configuration, mobile app live view setup, and licensed electrical wiring services across Moulvibazar Sadar, Sreemangal, Kulaura, Rajnagar, Kamalganj, and Barlekha.',
    },
    {
      question: 'Where is NEED ELECTRO located in Moulvibazar, and how can I purchase?',
      answer:
        'NEED ELECTRO operates its central technology hub, customer fulfillment center, and technician servicing workshop from Central Road, NEED ELECTRO Building, Moulvibazar 3200, Bangladesh. You can order directly online through needelectro.store or consult our sales team via WhatsApp/phone.',
    },
    {
      question: 'What warranty and replacement guarantees are provided for laptops in Moulvibazar?',
      answer:
        'Every pre-owned and new laptop supplied by NEED ELECTRO includes a 7-day instant replacement guarantee and 2 years of free service warranty handled directly at our Moulvibazar technical lab. Devices undergo 24-point hardware stress testing covering motherboard health, battery runtime, display panel, and thermals.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredItemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero Section — Core Search Intent H1 */}
      <section className="py-12 sm:py-16 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/80 via-transparent to-transparent dark:from-blue-950/30">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <MapPin size={14} />
            <span>Moulvibazar Central Tech Hub &amp; Online Marketplace</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Computer &amp; Laptop Shop in Moulvibazar — NEED ELECTRO
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Welcome to {BUSINESS_INFO.name}, Moulvibazar’s premier technology marketplace and certified technical solutions hub. We supply genuine HP, Dell, and Lenovo laptops, custom desktop computers, CCTV security packages, and smart electronic accessories with official warranty, transparent pricing in BDT, and express doorstep delivery across all upazilas in Moulvibazar.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <Phone size={14} />
              <span>Call Helpline: {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%20Moulvibazar%2C%20I%20am%20looking%20for%20a%20laptop%20or%20computer...`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageCircle size={15} />
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              href="/laptop-emi"
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-blue-700 dark:text-cyan-300 px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <CreditCard size={14} />
              <span>0% Laptop EMI Plans →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Operational Transparency & Local Delivery Information Card */}
      <section className="py-8 px-4 bg-white dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-blue-600 dark:text-cyan-400 font-bold block text-sm flex items-center gap-1.5">
              <MapPin size={15} /> Central Tech Hub
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion} - {BUSINESS_INFO.address.postalCode}, Bangladesh.
            </p>
            <span className="text-slate-500 text-[11px] block">Central dispatch and hardware testing workshop.</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-blue-600 dark:text-cyan-400 font-bold block text-sm flex items-center gap-1.5">
              <Truck size={15} /> Express Local Delivery
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              Same-day in Moulvibazar town; 24h across Sreemangal, Kulaura, Rajnagar, Kamalganj, and Barlekha.
            </p>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] block">৳60 Local Delivery Rate • Cash on Delivery</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-blue-600 dark:text-cyan-400 font-bold block text-sm flex items-center gap-1.5">
              <ShieldCheck size={15} /> Warranty &amp; Testing Lab
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              7-Day Instant Replacement Guarantee &amp; 2 Years Free Service Warranty with genuine spare parts.
            </p>
            <span className="text-slate-500 text-[11px] block">24-point hardware stress testing before dispatch.</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-blue-600 dark:text-cyan-400 font-bold block text-sm flex items-center gap-1.5">
              <Clock size={15} /> Operating Hours
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              Saturday – Thursday: <strong>9:30 AM – 9:30 PM</strong>
            </p>
            <span className="text-amber-600 dark:text-amber-400 text-[11px] block">Friday: Closed (WhatsApp orders active).</span>
          </div>
        </div>
      </section>

      {/* Featured Products in Moulvibazar Stock */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Popular Computers &amp; Laptops in Moulvibazar Stock
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Genuine devices ready for immediate local dispatch or pickup with official warranty
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/laptops"
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All Laptops</span>
              <ArrowRight size={13} />
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              href="/computers"
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Desktop PCs</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.id,
                name: item.name,
                sku: item.sku,
                category: item.category,
                brand: item.brand,
                model: item.model,
                description: item.description,
                imageUrl: item.imageUrl,
                retailPrice: Number(item.retailPrice),
                emiPrice: item.emiPrice ? Number(item.emiPrice) : undefined,
                currentStock: item.currentStock,
                warrantyPeriodMonths: item.warrantyPeriodMonths,
                specs: item.specs,
              }}
            />
          ))}
        </div>
      </section>

      {/* Local Authority & Relevance: Dedicated Sections Targeting Core Search Intent */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Section 1: Computer & Laptop Shop Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Authorized Models &amp; Tested Hardware
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Why Buy Your Laptop &amp; Computer from NEED ELECTRO Moulvibazar?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Investing in a laptop or desktop computer is a critical decision for your career, education, or business. Unlike informal sellers, {BUSINESS_INFO.name} operates its dedicated tech hub right in Moulvibazar. Every laptop undergoes comprehensive hardware diagnostics: battery health, motherboard circuits, screen pixels, keyboard switches, NVMe SSD speed, and thermal stability under heavy load.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span><strong>HP EliteBook &amp; ProBook:</strong> Business-grade aluminum chassis laptops for professionals and students.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span><strong>Dell Latitude &amp; Inspiron:</strong> High-reliability workhorses ideal for office productivity and multitasking.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span><strong>Lenovo ThinkPad:</strong> Legendary keyboard tactile comfort and rugged durability for coders and writers.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span><strong>Custom Desktop PCs:</strong> Custom Intel Core and AMD Ryzen configurations assembled with warranty.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/laptops"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <span>Explore Laptops in Moulvibazar</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-[#008CFF]" />
                <span>Laptop EMI Installments in Moulvibazar</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you a university student, freelancer, or school teacher in Moulvibazar looking for a budget-friendly way to own an authentic laptop? Take advantage of our in-house 0% Laptop EMI facilities. Choose 3, 6, or 12-month payment options with minimal paperwork and instant eligibility review.
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/40 text-xs text-blue-900 dark:text-cyan-200">
                <strong>Quick Requirements:</strong> Valid NID, student/job ID, and local guarantor in Moulvibazar district.
              </div>
              <Link
                href="/laptop-emi"
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline block"
              >
                Calculate Monthly Installments →
              </Link>
            </div>
          </div>

          {/* Section 2: CCTV Camera Shop & Installation in Moulvibazar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-slate-100 dark:border-slate-800 pt-8">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Surveillance &amp; Security Engineering
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                CCTV Camera Shop &amp; Security Installation in Moulvibazar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Protect your residence, shop, warehouse, or educational institution in Moulvibazar with high-definition CCTV security solutions from Hikvision, Dahua, and Ezviz. We provide complete turnkey security packages, including IP cameras, Night Vision ColorVu sensors, DVR/NVR setup, Cat6 shielded network cabling, and real-time remote smartphone monitoring.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Home &amp; Shop Packages</span>
                  <span className="text-slate-500 text-[11px]">2, 4, and 8 camera sets with DVR &amp; 1TB storage</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Smart Wi-Fi Cameras</span>
                  <span className="text-slate-500 text-[11px]">360° pan-tilt, two-way audio &amp; motion tracking</span>
                </div>
              </div>
              <div className="pt-1 flex items-center gap-3">
                <Link
                  href="/cctv"
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <span>View CCTV Cameras</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/services/cctv-installation"
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Book On-Site Survey →
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Accessories &amp; Component Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Gadget &amp; Computer Accessories Shop in Moulvibazar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Upgrade your current workstation with authentic accessories sourced directly from official distribution channels. Need Electro stocks high-speed NVMe M.2 SSDs (Kingston, Samsung, HP), DDR4/DDR5 RAM, precision mechanical keyboards, wireless mice, dual-band Wi-Fi routers, power strips, and HDMI/Type-C display adapters.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">NVMe SSDs</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">RAM Upgrades</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">Wi-Fi 6 Routers</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">Laptop Chargers</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">USB-C Hubs</span>
              </div>
              <div className="pt-1">
                <Link
                  href="/computer-accessories"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  <span>Browse Gadgets &amp; Accessories →</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Certified Technical Services Grid */}
      <section className="py-12 px-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Technology &amp; Electrical Services in Moulvibazar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Experienced technicians dispatched directly across Moulvibazar district
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <Laptop size={28} className="text-blue-600 dark:text-cyan-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Laptop Repair &amp; Servicing Lab</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Hardware diagnostics, NVMe SSD speed upgrade, RAM expansion, genuine battery replacement, keyboard swap, cooling fan cleaning, and genuine Windows OS driver tuning.
              </p>
              <Link href="/services/laptop-computer-repair" className="text-blue-600 dark:text-cyan-400 font-bold block pt-2 hover:underline">
                Book Laptop Servicing →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <Camera size={28} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">CCTV Camera Installation</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Full setup of HD analog and IP security cameras for residences, business retail counters, and factories across Moulvibazar with mobile app live streaming.
              </p>
              <Link href="/services/cctv-installation" className="text-blue-600 dark:text-cyan-400 font-bold block pt-2 hover:underline">
                Book CCTV Survey →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <Zap size={28} className="text-amber-500 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Licensed Electrician Booking</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Concealed wall wiring, distribution board (DB) setup, circuit breaker replacements, earthing safety, and rapid electrical troubleshooting across town.
              </p>
              <Link href="/services/electrician" className="text-amber-600 dark:text-amber-400 font-bold block pt-2 hover:underline">
                Book an Electrician →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section (FAQPage Schema Supported) */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions About Shopping in Moulvibazar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear answers regarding ordering, warranties, delivery, and services in Moulvibazar
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-start gap-2">
                  <HelpCircle size={16} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bilingual Bangla SEO Content */}
      <section className="py-12 px-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            মৌলভীবাজার জেলা ও শহরে নির্ভরযোগ্য কম্পিউটার ও ল্যাপটপের দোকান — নিড ইলেক্ট্রো
          </h2>
          <p>
            নিড ইলেক্ট্রো (NEED ELECTRO) মৌলভীবাজারের অন্যতম নির্ভরযোগ্য কম্পিউটার ও ল্যাপটপ প্ল্যাটফর্ম। আমরা সরবরাহ করি প্রিমিয়াম কোয়ালিটির এইচপি এলিটবুক, ডেল ল্যাটিচিউড এবং লেনোভো থিঙ্কপ্যাড ল্যাপটপ। প্রতিটি ডিভাইসে রয়েছে ৭ দিনের ইনস্ট্যান্ট রিপ্লেসমেন্ট এবং ২ বছরের ফ্রি সার্ভিস ওয়ারেন্টি। মৌলভীবাজার সদর, কুসুমবাগ, চৌমোহনা, শ্রীমঙ্গল রোড, শামসেরনগর রোড এবং সকল উপজেলায় আমাদের নিজস্ব হোম ডেলিভারি ও কুরিয়ার সুবিধা উপলব্ধ।
          </p>
          <p>
            এছাড়া আমাদের রয়েছে দক্ষ টেকনিশিয়ান টিম। মৌলভীবাজারের বাসা-বাড়ি, দোকান ও প্রতিষ্ঠানের জন্য সিসিটিভি ক্যামেরা ইনস্টলেশন, কম্পিউটার সার্ভিসিং ও দক্ষ ইলেকট্রিশিয়ান সেবা পেতে আমাদের হটলাইনে কল করুন অথবা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-900 dark:text-white">হটলাইন: {BUSINESS_INFO.phone}</span>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400">অপারেশনাল হাব: মৌলভীবাজার, বাংলাদেশ</span>
            <span>•</span>
            <Link href="/locations" className="text-blue-600 dark:text-cyan-400 hover:underline font-semibold">
              ৬৪ জেলার ডেলিভারি তালিকা →
            </Link>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
