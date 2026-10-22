import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import {
  Laptop, Monitor, Camera, Zap, Wifi, Smartphone,
  Layers, ShieldCheck, Truck, CreditCard, ChevronRight, Sparkles
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Online Shop Bangladesh — Laptops, Computers, CCTV & Electricals | NEED ELECTRO',
    description:
      'Browse authentic laptops (HP, Dell, Lenovo), custom desktop PCs, CCTV surveillance systems, electrical switchgear, computer accessories, and gadgets. Cash on delivery across all 64 districts with verified warranty.',
    path: '/shop',
    keywords: [
      'Online shop Bangladesh',
      'Laptop price in Bangladesh',
      'Computer shop in Moulvibazar',
      'Computer price in Moulvibazar',
      'Laptop shop in Moulvibazar',
      'Laptop price in Moulvibazar',
      'CCTV camera price in Bangladesh',
      'Tech gadgets price in Bangladesh',
      'HP EliteBook price in Bangladesh',
      'Desktop computer price in Bangladesh',
      'Computer accessories in Bangladesh',
      'Electrical products online Bangladesh',
      'Genuine laptop with warranty in Bangladesh',
      'Laptop EMI in Bangladesh',
      'অনলাইন শপ বাংলাদেশ',
      'ল্যাপটপের দাম বাংলাদেশ',
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

export default async function ShopMasterPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
        isPublished: true,
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
      take: 40,
    });
  } catch (err) {
    console.error('Shop master query error:', err);
  }

  const breadcrumbs = [{ name: 'Shop All Products', path: '/shop' }];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-white via-[#F4F6F8] to-[#EAF4FF] border-b border-slate-200/80">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF4FF] border border-[#008CFF]/20 text-[#008CFF]">
            <Layers size={13} />
            <span>Official NEED ELECTRO E-Commerce Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#002B5B] tracking-tight leading-tight">
            Shop Authentic Laptops, Computers, CCTV &amp; Electricals
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Welcome to the complete NEED ELECTRO catalog. Order genuine hardware with official manufacturer warranty, 7-day replacement guarantee, and nationwide Cash on Delivery to all 64 districts in Bangladesh.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <Truck size={14} className="text-[#008CFF]" />
              <span>Doorstep COD: ৳60 (Sylhet Div) / ৳120 (Nationwide)</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>100% Tested Genuine Hardware</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <CreditCard size={14} className="text-amber-500" />
              <span>Flexible EMI Available</span>
            </span>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#002B5B]">
            Browse By Category
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore our dedicated department catalogs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {CATEGORY_LINKS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.name}
                href={c.href}
                className="group bg-white border border-slate-200/90 hover:border-[#008CFF] rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${c.color} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-[#002B5B] group-hover:text-[#008CFF] transition-colors leading-tight">
                  {c.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-full block">
                  {c.count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 pb-12 flex-1 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#002B5B]">
              All Available Products ({products.length})
            </h2>
            <p className="text-xs text-slate-500">Live synchronized inventory from NEED ELECTRO database</p>
          </div>
          <Link
            href="/track-order"
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>Track Existing Order</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  sku: p.sku,
                  category: p.category,
                  brand: p.brand,
                  model: p.model,
                  description: p.description,
                  imageUrl: p.imageUrl,
                  retailPrice: Number(p.retailPrice),
                  regularPrice: p.regularPrice ? Number(p.regularPrice) : undefined,
                  emiPrice: p.emiPrice ? Number(p.emiPrice) : undefined,
                  currentStock: p.currentStock,
                  warrantyPeriodMonths: p.warrantyPeriodMonths || undefined,
                  specs: p.specs,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="font-bold text-[#002B5B]">Loading catalog items...</p>
            <p className="text-xs text-slate-500 mt-1">Please call {BUSINESS_INFO.phone} for immediate order placement.</p>
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}
