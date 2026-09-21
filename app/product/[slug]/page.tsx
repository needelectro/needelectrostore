import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildProductSchema, buildBreadcrumbSchema, slugify } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import {
  ShieldCheck, CheckCircle2, Phone, MessageCircle, Truck,
  CreditCard, Clock, MapPin, Laptop, Cpu, Check, ArrowRight
} from 'lucide-react';

export const revalidate = 60;

// Helper to find product by slug or SKU
async function getProductBySlug(slug: string) {
  try {
    // Try matching by exact SKU first (e.g. if slug is the SKU or ends with SKU)
    const parts = slug.split('-');
    const possibleSku = parts[parts.length - 1];

    let product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: { equals: slug, mode: 'insensitive' } },
          { id: { equals: slug } },
          { sku: { equals: possibleSku, mode: 'insensitive' } },
        ],
      },
    });

    if (product) return product;

    // Fallback search by clean name match
    const cleanSlug = slug.replace(/-[a-z0-9]+$/, '').replace(/-/g, ' ');
    product = await prisma.product.findFirst({
      where: {
        name: { contains: cleanSlug, mode: 'insensitive' },
      },
    });

    return product;
  } catch (err) {
    console.error('Failed to get product by slug:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return generateSeoMetadata({
      title: 'Product Not Found',
      description: 'The requested product is not available at NEED ELECTRO.',
      path: `/product/${params.slug}`,
      noIndex: true,
    });
  }

  const priceFormatted = Number(product.retailPrice).toLocaleString();
  const title = `${product.name} | Price & Specs in Moulvibazar | NEED ELECTRO`;
  const description = `${product.name} available at NEED ELECTRO Moulvibazar for ৳${priceFormatted} BDT. ${
    product.warrantyPeriodMonths ? `${product.warrantyPeriodMonths} Months Warranty.` : ''
  } 100% genuine with replacement guarantee and EMI installments in Moulvibazar.`;

  return generateSeoMetadata({
    title,
    description,
    path: `/product/${slugify(product.name)}-${product.sku.toLowerCase()}`,
    keywords: [
      product.name,
      `${product.name} price in Moulvibazar`,
      `${product.brand} laptop Moulvibazar`,
      `${product.sku} price Bangladesh`,
      'মৌলভীবাজার ল্যাপটপ',
    ],
    ogImage: product.imageUrl || '/logo-dark-transparent.png',
  });
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const isAvailable = product.currentStock > 0;
  const retailPriceNum = Number(product.retailPrice);
  const emiMonthly = retailPriceNum > 0 ? Math.round((retailPriceNum * 0.75) / 6) : null;
  const isLaptop = product.category.toLowerCase().includes('laptop') || product.name.toLowerCase().includes('laptop');

  // Structured Data
  const productSchema = buildProductSchema({
    name: product.name,
    sku: product.sku,
    category: product.category,
    brand: product.brand,
    model: product.model,
    description: product.description,
    imageUrl: product.imageUrl,
    retailPrice: retailPriceNum,
    currentStock: product.currentStock,
    warrantyPeriodMonths: product.warrantyPeriodMonths,
    specs: product.specs,
  });

  // Query related products from same category
  let relatedProducts: any[] = [];
  try {
    relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        status: 'ACTIVE',
      },
      take: 4,
      orderBy: { currentStock: 'desc' },
    });
  } catch (e) {
    console.error('Related products fetch error:', e);
  }

  const breadcrumbs = [
    { name: product.category || 'Products', path: isLaptop ? '/laptops' : `/${slugify(product.category)}` },
    { name: product.name, path: `/product/${slugify(product.name)}-${product.sku.toLowerCase()}` },
  ];

  const whatsappMessage = encodeURIComponent(
    `Hello NEED ELECTRO Moulvibazar! I want to inquire about purchasing:\nProduct: ${product.name}\nSKU: ${product.sku}\nPrice: ৳${retailPriceNum.toLocaleString()}\nIs it available in your Kusumbag showroom?`
  );

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Main Product Hero */}
      <section className="py-10 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Product Photo & Media */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 aspect-[4/3] flex items-center justify-center relative overflow-hidden shadow-2xl">
              <img
                src={product.imageUrl || (isLaptop ? '/logo-dark-transparent.png' : '/logo-icon.png')}
                alt={`${product.name} available at ${BUSINESS_INFO.name} Moulvibazar`}
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute top-4 left-4 bg-slate-950/80 border border-slate-700 text-cyan-300 font-bold px-2.5 py-1 rounded-lg text-xs">
                {product.brand}
              </span>
              <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isAvailable ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
              }`}>
                {isAvailable ? 'In Stock (Moulvibazar)' : 'Pre-Order'}
              </span>
            </div>

            {/* Warranty & Guarantee Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-cyan-400 shrink-0" />
                <span className="text-slate-300 font-medium">7-Day Replacement</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <Clock size={18} className="text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-medium">2-Year Free Service</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <Truck size={18} className="text-amber-400 shrink-0" />
                <span className="text-slate-300 font-medium">Open-Box Verification</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <CreditCard size={18} className="text-blue-400 shrink-0" />
                <span className="text-slate-300 font-medium">Laptop EMI Available</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-cyan-300 font-semibold">
                  SKU: {product.sku}
                </span>
                <span>Category: {product.category}</span>
                {product.model && <span>Model: {product.model}</span>}
              </div>

              {/* Single Semantic H1 for the Product Page */}
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.description && (
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Pricing Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Cash / bKash / Showroom Price</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-cyan-400 font-mono">
                    ৳{retailPriceNum.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">BDT (VAT Incl.)</span>
                </div>

                {isLaptop && emiMonthly && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block mb-1">Monthly Installment</span>
                    <span className="text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl inline-block">
                      From ৳{emiMonthly.toLocaleString()}/mo
                    </span>
                  </div>
                )}
              </div>

              {isLaptop && (
                <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>Available on 3, 6, 9 & 12 Month EMI plans</span>
                  <Link href="/laptop-emi" className="text-cyan-400 hover:underline font-bold">
                    View EMI Terms →
                  </Link>
                </div>
              )}
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <MessageCircle size={17} />
                <span>Order on WhatsApp</span>
              </a>

              {isLaptop && (
                <Link
                  href="/laptop-emi"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                >
                  <CreditCard size={17} />
                  <span>Apply for EMI</span>
                </Link>
              )}

              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Phone size={15} className="text-cyan-400" />
                <span>Call Showroom</span>
              </a>
            </div>

            {/* Pickup & Verification Notice */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <MapPin size={14} />
                <span>Moulvibazar Showroom Pickup Available</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                MR Plaza, Kusumbag, Moulvibazar. Test the laptop personally before buying. Same-day hand delivery available in Moulvibazar town, Sreemangal, and Kulaura.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Technical Specifications Table */}
        {product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0 && (
          <div className="mt-14 space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              Technical Specifications
            </h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-slate-800/80">
                  {Object.entries(product.specs).map(([key, value]) => {
                    if (!value || typeof value === 'object') return null;
                    const readableKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase());
                    return (
                      <tr key={key} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-5 font-semibold text-slate-400 w-1/3 bg-slate-950/40">
                          {readableKey}
                        </td>
                        <td className="py-3 px-5 text-slate-100 font-medium">
                          {String(value)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-400 w-1/3 bg-slate-950/40">
                      Warranty Coverage
                    </td>
                    <td className="py-3 px-5 text-slate-100 font-medium">
                      {product.warrantyPeriodMonths 
                        ? `${product.warrantyPeriodMonths} Months Official / Service Warranty`
                        : '7-Day Replacement Guarantee & 2-Year Service Warranty'}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-400 w-1/3 bg-slate-950/40">
                      Product Condition
                    </td>
                    <td className="py-3 px-5 text-slate-100 font-medium">
                      100% Tested Hardware (Fresh Cosmetic Condition, Verified Motherboard & Battery)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Similar Products You Might Like</h2>
              <Link href={isLaptop ? '/laptops' : `/${slugify(product.category)}`} className="text-xs font-bold text-cyan-400 hover:underline">
                View More in {product.category} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(item => (
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
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}
