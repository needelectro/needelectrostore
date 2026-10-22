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
import { ProductSpecificationsView } from '@/src/components/customer/ProductSpecificationsView';
import {
  ShieldCheck, CheckCircle2, Phone, MessageCircle, Truck,
  CreditCard, Clock, MapPin, Laptop, Cpu, Check, ArrowRight
} from 'lucide-react';

export const revalidate = 60;

// Helper to find product by slug or SKU
async function getProductBySlug(rawSlug: string) {
  if (!rawSlug) return null;
  const slug = decodeURIComponent(rawSlug).trim();

  try {
    // 1. Direct match by exact ID or exact SKU (case-insensitive)
    let product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: slug },
          { sku: { equals: slug, mode: 'insensitive' } },
        ],
      },
    });
    if (product) return product;

    // 2. Extract potential SKU candidates from the slug
    const skuCandidates = new Set<string>();

    // Standard pattern PROD-xxxx
    const prodMatch = slug.match(/[-_](prod[-_]?\d+)$/i);
    if (prodMatch) skuCandidates.add(prodMatch[1].replace('_', '-'));

    // Standard pattern SKU-xxxx-xxxx
    const skuMatch = slug.match(/[-_](sku[-_][a-z0-9]+([-_][a-z0-9]+)*)$/i);
    if (skuMatch) skuCandidates.add(skuMatch[1].replace(/_/g, '-'));

    // Suffix slices (last 1, 2, 3, 4 parts)
    const parts = slug.split('-');
    for (let i = 1; i <= Math.min(4, parts.length); i++) {
      skuCandidates.add(parts.slice(parts.length - i).join('-'));
    }

    const lastPart = parts[parts.length - 1];

    const orConditions: any[] = [];
    for (const candidate of Array.from(skuCandidates)) {
      orConditions.push({ sku: { equals: candidate, mode: 'insensitive' } });
      orConditions.push({ id: { equals: candidate, mode: 'insensitive' } });
    }
    if (lastPart && /^\d+$/.test(lastPart)) {
      orConditions.push({ sku: { endsWith: lastPart, mode: 'insensitive' } });
    }

    if (orConditions.length > 0) {
      product = await prisma.product.findFirst({
        where: { OR: orConditions },
      });
      if (product) return product;
    }

    // 3. Match against slugified database products
    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, sku: true },
    });

    const targetSlugLower = slug.toLowerCase();
    for (const p of allProducts) {
      const fullSlug = `${slugify(p.name)}-${p.sku.toLowerCase()}`;
      const nameSlug = slugify(p.name);
      if (fullSlug === targetSlugLower || nameSlug === targetSlugLower) {
        return await prisma.product.findUnique({ where: { id: p.id } });
      }
    }

    // 4. Keyword fuzzy match (extract word tokens from slug)
    const cleanTokens = slug
      .replace(/(prod[-_]\d+|sku[-_][a-z0-9-]+|\d+)$/i, '')
      .split(/[-_]+/)
      .filter((t) => t.length > 2);

    if (cleanTokens.length > 0) {
      product = await prisma.product.findFirst({
        where: {
          AND: cleanTokens.slice(0, 3).map((token) => ({
            name: { contains: token, mode: 'insensitive' },
          })),
        },
      });
      if (product) return product;
    }

    return null;
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
  const brandPart = product.brand ? `${product.brand} ` : '';
  const modelPart = product.model ? ` ${product.model}` : '';
  const isLaptop = product.category.toLowerCase().includes('laptop') || product.name.toLowerCase().includes('laptop');

  const title = `${product.name} Price in Bangladesh | ${brandPart}${modelPart} | NEED ELECTRO`;

  // Generate descriptive meta description from actual product content
  let realDescriptionExcerpt = '';
  if (product.description) {
    const cleanDesc = product.description
      .replace(/<[^>]+>/g, ' ')
      .replace(/[*#_`|~-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleanDesc.length > 20) {
      realDescriptionExcerpt = cleanDesc.length > 130 ? cleanDesc.slice(0, 127).trim() + '...' : cleanDesc;
    }
  }

  const description = realDescriptionExcerpt
    ? `${realDescriptionExcerpt} Buy authentic ${product.name} at ৳${priceFormatted} BDT with warranty from NEED ELECTRO.`
    : `Buy 100% authentic ${product.name} at ৳${priceFormatted} BDT in Bangladesh. ${
        product.warrantyPeriodMonths ? `${product.warrantyPeriodMonths} Months Warranty. ` : 'Official warranty. '
      }Genuine hardware, cash on delivery nationwide & express delivery in Moulvibazar, Sylhet.`;

  const brandKeywords = product.brand ? [`${product.brand} price in Bangladesh`, `${product.brand} Moulvibazar`] : [];
  const laptopKeywords = isLaptop
    ? ['Laptop price in Bangladesh', 'Genuine laptop with warranty in Bangladesh', 'Laptop price in Moulvibazar', 'HP EliteBook price in Bangladesh']
    : [];

  return generateSeoMetadata({
    title,
    description,
    path: `/product/${slugify(product.name)}-${product.sku.toLowerCase()}`,
    keywords: [
      product.name,
      `${product.name} price in Bangladesh`,
      `${product.name} price in Moulvibazar`,
      product.sku,
      ...brandKeywords,
      ...laptopKeywords,
      'NEED ELECTRO',
      'মৌলভীবাজার কম্পিউটার দোকান',
      'ল্যাপটপের দাম বাংলাদেশ',
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
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(breadcrumbs)) }}
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

        {/* Full Specifications & Description (Synced automatically from ERP) */}
        <ProductSpecificationsView
          description={product.description}
          specs={product.specs}
          warrantyPeriodMonths={product.warrantyPeriodMonths || undefined}
          productName={product.name}
          sku={product.sku}
        />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#002B5B]">Similar Products You Might Like</h2>
              <Link href={isLaptop ? '/laptops' : `/${slugify(product.category)}`} className="text-xs font-bold text-[#008CFF] hover:underline">
                View More in {product.category} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
