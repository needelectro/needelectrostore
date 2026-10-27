import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema, buildItemListSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Laptop, ShieldCheck, CreditCard, CheckCircle2, Phone, MessageCircle, ArrowRight } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Laptop Shop in Moulvibazar | Price in BD | NEED ELECTRO',
    description:
      'Best laptop shop in Moulvibazar. Check latest laptop price in Bangladesh for HP, Dell & Lenovo. 7-day replacement, 2-year warranty & 0% EMI available.',
    path: '/laptops',
    keywords: [
      'Laptop shop in Moulvibazar',
      'Laptop shop Moulvibazar',
      'Laptop price in Bangladesh',
      'Laptop price in Moulvibazar',
      'Laptop price Moulvibazar',
      'Best laptop shop in Moulvibazar',
      'Where to buy laptop in Moulvibazar',
      'Laptop shop in Moulvibazar Bangladesh',
      'HP EliteBook price in Bangladesh',
      'Dell Latitude price in Bangladesh',
      'Lenovo ThinkPad price in Bangladesh',
      'Used laptop in Moulvibazar',
      'Computer shop in Moulvibazar',
      'Business laptop Moulvibazar',
      'Student laptop Moulvibazar',
      'Laptop EMI in Moulvibazar',
      'মৌলভীবাজার ল্যাপটপ শপ',
      'মৌলভীবাজার ল্যাপটপ দোকান',
      'ল্যাপটপের দাম বাংলাদেশ',
      'ল্যাপটপ কিস্তিতে মৌলভীবাজার',
    ],
  });
}

export default async function LaptopsPage() {
  // Fetch real laptops from Prisma
  let laptops: any[] = [];
  try {
    laptops = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { category: { contains: 'laptop', mode: 'insensitive' } },
              { category: { contains: 'notebook', mode: 'insensitive' } },
              { category: { contains: 'macbook', mode: 'insensitive' } },
              { category: { contains: 'chromebook', mode: 'insensitive' } },
              { name: { contains: 'laptop', mode: 'insensitive' } },
              { name: { contains: 'elitebook', mode: 'insensitive' } },
              { name: { contains: 'thinkpad', mode: 'insensitive' } },
              { name: { contains: 'latitude', mode: 'insensitive' } },
              { name: { contains: 'chromebook', mode: 'insensitive' } },
              { name: { contains: 'macbook', mode: 'insensitive' } },
              { name: { contains: 'probook', mode: 'insensitive' } },
            ],
          },
          {
            NOT: [
              { category: { contains: 'accessori', mode: 'insensitive' } },
              { category: { contains: 'accessory', mode: 'insensitive' } },
              { category: { contains: 'computer accessories', mode: 'insensitive' } },
              { category: { contains: 'charger', mode: 'insensitive' } },
              { category: { contains: 'cable', mode: 'insensitive' } },
              { category: { contains: 'mouse', mode: 'insensitive' } },
              { category: { contains: 'keyboard', mode: 'insensitive' } },
              { category: { contains: 'cctv', mode: 'insensitive' } },
              { category: { contains: 'networking', mode: 'insensitive' } },
              { category: { contains: 'router', mode: 'insensitive' } },
              { category: { contains: 'electrical', mode: 'insensitive' } },
              { category: { contains: 'desktop', mode: 'insensitive' } },
              { category: { contains: 'computer', mode: 'insensitive' } },
              { name: { contains: 'mouse', mode: 'insensitive' } },
              { name: { contains: 'keyboard', mode: 'insensitive' } },
              { name: { contains: 'headset', mode: 'insensitive' } },
              { name: { contains: 'headphone', mode: 'insensitive' } },
              { name: { contains: 'charger', mode: 'insensitive' } },
              { name: { contains: 'adapter', mode: 'insensitive' } },
              { name: { contains: 'power bank', mode: 'insensitive' } },
              { name: { contains: 'pc setup', mode: 'insensitive' } },
              { sku: { startsWith: 'SKU-ACC-' } },
            ],
          },
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
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  const laptopsItemListSchema = buildItemListSchema({
    name: 'Available Laptops in Moulvibazar Stock — NEED ELECTRO Store',
    description: 'Authentic business, student and professional laptops from HP, Dell, Lenovo with warranty and EMI in Bangladesh.',
    url: '/laptops',
    items: laptops.map((item) => ({
      name: item.name,
      url: `/product/${item.name ? item.name.toLowerCase().replace(/[\s\W-]+/g, '-') : 'laptop'}-${item.sku.toLowerCase()}`,
      image: item.imageUrl,
      price: Number(item.retailPrice),
      brand: item.brand,
      category: item.category,
    })),
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(laptopsItemListSchema) }}
      />
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
            Laptop Shop in Moulvibazar — Latest Laptop Price in Bangladesh
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Welcome to {BUSINESS_INFO.name}. Whether you need an ultra-durable business laptop for office work, a high-performance machine for software programming and freelancing, or a budget-friendly student laptop in Moulvibazar, our central tech hub features tested, genuine devices backed by replacement warranties, fast local delivery, and monthly installment financing.
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
      <section className="py-8 sm:py-12 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full flex-1">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
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
              Purchasing a laptop is an investment in your career, education, or enterprise. Unlike unverified online sellers, {BUSINESS_INFO.name} operates its central tech hub and online marketplace from Moulvibazar, Bangladesh. Every single pre-owned and new laptop undergoes rigorous 24-point hardware stress testing before being offered for sale.
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

          {/* Showroom & Purchase Consultation Section */}
          <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-3">
            <h3 className="text-lg font-bold text-blue-900 dark:text-cyan-300">
              Authentic Laptop Store in Moulvibazar — NEED ELECTRO
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Looking for premium quality, authentic laptops in pristine condition at affordable prices in Moulvibazar? NEED ELECTRO (Moulvibazar, Bangladesh) brings you a comprehensive collection of original laptops from trusted global brands including HP, Dell, and Lenovo. Ideal for students, freelancers, and enterprise professionals, every laptop includes a 7-day replacement guarantee and 2 years of free service warranty. Flexible 0% Laptop EMI installment facilities are also available.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                <Phone size={13} />
                <span>Call Helpline: {BUSINESS_INFO.phone}</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello,%20I%20am%20interested%20in%20purchasing%20a%20laptop%20from%20NEED%20ELECTRO%20Moulvibazar.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <MessageCircle size={14} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
