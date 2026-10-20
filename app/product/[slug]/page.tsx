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
import { ProductDetailView } from '@/src/components/customer/ProductDetailView';
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
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Main Product Hero */}
      <section className="py-10 px-4 max-w-7xl mx-auto w-full">
        <ProductDetailView
          product={{
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            brand: product.brand,
            model: product.model,
            description: product.description,
            imageUrl: product.imageUrl,
            images: Array.isArray(product.images) ? (product.images as string[]) : null,
            retailPrice: retailPriceNum,
            currentStock: product.currentStock,
            warrantyPeriodMonths: product.warrantyPeriodMonths || undefined,
          }}
          isLaptop={isLaptop}
          emiMonthly={emiMonthly}
        />

        {/* Detailed Technical Specifications Table */}
        {product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0 && (
          <div className="mt-14 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Technical Specifications
            </h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {Object.entries(product.specs).map(([key, value]) => {
                    if (!value || typeof value === 'object') return null;
                    const readableKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase());
                    return (
                      <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-5 font-semibold text-slate-500 dark:text-slate-400 w-1/3 bg-slate-50 dark:bg-slate-950/40">
                          {readableKey}
                        </td>
                        <td className="py-3 px-5 text-slate-900 dark:text-slate-100 font-medium">
                          {String(value)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-500 dark:text-slate-400 w-1/3 bg-slate-50 dark:bg-slate-950/40">
                      Warranty Coverage
                    </td>
                    <td className="py-3 px-5 text-slate-900 dark:text-slate-100 font-medium">
                      {product.warrantyPeriodMonths 
                        ? `${product.warrantyPeriodMonths} Months Official / Service Warranty`
                        : '7-Day Replacement Guarantee & 2-Year Service Warranty'}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-500 dark:text-slate-400 w-1/3 bg-slate-50 dark:bg-slate-950/40">
                      Product Condition
                    </td>
                    <td className="py-3 px-5 text-slate-900 dark:text-slate-100 font-medium">
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Similar Products You Might Like</h2>
              <Link href={isLaptop ? '/laptops' : `/${slugify(product.category)}`} className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline">
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
