import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  generateSeoMetadata,
  buildItemListSchema,
  getProductUrlPath,
  resolveCleanImageUrl,
} from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import {
  Laptop, Monitor, Camera, Zap, Wifi, Smartphone,
  Layers, ShieldCheck, Truck, CreditCard, ChevronRight, Sparkles
} from 'lucide-react';

export const revalidate = 60;

interface ShopPageProps {
  searchParams?: { q?: string };
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const query = typeof searchParams?.q === 'string' ? searchParams.q.trim() : '';

  return generateSeoMetadata({
    title: query
      ? `Search: ${query} — Computer & Laptop Shop | NEED ELECTRO`
      : 'Computer & Laptop Shop in Moulvibazar & BD | NEED ELECTRO Store',
    description:
      'Shop laptops, desktop PCs, monitors & computer accessories at NEED ELECTRO in Moulvibazar & across Bangladesh. Genuine products, official warranty & EMI.',
    path: '/shop',
    noIndex: Boolean(query),
    keywords: [
      'Computer shop in Moulvibazar',
      'Laptop shop in Moulvibazar',
      'Laptop price in Bangladesh',
      'Desktop computer price in Bangladesh',
      'HP EliteBook price in Bangladesh',
      'Computer accessories in Bangladesh',
      'CCTV camera price in Bangladesh',
      'Online shop Bangladesh',
    ],
  });
}

const CATEGORY_LINKS = [
  { name: 'Laptops & Notebooks', href: '/laptops', icon: Laptop, count: 'HP, Dell, Lenovo', color: 'from-blue-600 to-sky-500' },
  { name: 'Desktops & Displays', href: '/computers', icon: Monitor, count: 'Custom & Branded PCs', color: 'from-indigo-600 to-blue-500' },
  { name: 'CCTV & Security', href: '/cctv', icon: Camera, count: 'Hikvision & Dahua', color: 'from-cyan-600 to-teal-500' },
  { name: 'Electrical & Switchgear', href: '/electrical-products', icon: Zap, count: 'Breakers, DB, Wiring', color: 'from-amber-500 to-orange-500' },
  { name: 'Computer Accessories', href: '/computer-accessories', icon: Smartphone, count: 'RAM, SSD, Hubs', color: 'from-emerald-600 to-teal-500' },
  { name: 'Networking & Routers', href: '/networking', icon: Wifi, count: 'Wi-Fi 6, Switches', color: 'from-violet-600 to-purple-500' },
  { name: 'Smart Gadgets', href: '/smart-devices', icon: Sparkles, count: 'Smart Plugs & Audio', color: 'from-rose-500 to-pink-500' },
];

import { ShopCatalogClient } from '@/src/components/customer/ShopCatalogClient';
import type { ProductCardData } from '@/src/components/customer/ProductCard';

export default async function ShopMasterPage({ searchParams }: ShopPageProps) {
  const rawQuery = typeof searchParams?.q === 'string' ? searchParams.q.trim() : '';
  let products: any[] = [];
  try {
    // Fetch active & published products (optionally filtered by ?q= search query)
    products = await prisma.product.findMany({
      where: {
        status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
        isPublished: true,
        ...(rawQuery
          ? {
              OR: [
                { name: { contains: rawQuery, mode: 'insensitive' } },
                { brand: { contains: rawQuery, mode: 'insensitive' } },
                { model: { contains: rawQuery, mode: 'insensitive' } },
                { sku: { contains: rawQuery, mode: 'insensitive' } },
                { category: { contains: rawQuery, mode: 'insensitive' } },
                { description: { contains: rawQuery, mode: 'insensitive' } },
              ],
            }
          : {}),
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
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    });
  } catch (err) {
    console.error('Shop master query error:', err);
  }

  const mappedProducts: ProductCardData[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    brand: p.brand,
    model: p.model,
    description: p.description,
    imageUrl: p.imageUrl,
    retailPrice: Number(p.retailPrice),
    emiPrice: p.emiPrice ? Number(p.emiPrice) : undefined,
    currentStock: p.currentStock,
    warrantyPeriodMonths: p.warrantyPeriodMonths || undefined,
    specs: p.specs,
  }));

  const breadcrumbs = [{ name: 'Shop All Products', path: '/shop' }];

  const catalogItemListSchema = buildItemListSchema({
    name: rawQuery
      ? `Search Results for "${rawQuery}" — NEED ELECTRO Store`
      : 'All Products Catalog — NEED ELECTRO Store',
    description:
      'Complete catalog of laptops, desktop computers, monitors, CCTV security systems, and computer accessories at NEED ELECTRO in Moulvibazar & across Bangladesh.',
    url: '/shop',
    items: mappedProducts.map((p) => ({
      name: p.name,
      url: getProductUrlPath(p.name, p.sku),
      image: resolveCleanImageUrl(p.imageUrl),
      price: p.retailPrice,
      brand: p.brand,
      category: p.category,
    })),
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogItemListSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero Section — Clean & Mobile-Optimized */}
      <section className="py-6 sm:py-10 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-white via-[#F4F6F8] to-[#EAF4FF] border-b border-slate-200/80">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#EAF4FF] border border-[#008CFF]/20 text-[#008CFF]">
            <Layers size={13} />
            <span>Official NEED ELECTRO Storefront — {mappedProducts.length} Products Available</span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#002B5B] tracking-tight leading-tight">
            {rawQuery ? `Search Results for "${rawQuery}"` : 'Online Computer & Laptop Shop in Moulvibazar & BD'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Explore our live catalog of laptops, desktop PCs, monitors, CCTV cameras, and computer accessories. 100% genuine products with official warranty from our Moulvibazar showroom and doorstep COD across Bangladesh.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] sm:text-xs text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
              <Truck size={13} className="text-[#008CFF]" />
              <span>Doorstep COD (All 64 Districts)</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Tested Genuine Hardware</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CreditCard size={13} className="text-amber-500" />
              <span>Flexible EMI Available</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog with Interactive Client Filtering */}
      <main className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 pb-16 flex-1">
        <ShopCatalogClient initialProducts={mappedProducts} searchQuery={rawQuery} />
      </main>

      <CustomerFooter />
    </div>
  );
}
