import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildLocalBusinessSchema, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import {
  MapPin, Phone, MessageCircle, Laptop, Camera, Zap,
  ShieldCheck, Truck, CheckCircle2, ArrowRight, CreditCard
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Computer & Laptop Shop in Sylhet | NEED ELECTRO',
    description:
      'Buy authentic HP, Dell, and Lenovo laptops, desktop computers, CCTV surveillance cameras, and electrical equipment in Sylhet. 24-hour express courier delivery across Sylhet Sadar, Zindabazar, Amberkhana & all upazilas.',
    path: '/sylhet',
    keywords: [
      'Laptop shop in Sylhet',
      'Laptop price in Sylhet',
      'Computer shop Sylhet',
      'CCTV camera Sylhet',
      'Used laptop in Sylhet',
      'HP laptop Sylhet',
      'Dell laptop Sylhet',
      'Lenovo laptop Sylhet',
      'Electrical products Sylhet',
      'Laptop EMI Sylhet',
      'Cash on delivery laptop Sylhet',
      'মৌলভীবাজার ল্যাপটপের দোকান',
      'কম্পিউটার দোকান মৌলভীবাজার',
      'সিসিটিভি ক্যামেরা মৌলভীবাজার',
      'ল্যাপটপ কিস্তিতে',
      'সিলেট ল্যাপটপের দোকান',
      'কম্পিউটার দোকান সিলেট',
    ],
  });
}

export default async function SylhetPage() {
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
      take: 8,
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    });
  } catch (err) {
    console.error('Sylhet page query error:', err);
  }

  const breadcrumbs = [
    { name: 'Locations', path: '/locations' },
    { name: 'Sylhet Division', path: '/sylhet' },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
  const localSchema = buildLocalBusinessSchema();

  const faqs = [
    {
      question: 'Can I get laptops on EMI in Moulvibazar & Sylhet?',
      answer:
        'Yes! NEED ELECTRO offers flexible 0% interest laptop and computer installment plans (3 to 12 months) for customers across Moulvibazar and Sylhet Division with local guarantor or NID verification.',
    },
    {
      question: 'Do you provide home delivery in Moulvibazar & Sylhet?',
      answer:
        'Yes. We provide 24-hour express courier and doorstep delivery across Moulvibazar Sadar, Sreemangal, Kulaura, Rajnagar, and Sylhet City (Zindabazar, Amberkhana, Shibganj, Upashahar) with Cash on Delivery (COD) and open-box parcel inspection.',
    },
    {
      question: 'Do you offer CCTV camera installation in Moulvibazar & Sylhet?',
      answer:
        'Yes. Our certified technicians provide complete turnkey HD and IP CCTV surveillance installation, DVR/NVR configuration, and mobile app live view setup across Moulvibazar and Sylhet Division.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-12 px-4 bg-gradient-to-b from-[#081621] to-[#040e19] text-white">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0084d6]/20 border border-[#0084d6]/40 text-sky-300">
            <MapPin size={13} />
            <span>Sylhet Division Regional Delivery &amp; Support Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Computer &amp; Laptop Shop in Sylhet Division — NEED ELECTRO
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Fast 24-hour courier delivery across Sylhet City (Zindabazar, Amberkhana, Shibganj, Upashahar), Moulvibazar, Habiganj, and Sunamganj. Authentic hardware with official warranty, open-box inspection, and doorstep Cash on Delivery for only ৳60.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/laptops"
              className="px-5 py-2.5 rounded-xl bg-[#0084d6] hover:bg-[#0073bc] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <span>Browse Laptops</span>
              <ArrowRight size={14} />
            </Link>
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <Phone size={14} />
              <span>Call Hotline: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Sylhet Features / Localized Trust Badges */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <Truck size={20} className="text-[#0084d6] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Fast Delivery to Moulvibazar Sadar, Sreemangal, Kulaura, Rajnagar &amp; Sylhet</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">Doorstep Cash on Delivery (COD) &amp; bKash verified payment with open-box verification.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Official Warranty &amp; Local Servicing</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">Direct 7-day replacement warranty and up to 2 years physical servicing at our Moulvibazar lab.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <CreditCard size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">Sylhet Division Student &amp; Office EMI</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">3 to 12-month installment plans with debit card or local NID verification.</p>
            </div>
          </div>
        </div>

        {/* Featured Products for Sylhet */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Featured Hardware for Sylhet
              </h2>
              <p className="text-xs text-slate-500">Available for immediate dispatch</p>
            </div>
            <Link
              href="/laptops"
              className="text-xs font-bold text-[#0084d6] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
