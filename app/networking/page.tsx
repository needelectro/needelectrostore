import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema, buildItemListSchema, slugify } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Wifi, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Networking Products & Routers | NEED ELECTRO',
    description:
      'Shop Wi-Fi routers, Gigabit switches, ONU fiber modems, and networking gear at NEED ELECTRO Bangladesh. Reliable connectivity equipment.',
    path: '/networking',
    keywords: [
      'Networking and Wi-Fi installation',
      'Networking products in Moulvibazar',
      'Router & Networking price in Moulvibazar',
      'WiFi router price in Bangladesh',
      'WiFi router in Moulvibazar',
      'Router price Moulvibazar',
      'Tenda router Moulvibazar',
      'Gigabit switch Moulvibazar',
      'WGP mini UPS price in Bangladesh',
      'Marsiva mini UPS Moulvibazar',
      'রাউটার দাম বাংলাদেশ',
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
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
  const networkingItemListSchema = buildItemListSchema({
    name: 'Networking Products & Wi-Fi Routers in Bangladesh',
    description: 'High-speed dual-band routers, Gigabit switches, ONU modems, and network accessories at NEED ELECTRO Store.',
    path: '/networking',
    items: products.slice(0, 30).map(p => ({
      name: p.name,
      url: `/product/${slugify(p.name)}-${p.sku.toLowerCase()}`,
      image: p.imageUrl || undefined,
      price: Number(p.retailPrice) || undefined,
    })),
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {networkingItemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(networkingItemListSchema) }}
        />
      )}
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 3xl:px-12 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Wifi size={14} />
            <span>High-Speed Connectivity Solutions</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Networking Products in Moulvibazar — Wi-Fi Routers, Switches & Fiber Optics
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed">
            Eliminate Wi-Fi dead zones and buffer-free streaming with high-performance networking products from {BUSINESS_INFO.name}. We supply dual-band and Wi-Fi 6 wireless routers, high-capacity Gigabit PoE switches for CCTV, ONU fiber modems, and durable router mini UPS backup units in Moulvibazar.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 3xl:px-12 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Networking Devices & UPS in Stock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-speed dual-band routers, switches, and network accessories</p>
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
            <Wifi size={48} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Routers & Mini UPS Ready for Dispatch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Call {BUSINESS_INFO.phone} for immediate router setup or office network installation in Moulvibazar.
            </p>
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}
