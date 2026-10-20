import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Computer Accessories in Moulvibazar | Keyboards, Mice, SSDs & RAM | NEED ELECTRO',
    description: 'Shop authentic computer accessories in Moulvibazar at NEED ELECTRO. High-speed NVMe M.2 SSDs, laptop & desktop RAM, wireless mice, mechanical keyboards, headphones, and converters with warranty.',
    path: '/computer-accessories',
    keywords: [
      'Computer accessories in Moulvibazar',
      'SSD price Moulvibazar',
      'RAM upgrade Moulvibazar',
      'Laptop charger Moulvibazar',
      'Keyboard and mouse Moulvibazar',
      'মৌলভীবাজার কম্পিউটার এক্সেসরিজ',
    ],
  });
}

export default async function ComputerAccessoriesPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { category: { contains: 'accessories', mode: 'insensitive' } },
          { category: { contains: 'accessory', mode: 'insensitive' } },
          { name: { contains: 'mouse', mode: 'insensitive' } },
          { name: { contains: 'keyboard', mode: 'insensitive' } },
          { name: { contains: 'headphone', mode: 'insensitive' } },
          { name: { contains: 'ssd', mode: 'insensitive' } },
          { name: { contains: 'ram', mode: 'insensitive' } },
          { name: { contains: 'adata', mode: 'insensitive' } },
          { name: { contains: 'logitech', mode: 'insensitive' } },
          { name: { contains: 'havit', mode: 'insensitive' } },
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
    console.error('Accessories query error:', err);
  }

  const breadcrumbs = [{ name: 'Computer Accessories', path: '/computer-accessories' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Cpu size={14} />
            <span>High-Speed Upgrades & Peripherals</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Computer Accessories in Moulvibazar — SSDs, RAM, Keyboards & Mice
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Boost your laptop or desktop performance with authentic computer accessories from {BUSINESS_INFO.name}. We stock high-speed NVMe and SATA SSDs, DDR4/DDR5 RAM upgrades, precision wireless Logitech mice, ergonomic keyboards, high-fidelity headsets, and display converters with replacement guarantees.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Accessories & Upgrade Components in Stock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visit our Kusumbag showroom for free laptop RAM & SSD installation</p>
          </div>
          <span className="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
            {products.length} Products Found
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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
            <Cpu size={48} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Full Accessory Stock Ready</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Call {BUSINESS_INFO.phone} to inquire about specific RAM speeds, SSD capacities, and brand availability.
            </p>
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}
