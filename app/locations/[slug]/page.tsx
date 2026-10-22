import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  BUSINESS_INFO,
  generateSeoMetadata,
  buildBreadcrumbSchema,
} from '@/lib/seoConfig';
import {
  getAllDivisions,
  getAllDistricts,
  getDivisionBySlug,
  getDistrictBySlug,
  getDistrictsByDivision,
  District,
  Division,
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
  ChevronRight,
  Laptop,
  Camera,
  Zap,
  Cpu,
  Phone,
  MessageCircle,
} from 'lucide-react';

interface Props {
  params: { slug: string };
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cleanSlug = params.slug.toLowerCase().trim();

  // 1. Check if it's a district
  const district = getDistrictBySlug(cleanSlug);
  if (district) {
    const canonicalPath =
      district.slug === 'moulvibazar'
        ? '/moulvibazar'
        : district.slug === 'sylhet'
        ? '/sylhet'
        : `/locations/${district.slug}`;

    return generateSeoMetadata({
      title: district.seoTitle,
      description: district.seoDescription,
      path: canonicalPath,
      keywords: [
        `Laptop in ${district.nameEn}`,
        `Computer shop in ${district.nameEn}`,
        `CCTV camera in ${district.nameEn}`,
        `Electrical products ${district.nameEn}`,
        `${district.nameBn} ল্যাপটপ`,
        `${district.nameBn} কম্পিউটার`,
        `${district.nameBn} সিসিটিভি`,
        'Cash on delivery laptop BD',
        'NEED ELECTRO Bangladesh',
      ],
    });
  }

  // 2. Check if it's a division
  const division = getDivisionBySlug(cleanSlug);
  if (division) {
    const title = `${division.nameEn} Tech & Laptops | NEED ELECTRO`.slice(0, 60);
    const description = `Buy authentic laptops, computers and CCTV cameras delivered across ${division.nameEn}. Fast courier delivery, cash on delivery and official warranty.`;

    return generateSeoMetadata({
      title,
      description,
      path: `/locations/${division.slug}`,
      keywords: [
        `Laptop ${division.nameEn}`,
        `Computer shop ${division.nameEn}`,
        `CCTV camera ${division.nameEn}`,
        `Electronics ${division.nameEn}`,
        `${division.nameBn} ল্যাপটপ`,
      ],
    });
  }

  return generateSeoMetadata({
    title: 'Locations in Bangladesh | NEED ELECTRO',
    description: 'Explore NEED ELECTRO product delivery and services across all 64 districts in Bangladesh.',
    path: `/locations/${params.slug}`,
  });
}

