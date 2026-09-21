import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Laptop, ShieldCheck, CreditCard, CheckCircle2, Phone, MessageCircle, ArrowRight } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Laptops in Moulvibazar | HP, Dell, Lenovo with Warranty & EMI',
    description: 'Looking for genuine laptops in Moulvibazar? Explore authentic HP EliteBook, Dell Latitude, and Lenovo ThinkPad laptops at NEED ELECTRO. 7-day replacement, 2-year service warranty, and flexible laptop EMI installment options.',
    path: '/laptops',
    keywords: [
      'Laptop shop Moulvibazar',
      'Laptop seller Moulvibazar',
      'Laptop price in Moulvibazar',
      'Used laptop in Moulvibazar',
      'HP laptop in Moulvibazar',
      'Dell laptop in Moulvibazar',
      'Lenovo laptop in Moulvibazar',
      'Business laptop Moulvibazar',
      'Student laptop Moulvibazar',
      'Laptop EMI in Moulvibazar',
      'মৌলভীবাজার ল্যাপটপ',
    ],
  });
}

export default async function LaptopsPage() {
  // Fetch real laptops from Prisma
  let laptops: any[] = [];
  try {
    laptops = await prisma.product.findMany({
      where: {
        OR: [
          { category: { contains: 'laptop', mode: 'insensitive' } },
          { name: { contains: 'laptop', mode: 'insensitive' } },
          { name: { contains: 'hp', mode: 'insensitive' } },
          { name: { contains: 'dell', mode: 'insensitive' } },
          { name: { contains: 'lenovo', mode: 'insensitive' } },
          { name: { contains: 'macbook', mode: 'insensitive' } },
          { name: { contains: 'elitebook', mode: 'insensitive' } },
          { name: { contains: 'thinkpad', mode: 'insensitive' } },
          { name: { contains: 'latitude', mode: 'insensitive' } },
        ],
        status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
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
      orderBy: [
        { currentStock: 'desc' },
        { retailPrice: 'asc' },
      ],
    });
  } catch (err) {
    console.error('Laptops query error:', err);
  }

  const breadcrumbs = [{ name: 'Laptops', path: '/laptops' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero Section */}
      <section className="relative py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Laptop size={14} />
            <span>Moulvibazar's Premier Laptop Destination</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Laptops in Moulvibazar — HP, Dell & Lenovo with Warranty & EMI
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Welcome to {BUSINESS_INFO.name}. Whether you need an ultra-durable business laptop for office work, a high-performance machine for software programming and freelancing, or a budget-friendly student laptop in Moulvibazar, our Kusumbag showroom features tested, genuine devices backed by replacement warranties and monthly installment financing.
          </p>

          {/* Brand Quick Links */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <Link
              href="/laptops/hp"
              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-cyan-400 dark:border-slate-700/80 transition-all"
            >
              HP Laptops (EliteBook, ProBook) →
            </Link>
            <Link
              href="/laptops/dell"
              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-cyan-400 dark:border-slate-700/80 transition-all"
            >
              Dell Laptops (Latitude, Inspiron) →
            </Link>
            <Link
              href="/laptops/lenovo"
              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-cyan-400 dark:border-slate-700/80 transition-all"
            >
              Lenovo Laptops (ThinkPad, IdeaPad) →
            </Link>
            <Link
              href="/laptop-emi"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              💳 Check Laptop EMI Plans (3-12 Months) →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <div className="bg-white dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <ShieldCheck size={18} className="text-blue-600 dark:text-cyan-400 shrink-0" />
            <span>7-Day Replacement Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>24-Point Diagnostic Certified</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CreditCard size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Easy EMI with Local Guarantor</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Phone size={18} className="text-amber-500 dark:text-amber-400 shrink-0" />
            <span>Showroom: Kusumbag, Moulvibazar</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Available Laptops in Moulvibazar Stock
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time inventory from NEED ELECTRO database. Verified pricing and stock availability.
            </p>
          </div>
          <span className="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
            {laptops.length} Laptops Available
          </span>
        </div>

        {laptops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {laptops.map(item => (
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
        ) : (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <Laptop size={48} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Checking Live Inventory...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Our laptops are updated continuously. Call our Moulvibazar showroom at {BUSINESS_INFO.phone} or chat on WhatsApp to inquire about upcoming HP, Dell, and Lenovo shipments.
            </p>
          </div>
        )}
      </section>

      {/* Natural SEO Knowledge & FAQ Section */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Why Buy Your Laptop from NEED ELECTRO Moulvibazar?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Purchasing a laptop is an investment in your career, education, or enterprise. Unlike unverified online sellers, {BUSINESS_INFO.name} operates a physical walk-in showroom at MR Plaza, Kusumbag in Moulvibazar town. Every single pre-owned and new laptop undergoes rigorous 24-point hardware stress testing before being offered for sale.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-600 dark:text-cyan-400 block text-sm">🔋 Guaranteed Battery Backup</span>
                <span>All pre-owned laptops come with guaranteed 80%+ battery health and genuine manufacturer chargers.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-600 dark:text-cyan-400 block text-sm">🛡️ Hassle-Free Local Warranty</span>
                <span>Get 7-day instant replacement and up to 2 years of local service warranty right here in Moulvibazar.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-600 dark:text-cyan-400 block text-sm">💳 Transparent Laptop EMI</span>
                <span>Take home your laptop with an affordable down payment and easy monthly installments (3, 6, 9, or 12 months).</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-600 dark:text-cyan-400 block text-sm">🚚 Direct Delivery Across Sylhet</span>
                <span>Same-day hand delivery in Moulvibazar town, Sreemangal, and Kulaura, plus courier shipping nationwide.</span>
              </div>
            </div>
          </div>

          {/* Bilingual Section */}
          <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-3">
            <h3 className="text-lg font-bold text-blue-900 dark:text-cyan-300">
              মৌলভীবাজারে আসল ল্যাপটপের দোকান — নিড ইলেক্ট্রো
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              আপনি কি মৌলভীবাজারে সুলভ মূল্যে ভালো মানের ফ্রেশ কন্ডিশন ল্যাপটপ খুঁজছেন? নিড ইলেক্ট্রো (কুসুমবাগ, মৌলভীবাজার) নিয়ে এলো এইচপি (HP), ডেল (Dell) এবং লেনোভো (Lenovo) ব্যান্ডের অরিজিনাল ল্যাপটপের বিশাল সমাহার। ছাত্র-ছাত্রী, ফ্রিল্যান্সার এবং অফিস ব্যবহারের উপযোগী প্রতিটি ল্যাপটপে পাবেন ৭ দিনের রিপ্লেসমেন্ট এবং ২ বছরের ফ্রি সার্ভিস ওয়ারেন্টি। এছাড়াও সহজ কিস্তি সুবিধা (Laptop EMI) রয়েছে।
            </p>
            <div className="pt-2 flex items-center gap-4">
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                <Phone size={13} />
                <span>সরাসরি কল করুন: {BUSINESS_INFO.phone}</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=আমি%20মৌলভীবাজার%20থেকে%20ল্যাপটপ%20কিনতে%20আগ্রহী।`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <MessageCircle size={14} />
                <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
