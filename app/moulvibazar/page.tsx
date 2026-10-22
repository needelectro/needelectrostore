import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildLocalBusinessSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { MapPin, Phone, MessageCircle, Laptop, Camera, Zap, ShieldCheck, CheckCircle2, Clock, CreditCard, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Computer & Laptop Shop in Moulvibazar | CCTV & Electrical Services | NEED ELECTRO',
    description: 'NEED ELECTRO is Moulvibazar’s premier technology hub located at Shop No: 5, MR Plaza, Kusumbag. Authentic HP, Dell & Lenovo laptops with replacement warranty, desktop computers, CCTV camera installation, certified electrician services, and computer repair.',
    path: '/moulvibazar',
    keywords: [
      'Computer shop in Moulvibazar',
      'Computer price in Moulvibazar',
      'Laptop shop in Moulvibazar',
      'Laptop price in Moulvibazar',
      'CCTV camera shop in Moulvibazar',
      'Tech gadgets in Moulvibazar',
      'Electrical services in Moulvibazar',
      'Laptop and computer servicing',
      'Used laptop in Moulvibazar',
      'HP laptop in Moulvibazar',
      'Dell laptop in Moulvibazar',
      'Lenovo laptop in Moulvibazar',
      'CCTV camera in Moulvibazar',
      'CCTV installation in Moulvibazar',
      'Electrician in Moulvibazar',
      'Laptop EMI in Moulvibazar',
      'মৌলভীবাজার ল্যাপটপের দোকান',
      'মৌলভীবাজার কম্পিউটার দোকান',
      'মৌলভীবাজার সিসিটিভি',
      'ইলেকট্রিশিয়ান মৌলভীবাজার',
    ],
  });
}