export default async function LocationDetailPage({ params }: Props) {
  const cleanSlug = params.slug.toLowerCase().trim();

  // If user requests moulvibazar or sylhet via /locations, redirect to their canonical hub
  if (cleanSlug === 'moulvibazar') {
    redirect('/moulvibazar');
  }
  if (cleanSlug === 'sylhet') {
    redirect('/sylhet');
  }

  const district = getDistrictBySlug(cleanSlug);
  const division = getDivisionBySlug(cleanSlug);

  if (!district && !division) {
    notFound();
  }

  // Fetch real featured products from the database
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
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
    console.error('Location page product fetch error:', err);
  }

  // Render District View
  if (district) {
    const parentDivision = getAllDivisions().find((d) => d.id === district.divisionId);

    const breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Locations', path: '/locations' },
      ...(parentDivision
        ? [{ name: parentDivision.nameEn, path: `/locations/${parentDivision.slug}` }]
        : []),
      { name: district.nameEn, path: `/locations/${district.slug}` },
    ];
    const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

    const isSylhetZone = district.divisionId === 'sylhet';

    const localFaqs = [
      {
        question: `How fast is laptop or CCTV delivery to ${district.nameEn}?`,
        answer: `Orders to ${district.nameEn} are delivered within ${district.deliveryTimeHours} via reliable couriers including Steadfast Courier and RedX. Packaging includes shock-proof padding for electronics safety.`,
      },
      {
        question: `What is the delivery charge for ${district.nameEn}?`,
        answer: `Standard doorstep courier delivery to ${district.nameEn} is ৳${district.deliveryChargeBdt}. Cash on delivery with open-box verification is supported.`,
      },
      {
        question: `How do I claim product warranty from ${district.nameEn}?`,
        answer: `Every product includes our official warranty card. In case of any hardware issue, you can send the item via courier to our Moulvibazar technical lab for repair or replacement under warranty.`,
      },
      {
        question: `Are on-site technician services available in ${district.nameEn}?`,
        answer: district.serviceAvailability.notesEn,
      },
    ];

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: localFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const locationSchema = {
      '@context': 'https://schema.org',
      '@type': 'OnlineStore',
      name: `${BUSINESS_INFO.name} — ${district.nameEn} Delivery`,
      url: `${BUSINESS_INFO.domain}/locations/${district.slug}`,
      description: district.seoDescription,
      telephone: BUSINESS_INFO.phone,
      areaServed: {
        '@type': 'AdministrativeArea',
        name: district.nameEn,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `Technology Products Delivered to ${district.nameEn}`,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
        />
        <CustomerHeader />
        <Breadcrumb items={breadcrumbs} />

        {/* Hero Section */}
        <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/30">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
              <MapPin size={14} />
              <span>
                {district.nameEn} ({district.nameBn}) • {parentDivision?.nameEn}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Tech Products &amp; Solutions in {district.nameEn}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
              Order authentic laptops, custom desktop computers, CCTV security cameras, and electrical components with guaranteed doorstep delivery to {district.nameEn}. Backed by verified replacement warranty and dedicated customer service from {BUSINESS_INFO.name}.
            </p>

            {/* District Status Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 text-xs font-bold mb-0.5">
                  <Truck size={14} />
                  <span>Delivery Time</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {district.deliveryTimeHours}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-0.5">
                  <CreditCard size={14} />
                  <span>Courier Charge</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  ৳{district.deliveryChargeBdt} Flat Rate
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold mb-0.5">
                  <ShieldCheck size={14} />
                  <span>Payment Method</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Cash on Delivery
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-0.5">
                  <Headphones size={14} />
                  <span>Tech Support</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {district.serviceAvailability.hasOnSiteCctv ? 'On-Site / Remote' : 'Remote & Software'}
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
              >
                <span>Browse Available Products</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20am%20ordering%20from%20${district.nameEn}...`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Order Support</span>
              </a>
            </div>
          </div>
        </section>

        {/* Category Discovery Pills */}
        <section className="py-6 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="font-bold text-slate-400 shrink-0">Popular Categories:</span>
            <Link
              href="/laptops"
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Laptop size={14} />
              <span>Laptops</span>
            </Link>
            <Link
              href="/computers"
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Cpu size={14} />
              <span>Custom PCs</span>
            </Link>
            <Link
              href="/cctv"
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Camera size={14} />
              <span>CCTV Systems</span>
            </Link>
            <Link
              href="/electrical-products"
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Zap size={14} />
              <span>Electrical Supplies</span>
            </Link>
            <Link
              href="/services"
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors shrink-0"
            >
              <span>Services &amp; Software</span>
            </Link>
          </div>
        </section>

        {/* Featured Live Products */}
        {products.length > 0 && (
          <section className="py-12 px-4 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Trending Products for Fast Delivery to {district.nameEn}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready in stock with tested warranty and open-box courier dispatch.
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Store</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((item) => (
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

        {/* Verified Service Availability Notice */}
        <section className="py-8 px-4 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" />
              <span>Service &amp; Order Policies for {district.nameEn}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {district.serviceAvailability.notesEn}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              বাংলা নোট: {district.serviceAvailability.notesBn}
            </p>
          </div>
        </section>

        {/* District FAQs */}
        <section className="py-12 px-4 max-w-4xl mx-auto w-full space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions for {district.nameEn}
            </h2>
            <p className="text-xs text-slate-500">
              Everything you need to know about purchasing, shipping, and after-sales support.
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            {localFaqs.map((faq, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5"
              >
                <h3 className="font-bold text-slate-900 dark:text-white">{faq.question}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <CustomerFooter />
      </div>
    );
  }

  // Render Division View
  if (division) {
    const districtsInDivision = getDistrictsByDivision(division.id);

    const breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Locations', path: '/locations' },
      { name: division.nameEn, path: `/locations/${division.slug}` },
    ];
    const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <CustomerHeader />
        <Breadcrumb items={breadcrumbs} />

        {/* Hero Section */}
        <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/30">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
              <MapPin size={14} />
              <span>
                {division.nameEn} ({division.nameBn}) • {districtsInDivision.length} Districts
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Technology &amp; Electrical Hub for {division.nameEn}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
              Serving every district in {division.nameEn} with tested enterprise laptops, custom computers, CCTV surveillance setups, and electrical components. Reliable door-to-door courier shipping with verified warranties.
            </p>
          </div>
        </section>

        {/* Districts in this Division Grid */}
        <section className="py-12 px-4 max-w-7xl mx-auto w-full space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Districts in {division.nameEn}
            </h2>
            <p className="text-xs text-slate-500">
              Select your district for specific delivery timelines, courier rates, and order options.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {districtsInDivision.map((dist) => (
              <Link
                key={dist.id}
                href={`/locations/${dist.slug}`}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-blue-500 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {dist.nameEn}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">{dist.nameBn}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {dist.deliveryTimeHours}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>৳{dist.deliveryChargeBdt} Courier</span>
                  <span className="text-blue-600 dark:text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Explore</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {products.length > 0 && (
          <section className="py-12 px-4 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Available Products for {division.nameEn}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Laptops, computers, and CCTV systems ready for express courier dispatch.
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Browse Entire Catalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((item) => (
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

        <CustomerFooter />
      </div>
    );
  }

  return notFound();
}
