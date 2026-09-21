import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Wifi, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Networking Products in Moulvibazar | Wi-Fi Routers & Switches | NEED ELECTRO',
    description: 'Looking for Wi-Fi routers, Gigabit switches, ONU fiber optic devices, and patch cables in Moulvibazar? Shop authentic Tenda, TP-Link, and networking gear at NEED ELECTRO with official warranty.',
    path: '/networking',
    keywords: [
      'Networking products in Moulvibazar',
      'WiFi router in Moulvibazar',
      'Router price Moulvibazar',
      'Gigabit switch Moulvibazar',
      'Tenda router Moulvibazar',
      'মৌলভীবাজার রাউটার',
    ],
  });
}

export default async function NetworkingPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { category: { contains: 'networking', mode: 'insensitive' } },
          { name: { contains: 'router', mode: 'insensitive' } },
          { name: { contains: 'wifi', mode: 'insensitive' } },
          { name: { contains: 'tenda', mode: 'insensitive' } },
          { name: { contains: 'switch', mode: 'insensitive' } },
          { name: { contains: 'wgp', mode: 'insensitive' } },
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
    console.error('Networking query error:', err);
  }

  const breadcrumbs = [{ name: 'Networking Products', path: '/networking' }];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-300">
            <Wifi size={14} />
            <span>High-Speed Connectivity Solutions</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Networking Products in Moulvibazar — Wi-Fi Routers, Switches & Fiber Optics
          </h1>

          <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Eliminate Wi-Fi dead zones and buffer-free streaming with high-performance networking products from {BUSINESS_INFO.name}. We supply dual-band and Wi-Fi 6 wireless routers, high-capacity Gigabit PoE switches for CCTV, ONU fiber modems, and durable router mini UPS backup units in Moulvibazar.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Networking Devices & UPS in Stock</h2>
            <p className="text-xs text-slate-400 mt-1">High-speed dual-band routers, switches, and network accessories</p>
          </div>
          <span className="text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            {products.length} Products Found
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <Wifi size={48} className="mx-auto text-slate-600" />
            <h3 className="text-lg font-bold text-slate-200">Routers & Mini UPS Ready for Dispatch</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Call {BUSINESS_INFO.phone} for immediate router setup or office network installation in Moulvibazar.
            </p>
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}
