import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Smartphone, Zap, ShieldCheck } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Smart Devices & Modern Gadgets in Moulvibazar | NEED ELECTRO',
    description: 'Explore smart devices, smart plugs, USB converter hubs, and smart home automation gadgets at NEED ELECTRO Moulvibazar. Verified quality and warranty support.',
    path: '/smart-devices',
    keywords: [
      'Smart devices in Moulvibazar',
      'Smart home Moulvibazar',
      'Gadgets shop Moulvibazar',
      'USB converter Moulvibazar',
      'মৌলভীবাজার স্মার্ট গ্যাজেট',
    ],
  });
}

export default async function SmartDevicesPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { category: { contains: 'smart', mode: 'insensitive' } },
          { category: { contains: 'gadget', mode: 'insensitive' } },
          { name: { contains: 'smart', mode: 'insensitive' } },
          { name: { contains: 'converter', mode: 'insensitive' } },
          { name: { contains: 'adapter', mode: 'insensitive' } },
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
    console.error('Smart devices query error:', err);
  }

  const breadcrumbs = [{ name: 'Smart Devices', path: '/smart-devices' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Smartphone size={14} />
            <span>Smart Automation & Gadgets</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Smart Devices & Modern Gadgets in Moulvibazar
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Upgrade your daily tech lifestyle with smart devices and intelligent home electronics from {BUSINESS_INFO.name}. From multi-port USB Type-C hubs and smart power monitoring plugs to high-definition converters, explore curated gadgets in Moulvibazar.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Devices & Adapters in Stock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Smart electronics with manufacturer warranty</p>
          </div>
          <span className="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
            {products.length} Products Found
          </span>
        </div>

        {products.length > 0 ? (
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
        ) : (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <Smartphone size={48} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Smart Gadgets Ready for Showroom Pickup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Visit our Kusumbag showroom in Moulvibazar to test and experience the latest electronics.
            </p>
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}
