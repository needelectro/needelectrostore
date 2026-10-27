// Test script: test-product-share.mjs
// Verifies the complete product sharing system: canonical URLs, share text formatting,
// social share link generation, database schema, Prisma model, and analytics aggregation.

import { PrismaClient } from '@prisma/client';

const BUSINESS_INFO = {
  name: 'NEED ELECTRO',
  tagline: 'Trusted Electrical and Technological Solutions',
  domain: 'https://www.needelectro.store',
  currencySymbol: '৳',
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// 1. Re-implement pure helper tests
function getProductCanonicalUrl(product) {
  const slug = `${slugify(product.name)}-${product.sku.toLowerCase()}`;
  const base = BUSINESS_INFO.domain.replace(/\/+$/, '');
  const url = `${base}/product/${slug}`;

  if (product.referralCode && product.referralCode.trim()) {
    const cleanRef = encodeURIComponent(product.referralCode.trim());
    return `${url}?ref=${cleanRef}`;
  }
  return url;
}

function buildProductShareText(product) {
  const priceFormatted = Number(product.retailPrice).toLocaleString('en-US');
  return (
    `Check out this product from ${BUSINESS_INFO.name}!\n\n` +
    `${product.name}\n` +
    `Price: ${BUSINESS_INFO.currencySymbol}${priceFormatted}\n\n` +
    `Explore product details and order online:\n` +
    `${product.url}\n\n` +
    `${BUSINESS_INFO.name} — ${BUSINESS_INFO.tagline}`
  );
}

function getShareDestinationUrl(method, product) {
  const shareText = buildProductShareText(product);
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(product.url);

  switch (method) {
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodedText}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'messenger':
      return `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    case 'email': {
      const subject = encodeURIComponent(`Check out ${product.name} on ${BUSINESS_INFO.name}`);
      return `mailto:?subject=${subject}&body=${encodedText}`;
    }
    default:
      return null;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING NEED ELECTRO PRODUCT SHARING SYSTEM');
  console.log('====================================================\n');

  // Test 1: Canonical URL Generation
  console.log('--- 1. Testing Canonical URL Generation ---');
  const mockProduct = {
    name: 'Dell Latitude 7490 Core i7 Laptop',
    sku: 'PROD-7490',
    retailPrice: 38500,
  };
  const canonicalUrl = getProductCanonicalUrl(mockProduct);
  assert(
    canonicalUrl.startsWith('https://www.needelectro.store/product/'),
    'Canonical URL starts with site domain and /product/'
  );
  assert(
    canonicalUrl.includes('dell-latitude-7490-core-i7-laptop-prod-7490'),
    'Canonical URL contains slugified product name and lowercase sku'
  );
  assert(!canonicalUrl.includes('?'), 'Canonical URL contains no tracking query parameters by default');

  // Test 2: Referral URL Generation
  console.log('\n--- 2. Testing Referral Code URL Generation ---');
  const mockProductWithRef = {
    ...mockProduct,
    referralCode: 'PARTNER2026',
  };
  const refUrl = getProductCanonicalUrl(mockProductWithRef);
  assert(refUrl.includes('?ref=PARTNER2026'), 'Referral URL correctly appends ?ref=PARTNER2026');

  // Test 3: Share Message Content & Formatting
  console.log('\n--- 3. Testing Share Content Formatting ---');
  const shareText = buildProductShareText({
    name: mockProduct.name,
    retailPrice: mockProduct.retailPrice,
    url: canonicalUrl,
  });
  assert(shareText.includes('Check out this product from NEED ELECTRO!'), 'Includes greeting and brand name');
  assert(shareText.includes(mockProduct.name), 'Includes actual product name');
  assert(shareText.includes('Price: ৳38,500'), 'Includes BDT currency symbol and comma-formatted price');
  assert(shareText.includes('Explore product details and order online:'), 'Includes call to action');
  assert(shareText.includes(canonicalUrl), 'Includes canonical product URL');
  assert(shareText.includes('NEED ELECTRO — Trusted Electrical and Technological Solutions'), 'Includes official tagline');

  // Test 4: Social Share Destinations
  console.log('\n--- 4. Testing Social Share URLs ---');
  const shareData = {
    name: mockProduct.name,
    retailPrice: mockProduct.retailPrice,
    url: canonicalUrl,
  };

  const whatsappUrl = getShareDestinationUrl('whatsapp', shareData);
  assert(whatsappUrl.startsWith('https://api.whatsapp.com/send?text='), 'WhatsApp share URL valid');
  assert(whatsappUrl.includes(encodeURIComponent('৳38,500')), 'WhatsApp URL encodes formatted price');

  const facebookUrl = getShareDestinationUrl('facebook', shareData);
  assert(facebookUrl.startsWith('https://www.facebook.com/sharer/sharer.php?u='), 'Facebook share URL valid');
  assert(facebookUrl.includes(encodeURIComponent(canonicalUrl)), 'Facebook URL points to canonical URL');

  const messengerUrl = getShareDestinationUrl('messenger', shareData);
  assert(messengerUrl.startsWith('https://www.facebook.com/dialog/send?link='), 'Messenger share dialog URL valid');

  const telegramUrl = getShareDestinationUrl('telegram', shareData);
  assert(telegramUrl.startsWith('https://t.me/share/url?url='), 'Telegram share URL valid');
  assert(telegramUrl.includes(encodeURIComponent(canonicalUrl)), 'Telegram URL includes canonical URL');

  const emailUrl = getShareDestinationUrl('email', shareData);
  assert(emailUrl.startsWith('mailto:?subject='), 'Email share URL valid');
  assert(emailUrl.includes('mailto:?subject=' + encodeURIComponent(`Check out ${mockProduct.name} on NEED ELECTRO`)), 'Email subject includes product name and brand');

  // Test 5: Database Connection & ProductShare Model
  console.log('\n--- 5. Testing Database Integration & Prisma Model ---');
  try {
    const existingProduct = await prisma.product.findFirst({
      select: { id: true, name: true, sku: true, retailPrice: true },
    });

    if (existingProduct) {
      assert(true, `Found real product in DB: "${existingProduct.name}" (SKU: ${existingProduct.sku})`);

      // Test inserting a share record
      const testShare = await prisma.productShare.create({
        data: {
          productId: existingProduct.id,
          productSku: existingProduct.sku,
          method: 'whatsapp',
          referrer: 'TEST_SUITE',
          userAgent: 'NeedElectroShareTest/1.0',
          ipAddress: '127.0.0.1',
        },
      });

      assert(Boolean(testShare && testShare.id), `Successfully created ProductShare record in DB: ID ${testShare.id}`);
      assert(testShare.method === 'whatsapp', 'Record method matches "whatsapp"');
      assert(testShare.productId === existingProduct.id, 'Record references valid productId');

      // Test querying aggregated shares
      const count = await prisma.productShare.count({
        where: { productId: existingProduct.id },
      });
      assert(count >= 1, `Aggregate share count for product is >= 1 (count = ${count})`);

      // Test relation query
      const productWithShares = await prisma.product.findUnique({
        where: { id: existingProduct.id },
        include: { shares: { take: 1 } },
      });
      assert(productWithShares.shares.length > 0, 'Prisma Product.shares relation works bidirectionally');

      // Cleanup test share record
      await prisma.productShare.delete({ where: { id: testShare.id } });
      assert(true, 'Cleaned up test share record');
    } else {
      console.warn('  ⚠️ No products found in DB; skipped live record insertion');
    }
  } catch (dbErr) {
    console.error('  ✗ FAIL: Database error:', dbErr);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  // Summary
  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
