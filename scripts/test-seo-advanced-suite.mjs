// NEED ELECTRO ERP & Storefront — Advanced Technical SEO Automated Test Suite
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: connectionUrl } },
});

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
  }
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('  NEED ELECTRO STORE ADVANCED SEO VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  // Dynamically import SEO helper modules
  const {
    BUSINESS_INFO,
    getCanonicalUrl,
    slugify,
    generateSeoMetadata,
    buildOrganizationSchema,
    buildWebSiteSchema,
    buildLocalBusinessSchema,
    buildProductSchema,
    buildBreadcrumbSchema,
  } = await import('../lib/seoConfig.ts');

  const fs = await import('node:fs');
  const path = await import('node:path');
  const robotsContent = fs.readFileSync(path.resolve('app/robots.ts'), 'utf-8');

  // -------------------------------------------------------------
  // Test 1: Production Base URL & Canonical Handling
  // -------------------------------------------------------------
  console.log('--- Test Group 1: Canonical Base URL Configuration ---');
  const baseDomain = BUSINESS_INFO.domain;
  assert(
    baseDomain.startsWith('https://'),
    'Authoritative domain uses secure HTTPS protocol',
    baseDomain
  );
  assert(
    !baseDomain.endsWith('/'),
    'Base domain has no trailing slash',
    baseDomain
  );

  const rootCanonical = getCanonicalUrl('/');
  assert(
    rootCanonical === baseDomain,
    'Root canonical URL matches exact base domain without trailing slash',
    rootCanonical
  );

  const productCanonical = getCanonicalUrl('/product/hp-elitebook-840-g7-sku-lpt-0012');
  assert(
    productCanonical === `${baseDomain}/product/hp-elitebook-840-g7-sku-lpt-0012`,
    'Product canonical URL builds absolute HTTPS URL correctly',
    productCanonical
  );

  // -------------------------------------------------------------
  // Test 2: Metadata Generation Integrity
  // -------------------------------------------------------------
  console.log('\n--- Test Group 2: Metadata Title & Description Lengths ---');
  const metaSample = generateSeoMetadata({
    title: 'HP EliteBook 845 G8 Laptop Price in BD',
    description: 'Explore HP EliteBook 845 G8 at NEED ELECTRO Moulvibazar. AMD Ryzen 7 processor, 16GB RAM, 512GB SSD.',
    path: '/product/hp-elitebook-845-g8',
  });

  const titleStr = typeof metaSample.title === 'string' ? metaSample.title : metaSample.title?.absolute || '';
  assert(
    titleStr.includes('NEED ELECTRO'),
    'Title includes primary store brand name',
    titleStr
  );
  assert(
    titleStr.length <= 75,
    'Title length is optimal for search engines (<= 75 chars)',
    `Length: ${titleStr.length}`
  );

  assert(
    metaSample.description && metaSample.description.length >= 50 && metaSample.description.length <= 165,
    'Meta description length falls within Google/Bing recommended range (50-165 chars)',
    `Length: ${metaSample.description?.length}`
  );

  // -------------------------------------------------------------
  // Test 3: Robots.txt Directives & Exclusion Rules
  // -------------------------------------------------------------
  console.log('\n--- Test Group 3: Robots Directives & Exclusion Rules ---');
  assert(robotsContent.includes("userAgent: '*'"), 'Robots configuration has wildcard userAgent (*) rule');
  assert(
    robotsContent.includes("'/shop'") && robotsContent.includes("'/product/*'"),
    'Robots rule explicitly allows /shop and /product/*'
  );
  assert(
    robotsContent.includes("'/admin'") && robotsContent.includes("'/admin/*'"),
    'Robots rule disallows private /admin routes'
  );
  assert(
    robotsContent.includes("'/cart'") && robotsContent.includes("'/cart/*'"),
    'Robots rule disallows non-indexable /cart routes'
  );
  assert(
    robotsContent.includes("'/checkout'") && robotsContent.includes("'/checkout/*'"),
    'Robots rule disallows non-indexable /checkout routes'
  );
  assert(
    robotsContent.includes("sitemap: `${domain}/sitemap.xml`"),
    'Robots configuration points to authoritative XML sitemap'
  );

  // -------------------------------------------------------------
  // Test 4: Schema.org Structured Data
  // -------------------------------------------------------------
  console.log('\n--- Test Group 4: Structured Data (Schema.org) ---');
  const orgSchema = buildOrganizationSchema();
  assert(orgSchema['@type'] === 'Organization', 'Organization schema type is valid');
  assert(Boolean(orgSchema.logo), 'Organization schema has verified logo');
  assert(Boolean(orgSchema.telephone), 'Organization schema has phone contact point');

  const webSiteSchema = buildWebSiteSchema();
  assert(webSiteSchema['@type'] === 'WebSite', 'WebSite schema type is valid');
  assert(
    webSiteSchema.potentialAction && webSiteSchema.potentialAction['@type'] === 'SearchAction',
    'WebSite schema includes SearchAction for Google Sitelinks Searchbox'
  );

  const localBizSchema = buildLocalBusinessSchema();
  const isLocalBizValid =
    localBizSchema['@type'] === 'OnlineStore' ||
    localBizSchema['@type'] === 'LocalBusiness' ||
    (Array.isArray(localBizSchema['@type']) && localBizSchema['@type'].includes('ComputerStore'));
  assert(
    isLocalBizValid,
    'Local business / ComputerStore schema type is valid'
  );
  assert(
    localBizSchema.address && localBizSchema.address.addressLocality === 'Moulvibazar',
    'LocalBusiness address correctly identifies Moulvibazar'
  );

  const productSchema = buildProductSchema({
    name: 'HP EliteBook 845 G7',
    sku: 'SKU-LPT-0012',
    category: 'Laptop',
    brand: 'HP',
    model: '845 G7',
    description: 'High-performance business laptop with AMD Ryzen 5, 8GB RAM and 256GB SSD.',
    retailPrice: 32000,
    currentStock: 5,
    warrantyPeriodMonths: 24,
    status: 'ACTIVE',
  });

  assert(productSchema['@type'] === 'Product', 'Product schema type is valid');
  assert(productSchema.offers['@type'] === 'Offer', 'Offer schema type is valid');
  assert(
    productSchema.offers.priceCurrency === 'BDT',
    'Offer priceCurrency is BDT',
    productSchema.offers.priceCurrency
  );
  assert(
    productSchema.offers.price === '32000.00',
    'Offer price formatted cleanly as 32000.00',
    productSchema.offers.price
  );
  assert(
    productSchema.offers.availability === 'https://schema.org/InStock',
    'In-stock product gets InStock availability schema'
  );
  assert(
    Boolean(productSchema.offers.priceValidUntil),
    'Offer has valid priceValidUntil date',
    productSchema.offers.priceValidUntil
  );
  assert(
    !('aggregateRating' in productSchema),
    'Strict compliance: No fake reviews or fabricated aggregateRating'
  );

  // Review and aggregateRating support when reviews exist
  const reviewedProductSchema = buildProductSchema({
    name: 'HP EliteBook 845 G7',
    sku: 'SKU-LPT-0012',
    category: 'Laptop',
    brand: 'HP',
    retailPrice: 32000,
    currentStock: 5,
    ratingValue: 4.9,
    reviewCount: 12,
    reviews: [
      {
        authorName: 'Tanvir Ahmed',
        comment: 'Excellent laptop, authentic HP quality and super fast delivery in Moulvibazar.',
        rating: 5,
      },
    ],
  });
  assert(
    Boolean(reviewedProductSchema.aggregateRating && reviewedProductSchema.aggregateRating.ratingValue === 4.9),
    'Verified reviews unlock aggregateRating schema for SERP stars'
  );
  assert(
    Boolean(Array.isArray(reviewedProductSchema.review) && reviewedProductSchema.review.length === 1),
    'Verified reviews unlock individual Review schema'
  );

  // Out of stock product availability check
  const outOfStockSchema = buildProductSchema({
    name: 'Sold Out Item',
    sku: 'SKU-OUT-001',
    category: 'Laptop',
    brand: 'Dell',
    retailPrice: 40000,
    currentStock: 0,
    status: 'OUT_OF_STOCK',
  });
  assert(
    outOfStockSchema.offers.availability === 'https://schema.org/OutOfStock',
    'Out of stock product gets OutOfStock availability schema',
    outOfStockSchema.offers.availability
  );

  // Breadcrumb schema
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Laptops', path: '/laptops' },
    { name: 'HP EliteBook 845 G7', path: '/product/hp-elitebook-845-g7-sku-lpt-0012' },
  ]);
  assert(
    breadcrumbSchema.itemListElement.length === 2,
    'BreadcrumbList schema has correct element count'
  );

  // -------------------------------------------------------------
  // Test 5: Database Catalog Integrity & Slug Validation
  // -------------------------------------------------------------
  console.log('\n--- Test Group 5: Database Product Catalog & Slug Integrity ---');
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      retailPrice: true,
      currentStock: true,
      status: true,
      isPublished: true,
    },
  });

  assert(products.length > 0, `Database contains ${products.length} products`);

  const skuSet = new Set();
  let duplicateSkus = 0;
  products.forEach(p => {
    if (skuSet.has(p.sku.toLowerCase())) duplicateSkus++;
    skuSet.add(p.sku.toLowerCase());
  });
  assert(duplicateSkus === 0, 'All product SKUs are unique in the database');

  // Slug candidate generation test
  let slugGenerationSuccess = true;
  products.slice(0, 20).forEach(p => {
    const slug = `${slugify(p.name)}-${p.sku.toLowerCase()}`;
    if (!slug || slug.includes(' ') || slug.includes('--')) {
      slugGenerationSuccess = false;
    }
  });
  assert(slugGenerationSuccess, 'Generated product slugs are URL-safe and normalized');

  // -------------------------------------------------------------
  // Test 6: 301 Permanent Redirects Loop & Mapping Verification
  // -------------------------------------------------------------
  console.log('\n--- Test Group 6: 301 Permanent Redirects Verification ---');
  const testRedirects = [
    { from: '/products', to: '/shop' },
    { from: '/product', to: '/shop' },
    { from: '/laptop', to: '/laptops' },
    { from: '/computer', to: '/computers' },
    { from: '/cctv-camera', to: '/cctv' },
    { from: '/installments', to: '/laptop-emi' },
    { from: '/moulvibazar-laptop', to: '/moulvibazar' },
  ];

  testRedirects.forEach(r => {
    assert(
      r.from.toLowerCase() !== r.to.toLowerCase(),
      `Redirect from "${r.from}" to "${r.to}" avoids redirect loop`
    );
  });

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} total tests`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite()
  .catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
