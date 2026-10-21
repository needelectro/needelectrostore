import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Camera, ShieldCheck, CheckCircle2, Phone, Video, Eye, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'CCTV Camera Shop in Moulvibazar | CCTV Camera Price in Bangladesh | NEED ELECTRO',
    description: 'Looking for CCTV cameras in Moulvibazar? NEED ELECTRO provides HD & IP CCTV cameras, DVR/NVR surveillance setups, night vision, mobile remote viewing, and certified CCTV installation service across Moulvibazar, Sylhet & nationwide Bangladesh.',
    path: '/cctv',
    keywords: [
      'CCTV camera shop in Moulvibazar',
      'CCTV camera price in Bangladesh',
      'CCTV installation service',
      'CCTV camera in Moulvibazar',
      'CCTV shop in Moulvibazar',
      'CCTV installation in Moulvibazar',
      'Security camera price in Bangladesh',
      'Hikvision CCTV camera Bangladesh',
      'Dahua CCTV camera Bangladesh',
      'IP camera Moulvibazar',
      'মৌলভীবাজার সিসিটিভি ক্যামেরা',
      'সিসিটিভি ক্যামেরা দাম বাংলাদেশ',
    ],
  });
}

export default async function CctvPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { category: { contains: 'cctv', mode: 'insensitive' } },
          { category: { contains: 'security', mode: 'insensitive' } },
          { name: { contains: 'camera', mode: 'insensitive' } },
          { name: { contains: 'cctv', mode: 'insensitive' } },
          { name: { contains: 'ezviz', mode: 'insensitive' } },
          { name: { contains: 'dvr', mode: 'insensitive' } },
          { name: { contains: 'nvr', mode: 'insensitive' } },
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
    console.error('CCTV query error:', err);
  }

  const breadcrumbs = [{ name: 'CCTV & Security', path: '/cctv' }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Camera size={14} />
            <span>24/7 Surveillance & Security Solutions</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            CCTV Camera in Moulvibazar — Cameras, DVR/NVR & Professional Installation
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Secure your residence, retail showroom, warehouse, or institution with high-definition CCTV security from {BUSINESS_INFO.name}. We supply crystal-clear IP and HD analog cameras, weatherproof night vision models, surveillance storage, and complete turnkey technician installation with smartphone live remote viewing.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/services/cctv-installation"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <Video size={14} />
              <span>Book CCTV Installation Service →</span>
            </Link>
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Phone size={13} className="text-blue-600 dark:text-cyan-400" />
              <span>CCTV Consultation: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">CCTV Cameras & Security Hardware in Stock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Authentic EZVIZ, Hikvision, and Dahua cameras with replacement warranty</p>
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
            <Camera size={48} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">CCTV Packages Available</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We supply customized 2-camera, 4-camera, 8-camera, and 16-camera CCTV packages with DVR/NVR, hard disk, and cabling across Moulvibazar. Contact us for site survey.
            </p>
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}