export default async function MoulvibazarPage() {
  const localSchema = buildLocalBusinessSchema();

  // Query top featured products in Moulvibazar stock
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
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
      take: 8,
      orderBy: [{ currentStock: 'desc' }, { updatedAt: 'desc' }],
    });
  } catch (err) {
    console.error('Moulvibazar query error:', err);
  }

  const breadcrumbs = [{ name: 'Moulvibazar Hub', path: '/moulvibazar' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/30">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <MapPin size={14} />
            <span>Moulvibazar Town Showroom & Service Center</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Laptop, Computer, CCTV & Electrical Solutions in Moulvibazar
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Welcome to {BUSINESS_INFO.name}, situated at MR Plaza in Kusumbag, Moulvibazar. We are your dedicated neighborhood destination for tested enterprise laptops, custom gaming & office PCs, CCTV security setups, electrical components, licensed electrician services, and flexible laptop EMI installment plans.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <Phone size={14} />
              <span>Call Showroom: {BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20am%20in%20Moulvibazar%20and%20looking%20for...`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageCircle size={15} />
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              href="/laptop-emi"
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-blue-700 dark:text-cyan-300 px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-colors shadow-xs"
            >
              Laptop EMI Options →
            </Link>
          </div>
        </div>
      </section>

      {/* Moulvibazar Location Details Card */}
      <section className="py-10 px-4 bg-white dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-blue-600 dark:text-cyan-400 font-bold block text-sm flex items-center gap-1.5">
              <MapPin size={16} /> Operational Base
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              {BUSINESS_INFO.address.addressLocality}, {BUSINESS_INFO.address.addressRegion} - {BUSINESS_INFO.address.postalCode}, Bangladesh.
            </p>
            <span className="text-slate-500 text-[11px] block">Serving Moulvibazar town, upazilas &amp; nationwide with doorstep delivery.</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-blue-600 dark:text-cyan-400 font-bold block text-sm flex items-center gap-1.5">
              <Clock size={16} /> Opening Hours
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              Saturday to Thursday: <strong>9:30 AM – 9:30 PM</strong>
            </p>
            <span className="text-amber-600 dark:text-amber-400 text-[11px] block">Friday: Closed for weekend maintenance.</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-blue-600 dark:text-cyan-400 font-bold block text-sm flex items-center gap-1.5">
              <ShieldCheck size={16} /> Local Service Coverage
            </span>
            <p className="text-slate-700 dark:text-slate-300">
              Moulvibazar Town, Kusumbag, Chowmuhana, Shamshernagar Road, Sreemangal Road, Barikona, plus Sreemangal and Kulaura.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products in Moulvibazar */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Popular Tech in Moulvibazar Stock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available for hands-on demonstration and immediate pickup today</p>
          </div>
          <Link href="/laptops" className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
            <span>View All Laptops</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(item => (
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
                emiPrice: Number(item.emiPrice),
                currentStock: item.currentStock,
                warrantyPeriodMonths: item.warrantyPeriodMonths,
                specs: item.specs,
              }}
            />
          ))}
        </div>
      </section>

      {/* Local Services Grid */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Technology & Electrical Services in Moulvibazar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Certified technicians dispatched directly from our Kusumbag showroom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Laptop size={28} className="text-blue-600 dark:text-cyan-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Laptop Repair & Upgrades</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                SSD speed upgrade, RAM expansion, battery replacement, keyboard repairs, thermal paste refresh, and Windows OS installation with genuine drivers.
              </p>
              <Link href="/laptops" className="text-blue-600 dark:text-cyan-400 font-bold block pt-2 hover:underline">
                Explore Laptops & Upgrades →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Camera size={28} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">CCTV Camera Installation</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Full setup of HD analog and IP security cameras for residences, business retail counters, and factories across Moulvibazar with mobile app live streaming.
              </p>
              <Link href="/services/cctv-installation" className="text-blue-600 dark:text-cyan-400 font-bold block pt-2 hover:underline">
                Book CCTV Survey →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Zap size={28} className="text-amber-500 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Licensed Electrician Booking</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Concealed wall wiring, distribution board (DB) setup, circuit breaker replacements, earthing safety, and rapid electrical troubleshooting.
              </p>
              <Link href="/services/electrician" className="text-amber-600 dark:text-amber-400 font-bold block pt-2 hover:underline">
                Book an Electrician →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bilingual Bangla SEO Content */}
      <section className="py-12 px-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            মৌলভীবাজার জেলা ও শহরে নির্ভরযোগ্য প্রযুক্তি ও ইলেকট্রিক্যাল সেবাদাতা
          </h2>
          <p>
            নিড ইলেক্ট্রো (NEED ELECTRO) মৌলভীবাজারের কেন্দ্রস্থল কুসুমবাগে অবস্থিত একটি বিশ্বস্ত কম্পিউটার, ল্যাপটপ, সিসিটিভি ক্যামেরা ও ইলেকট্রিক্যাল শপ। আমরা সরবরাহ করি প্রিমিয়াম গ্রেড এইচপি এলিটবুক, ডেল ল্যাটিচিউড এবং লেনোভো থিঙ্কপ্যাড ল্যাপটপ। প্রতিটি ডিভাইসে রয়েছে ৭ দিনের রিপ্লেসমেন্ট এবং ২ বছরের ফ্রি সার্ভিস ওয়ারেন্টি।
          </p>
          <p>
            আমাদের রয়েছে ইন-হাউস দক্ষ টেকনিশিয়ান টিম। মৌলভীবাজার শহর, শ্রীমঙ্গল, কুলাউড়া ও রাজনগরে সিসিটিভি ক্যামেরা ইনস্টলেশন এবং অভিজ্ঞ ইলেকট্রিশিয়ান সার্ভিস বুকিংয়ের জন্য আমাদের সরাসরি ফোন করুন অথবা শোরুমে আসুন।
          </p>
          <div className="pt-2 flex items-center gap-3">
            <span className="font-semibold text-slate-900 dark:text-white">হটলাইন: {BUSINESS_INFO.phone}</span>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400">ঠিকানা: শপ নং ৫, এমআর প্লাজা, কুসুমবাগ, মৌলভীবাজার</span>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
