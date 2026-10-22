import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema, buildItemListSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Monitor, Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Computer Shop in Moulvibazar | Desktop Computer Price in Bangladesh | NEED ELECTRO',
    description: 'Looking for a reliable computer shop in Moulvibazar? NEED ELECTRO builds custom desktop PCs, gaming rigs, office workstations, and supplies monitors, processors, and parts with genuine warranty. Best desktop computer prices in Bangladesh.',
    path: '/computers',
    keywords: [
      'Computer shop in Moulvibazar',
      'Computer price in Moulvibazar',
      'Desktop computer price in Bangladesh',
      'Desktop computer Moulvibazar',
      'PC parts Moulvibazar',
      'Office computer Moulvibazar',
      'Gaming PC Moulvibazar',
      'Computer accessories in Bangladesh',
      'Desktop PC price Bangladesh',
      'মৌলভীবাজার কম্পিউটার দোকান',
      'কম্পিউটার দাম বাংলাদেশ',
    ],
  });
}

export default async function ComputersPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { category: { contains: 'computer', mode: 'insensitive' } },
          { category: { contains: 'desktop', mode: 'insensitive' } },
          { category: { contains: 'monitor', mode: 'insensitive' } },
          { name: { contains: 'desktop', mode: 'insensitive' } },
          { name: { contains: 'monitor', mode: 'insensitive' } },
          { name: { contains: 'pc', mode: 'insensitive' } },
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
    console.error('Computers query error:', err);
  }

  const breadcrumbs = [{ name: 'Computers', path: '/computers' }];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  const computersItemListSchema = buildItemListSchema({
    name: 'Desktop Computers & Workstations in Moulvibazar — NEED ELECTRO Store',
    description: 'Custom desktop PCs, office workstations, monitors and computer parts available at NEED ELECTRO Moulvibazar.',
    url: '/computers',
    items: products.map((item) => ({
      name: item.name,
      url: `/product/${item.name ? item.name.toLowerCase().replace(/[\s\W-]+/g, '-') : 'computer'}-${item.sku.toLowerCase()}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(computersItemListSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 3xl:px-12 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Monitor size={14} />
            <span>Moulvibazar Computer Solutions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Computer Shop in Moulvibazar — Desktop PCs, Workstations & Parts
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed">
            NEED ELECTRO is your dependable desktop computer destination in Moulvibazar. Whether setting up high-performance office workstations, custom desktop builds for video editing and programming, or upgrading processors, motherboards, and monitors, we provide 100% genuine hardware backed by official distributor warranties.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 3xl:px-12 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Computers & Display Hardware in Stock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visit our Kusumbag showroom for custom PC build consultations</p>
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
            <Monitor size={48} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Custom Desktop Builds Available on Request</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We assemble customized Intel and AMD Ryzen desktop setups tailored to your budget. Contact {BUSINESS_INFO.phone} for quotes.
            </p>
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}
