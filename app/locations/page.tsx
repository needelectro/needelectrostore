import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  getAllDivisions,
  getAllDistricts,
} from '@/lib/bangladeshLocations';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import {
  MapPin,
  Truck,
  ShieldCheck,
  CreditCard,
  Headphones,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Laptop,
  Camera,
  Zap,
} from 'lucide-react';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Bangladesh 64 Districts Delivery & Locations | NEED ELECTRO',
    description:
      'Explore NEED ELECTRO nationwide product delivery across all 8 divisions and 64 districts in Bangladesh. Check delivery times, shipping rates and warranty.',
    path: '/locations',
    keywords: [
      'NEED ELECTRO locations',
      'Laptop delivery Bangladesh',
      'CCTV camera Bangladesh',
      'Online electronics store Bangladesh',
      'Computer shop Dhaka',
      'Computer shop Sylhet',
      'Computer shop Moulvibazar',
      'Bangladesh 64 districts delivery',
      'Cash on delivery tech products BD',
    ],
  });
}

export default async function LocationsHubPage() {
  const divisions = getAllDivisions();
  const allDistricts = getAllDistricts();

  // Query top featured products from database
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
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
      take: 8,
      orderBy: [{ currentStock: 'desc' }, { updatedAt: 'desc' }],
    });
  } catch (err) {
    console.error('Locations page product query error:', err);
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Bangladesh Locations & Delivery', path: '/locations' },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  // Structured Data Schema for Directory
  const directorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'NEED ELECTRO Bangladesh Nationwide Locations & Delivery Hub',
    description:
      'Official coverage directory covering all 8 administrative divisions and 64 districts of Bangladesh for authentic laptops, CCTV cameras, computers, and electrical components.',
    url: `${BUSINESS_INFO.domain}/locations`,
    provider: {
      '@type': 'OnlineStore',
      name: BUSINESS_INFO.name,
      url: BUSINESS_INFO.domain,
      telephone: BUSINESS_INFO.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Moulvibazar',
        addressRegion: 'Sylhet',
        addressCountry: 'BD',
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(directorySchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero Section */}
      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/30">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Truck size={14} />
            <span>Nationwide Coverage — 8 Divisions • 64 Districts</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Nationwide Product Delivery &amp; Regional Service Coverage
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            {BUSINESS_INFO.name} operates from its central base in Moulvibazar, delivering authentic enterprise laptops, desktop computers, CCTV surveillance equipment, and electrical components to every union, upazila, and district across Bangladesh.
          </p>

          {/* Delivery & Trust Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <Truck size={20} className="text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">48–72h Delivery</p>
                <p className="text-[11px] text-slate-500">Fast doorstep courier</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <CreditCard size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Cash on Delivery</p>
                <p className="text-[11px] text-slate-500">Inspect before paying</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Official Warranty</p>
                <p className="text-[11px] text-slate-500">Replacement &amp; service</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <Headphones size={20} className="text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Live Tech Support</p>
                <p className="text-[11px] text-slate-500">Nationwide remote help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Policy Breakdown */}
      <section className="py-8 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
              <Truck size={16} />
              <span>Sylhet Division Express Zone (৳60 Delivery)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Covering <strong>Moulvibazar, Sylhet, Habiganj, and Sunamganj</strong>. Orders placed before 2:00 PM are dispatched for 24-hour delivery. In Moulvibazar, same-day delivery or direct pickup from our operations base is available.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <Truck size={16} />
              <span>Nationwide 7 Divisions Zone (৳120 Delivery)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Covering all remaining <strong>60 districts</strong> across Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Rangpur, and Mymensingh. Delivered in 48 to 72 hours via Steadfast, RedX, and Sundarban with open-box verification.
            </p>
          </div>
        </div>
      </section>

      {/* All 8 Divisions & 64 Districts Directory */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore All 8 Divisions &amp; 64 Districts
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Select your district to review verified delivery timelines, shipping rates, and available technology solutions.
          </p>
        </div>

        <div className="space-y-10">
          {divisions.map((division) => {
            const districtsInDivision = allDistricts.filter(
              (d) => d.divisionId === division.id
            );

            return (
              <div
                key={division.id}
                className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4"
              >
                {/* Division Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {division.nameEn}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {division.nameBn}
                    </span>
                  </div>
                  <Link
                    href={`/locations/${division.slug}`}
                    className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Division Hub</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* District Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {districtsInDivision.map((district) => (
                    <Link
                      key={district.id}
                      href={`/locations/${district.slug}`}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:border-blue-500/50 transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {district.nameEn}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {district.nameBn}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {district.deliveryTimeHours}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>৳{district.deliveryChargeBdt} Shipping</span>
                        <span className="text-blue-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                          Details →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products Ready for Nationwide Shipping */}
      {featuredProducts.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Featured Products Ready for Fast Nationwide Dispatch
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laptops, CCTV cameras, and electrical equipment shipped securely across all 64 districts.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Explore Entire Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((item) => (
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
        </section>
      )}

      {/* Nationwide FAQ Section */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Nationwide Delivery &amp; Service FAQs
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers regarding ordering, shipping, and warranty across Bangladesh.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                How does NEED ELECTRO deliver products outside Moulvibazar?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We partner with reputable nationwide couriers including Steadfast Courier, RedX, and Sundarban. High-value laptops and CCTV setups are carefully packaged with shock-resistant cushioning. Open-box inspection is permitted before final payment.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                What are the delivery charges for different districts in Bangladesh?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Delivery within Sylhet Division (Moulvibazar, Sylhet, Habiganj, Sunamganj) is ৳60. For all other 60 districts across Bangladesh, standard home courier delivery is ৳120.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                How is warranty claimed if I live in Dhaka, Chattogram, or other districts?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                All devices include our authentic invoice and warranty card. If a hardware issue occurs during the warranty window, you can dispatch the device via courier to our Moulvibazar technical lab. Our technicians resolve the issue and ship it back to your doorstep.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Are on-site technician services available in all 64 districts?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Direct on-site electrician and CCTV installation services are primarily available in Moulvibazar and Sylhet Division. For other districts, we provide nationwide remote IT support, custom software development, and scheduled on-site commercial projects upon corporate consultation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}
