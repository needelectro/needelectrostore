import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Zap, ShieldCheck, CheckCircle2, Wrench, Phone } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Electrical Shop Online Bangladesh | Electrical Products in Moulvibazar | NEED ELECTRO',
    description: 'Buy genuine electrical products online in Bangladesh from NEED ELECTRO. Copper wiring cables, MCB circuit breakers, distribution boards, switches, and industrial electrical supplies. Nationwide delivery and certified electrical services in Moulvibazar.',
    path: '/electrical-products',
    keywords: [
      'Electrical shop online Bangladesh',
      'Electrical products online Bangladesh',
      'Electrical services in Moulvibazar',
      'Electrician service in Bangladesh',
      'Electrical products in Moulvibazar',
      'Electrical shop in Moulvibazar',
      'Circuit breaker Bangladesh',
      'Copper cable Moulvibazar',
      'Electrical accessories Moulvibazar',
      'মৌলভীবাজার ইলেকট্রিক্যাল পণ্য',
      'ইলেকট্রিক্যাল শপ বাংলাদেশ',
    ],
  });
}

export default async function ElectricalProductsPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { category: { contains: 'electrical', mode: 'insensitive' } },
          { name: { contains: 'breaker', mode: 'insensitive' } },
          { name: { contains: 'cable', mode: 'insensitive' } },
          { name: { contains: 'switch', mode: 'insensitive' } },
          { name: { contains: 'socket', mode: 'insensitive' } },
          { name: { contains: 'converter', mode: 'insensitive' } },
          { name: { contains: 'power', mode: 'insensitive' } },
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
      orderBy: [{ currentStock: 'desc' }, { retailPrice: 'asc' }],
    });
  } catch (err) {
    console.error('Electrical products query error:', err);
  }

  const breadcrumbs = [{ name: 'Electrical Products', path: '/electrical-products' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 3xl:px-12 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-amber-50/70 via-transparent to-transparent dark:from-amber-950/15">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-500/30 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Zap size={14} />
            <span>Certified Electrical Hardware</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Electrical Products in Moulvibazar — Cables, Breakers & Switchgear
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed">
            Reliable electrical installations start with certified, high-grade components. {BUSINESS_INFO.name} provides certified copper wiring, miniature circuit breakers (MCB), residual current devices (RCCB), main distribution boards, heavy-duty switches, and industrial electrical supplies in Moulvibazar.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/electrical-services"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 min-h-[42px] rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all inline-flex items-center gap-2"
            >
              <Wrench size={14} />
              <span>Electrical Services & Wiring →</span>
            </Link>
            <Link
              href="/services/electrician"
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-colors shadow-xs inline-flex items-center"
            >
              Book an Electrician in Moulvibazar →
            </Link>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 3xl:px-12 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Electrical Supplies & Safety Components</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Genuine certified electrical hardware meeting Bangladesh national safety standards</p>
          </div>
          <span className="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
            {products.length} Products Found
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
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
        ) : (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <Zap size={48} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Wholesale & Retail Electrical Supplies</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Looking for bulk cables, MCBs, or electrical contractor supplies in Moulvibazar? Call {BUSINESS_INFO.phone} for trade pricing and site deliveries.
            </p>
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}
