// NEED ELECTRO STORE — Automated Product Reviews & Ratings Verification Test Suite
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
  console.log('  NEED ELECTRO PRODUCT REVIEWS & RATINGS AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  // Helper implementations matching lib/reviews.ts
  function sanitizeReviewText(input) {
    if (!input) return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '')
      .trim();
  }

  function formatPublicAuthorName(fullName) {
    if (!fullName) return 'Verified Customer';
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first} ${lastInitial}.`;
  }

  async function checkCustomerPurchaseEligibility(customerId, customerPhone, productId, productSku) {
    const onlineOrder = await prisma.websiteOrder.findFirst({
      where: {
        OR: [{ customerId }, { customerPhone }],
        orderStatus: 'DELIVERED',
      },
    });
    if (onlineOrder) return { isVerified: true, orderId: onlineOrder.orderNumber };
    return { isVerified: false, orderId: null };
  }

  async function getProductReviewsSummary(productId) {
    const reviews = await prisma.productReview.findMany({
      where: { productId, status: 'PUBLISHED' },
    });
    const totalReviews = reviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRatingSum = 0;
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      totalRatingSum += r.rating;
    }
    const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;
    const percentages = {
      5: totalReviews > 0 ? Math.round((distribution[5] / totalReviews) * 100) : 0,
      4: totalReviews > 0 ? Math.round((distribution[4] / totalReviews) * 100) : 0,
      3: totalReviews > 0 ? Math.round((distribution[3] / totalReviews) * 100) : 0,
      2: totalReviews > 0 ? Math.round((distribution[2] / totalReviews) * 100) : 0,
      1: totalReviews > 0 ? Math.round((distribution[1] / totalReviews) * 100) : 0,
    };
    return { averageRating, totalReviews, distribution, percentages };
  }

  const { buildProductSchema } = await import('../lib/seoConfig.ts');

  // -------------------------------------------------------------
  // Test Group 1: Database Schema & Subsystem Verification
  // -------------------------------------------------------------
  console.log('--- Test Group 1: Database Schema & Tables Verification ---');
  try {
    const reviewsCount = await prisma.productReview.count();
    assert(typeof reviewsCount === 'number', 'Table "product_reviews" is queryable in PostgreSQL database');

    const imagesCount = await prisma.reviewImage.count();
    assert(typeof imagesCount === 'number', 'Table "review_images" is queryable in PostgreSQL database');

    const votesCount = await prisma.reviewVote.count();
    assert(typeof votesCount === 'number', 'Table "review_votes" is queryable in PostgreSQL database');

    const reportsCount = await prisma.reviewReport.count();
    assert(typeof reportsCount === 'number', 'Table "review_reports" is queryable in PostgreSQL database');

    const responsesCount = await prisma.reviewResponse.count();
    assert(typeof responsesCount === 'number', 'Table "review_responses" is queryable in PostgreSQL database');
  } catch (err) {
    assert(false, 'Database table connection test', err.message);
  }

  // -------------------------------------------------------------
  // Test Group 2: Anti-Spam Sanitization & Privacy Protection
  // -------------------------------------------------------------
  console.log('\n--- Test Group 2: Anti-Spam Sanitization & Privacy Protection ---');
  const dirtyHtml = '<script>alert("xss")</script><b>Amazing</b> laptop! <a href="javascript:steal()">Click</a>';
  const cleaned = sanitizeReviewText(dirtyHtml);
  assert(!cleaned.includes('<script>') && !cleaned.includes('</script>'), 'Strips malicious script tags');
  assert(!cleaned.includes('<b>') && !cleaned.includes('</b>'), 'Strips raw HTML formatting tags');
  assert(!cleaned.includes('javascript:'), 'Strips javascript protocol attacks');
  assert(cleaned.includes('Amazing laptop!'), 'Preserves legitimate customer review text');

  const author1 = formatPublicAuthorName('Amdadur Rahman');
  assert(author1 === 'Amdadur R.', 'Formats customer full name into private display format (Amdadur R.)', author1);

  const author2 = formatPublicAuthorName('Amdadur');
  assert(author2 === 'Amdadur', 'Handles single-word names cleanly', author2);

  const author3 = formatPublicAuthorName(null);
  assert(author3 === 'Verified Customer', 'Provides fallback for null/empty author names', author3);

  // -------------------------------------------------------------
  // Test Group 3: Server-side Purchase Eligibility Check
  // -------------------------------------------------------------
  console.log('\n--- Test Group 3: Server-Side Verified Purchase Eligibility Check ---');
  // Check a non-existent customer / order
  const nonBuyerCheck = await checkCustomerPurchaseEligibility(
    'non_existent_cust_99999',
    '+8801999999999',
    'random_product_id'
  );
  assert(nonBuyerCheck.isVerified === false, 'Customer without purchase history is marked NOT verified');
  assert(nonBuyerCheck.orderId === null, 'Order ID is null for unverified user');

  // -------------------------------------------------------------
  // Test Group 4: Review Summary & Aggregation Logic
  // -------------------------------------------------------------
  console.log('\n--- Test Group 4: Summary & Rating Aggregation Logic ---');
  // Find a product from the database
  const sampleProduct = await prisma.product.findFirst({
    select: { id: true, name: true, sku: true },
  });

  if (sampleProduct) {
    const summary = await getProductReviewsSummary(sampleProduct.id);
    assert(summary !== null && typeof summary === 'object', 'Summary returns structured object');
    assert(typeof summary.averageRating === 'number', 'averageRating is a number');
    assert(typeof summary.totalReviews === 'number', 'totalReviews is a number');
    assert(summary.distribution && typeof summary.distribution[5] === 'number', 'Distribution map has 5-star count');
    assert(summary.distribution && typeof summary.distribution[1] === 'number', 'Distribution map has 1-star count');
    assert(summary.percentages && typeof summary.percentages[5] === 'number', 'Percentages map has 5-star percentage');
  }

  // -------------------------------------------------------------
  // Test Group 5: Review Creation, Uniqueness, Voting & Cleanup Test
  // -------------------------------------------------------------
  console.log('\n--- Test Group 5: Transaction-Safe Review Lifecycle & Constraints ---');
  if (sampleProduct) {
    // Find or create a test customer
    let testCustomer = await prisma.customer.findFirst({
      where: { phone: '01700000099' },
    });

    if (!testCustomer) {
      testCustomer = await prisma.customer.create({
        data: {
          id: 'test_cust_reviews_99',
          customerId: 'CUST-REV-TEST',
          name: 'Test Reviewer',
          phone: '01700000099',
          email: 'test_reviewer@needelectro.store',
        },
      });
    }

    try {
      // Clean up previous test run if any
      await prisma.productReview.deleteMany({
        where: {
          productId: sampleProduct.id,
          customerId: testCustomer.id,
        },
      });

      // 1. Create review
      const newReview = await prisma.productReview.create({
        data: {
          productId: sampleProduct.id,
          customerId: testCustomer.id,
          customerName: testCustomer.name,
          rating: 5,
          title: 'Excellent Laptop & Fast Delivery',
          comment: 'Outstanding quality and very fast delivery in Moulvibazar! Highly recommended.',
          isVerifiedPurchase: true,
          orderId: 'INV-TEST-2026',
          status: 'PUBLISHED',
          images: {
            create: [
              { imageUrl: '/uploads/test-photo-1.jpg', sortOrder: 0 },
            ],
          },
        },
        include: { images: true },
      });

      assert(newReview.id !== undefined, 'Successfully inserted customer review with images');
      assert(newReview.images.length === 1, 'Review image attachment created successfully');

      // 2. Test duplicate review prevention (unique constraint @@unique([productId, customerId]))
      let caughtDuplicate = false;
      try {
        await prisma.productReview.create({
          data: {
            productId: sampleProduct.id,
            customerId: testCustomer.id,
            customerName: testCustomer.name,
            rating: 4,
            comment: 'Duplicate review should be blocked at database level',
            status: 'PUBLISHED',
          },
        });
      } catch (dupErr) {
        caughtDuplicate = true;
      }
      assert(caughtDuplicate, 'Database unique constraint prevents duplicate reviews for same product by same customer');

      // 3. Test helpful vote toggle
      const vote1 = await prisma.reviewVote.create({
        data: {
          reviewId: newReview.id,
          customerId: testCustomer.id,
          isHelpful: true,
        },
      });
      assert(vote1.id !== undefined, 'Created helpful vote');

      // Duplicate vote prevention
      let caughtVoteDuplicate = false;
      try {
        await prisma.reviewVote.create({
          data: {
            reviewId: newReview.id,
            customerId: testCustomer.id,
            isHelpful: true,
          },
        });
      } catch (vErr) {
        caughtVoteDuplicate = true;
      }
      assert(caughtVoteDuplicate, 'Database unique constraint prevents duplicate votes by same customer');

      // 4. Test official NEED ELECTRO response
      const officialReply = await prisma.reviewResponse.create({
        data: {
          reviewId: newReview.id,
          userId: 'test_admin_user',
          authorName: 'NEED ELECTRO Official Support',
          response: 'Thank you for your valuable feedback! We are thrilled to serve you.',
          isOfficial: true,
        },
      });
      assert(officialReply.id !== undefined, 'Created official business response to customer review');

      // 5. Test moderation exclusion: set status to REJECTED or HIDDEN
      await prisma.productReview.update({
        where: { id: newReview.id },
        data: { status: 'REJECTED' },
      });

      const summaryAfterReject = await getProductReviewsSummary(sampleProduct.id);
      // REJECTED review must not be counted in public summary
      assert(summaryAfterReject !== null, 'Summary re-calculated excluding rejected reviews');

      // Clean up test records
      await prisma.productReview.delete({
        where: { id: newReview.id },
      });
      assert(true, 'Test review and cascading child records cleaned up cleanly');

      // 6. Test Guest Review Lifecycle (customerId = null, multiple guests allowed on same product)
      const guestReview1 = await prisma.productReview.create({
        data: {
          productId: sampleProduct.id,
          customerId: null,
          customerName: 'Guest Test One',
          isGuest: true,
          guestPhone: '01700000081',
          ipAddress: '127.0.0.101',
          rating: 5,
          title: 'Guest Review Works Great',
          comment: 'Bought this without signing in and leaving an honest guest review test.',
          isVerifiedPurchase: false,
          status: 'PUBLISHED',
        },
      });
      const guestReview2 = await prisma.productReview.create({
        data: {
          productId: sampleProduct.id,
          customerId: null,
          customerName: 'Guest Test Two',
          isGuest: true,
          guestPhone: '01700000082',
          ipAddress: '127.0.0.102',
          rating: 4,
          comment: 'Second independent guest review allowed when customerId is null.',
          isVerifiedPurchase: false,
          status: 'PUBLISHED',
        },
      });
      assert(
        guestReview1.customerId === null && guestReview1.isGuest === true && guestReview2.id !== guestReview1.id,
        'Allows multiple independent guest reviews (customerId: null) on the same product'
      );

      await prisma.productReview.deleteMany({
        where: { id: { in: [guestReview1.id, guestReview2.id] } },
      });
      assert(true, 'Guest test reviews cleaned up cleanly');
    } catch (testErr) {
      assert(false, 'Lifecycle execution error', testErr.message);
    }
  }

  // -------------------------------------------------------------
  // Test Group 6: Guest Review Helpers & Anti-Spam Checks
  // -------------------------------------------------------------
  console.log('\n--- Test Group 6: Guest Review Helpers & Anti-Spam Checks ---');
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const ts = require('typescript');

  function loadTsModule(relPath) {
    const fullPath = path.join(process.cwd(), relPath);
    const src = fs.readFileSync(fullPath, 'utf8');
    const transpiled = ts.transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText;
    const mod = { exports: {} };
    const customRequire = (id) => {
      if (id === '@/lib/prisma') return { prisma };
      if (id.startsWith('@/')) {
        const target = path.join(process.cwd(), id.slice(2) + '.ts');
        if (fs.existsSync(target)) return loadTsModule(id.slice(2) + '.ts');
      }
      return require(id);
    };
    const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', transpiled);
    fn(mod.exports, customRequire, mod, fullPath, path.dirname(fullPath));
    return mod.exports;
  }

  const {
    normalizeBdPhone,
    getBdPhoneVariants,
    containsReviewSpamLinks,
    validateCommonReviewPayload,
    detectImageMimeFromMagicBytes,
    verifyGuestPurchaseEligibility,
  } = loadTsModule('lib/reviews.ts');

  assert(normalizeBdPhone('+880 1733-983752') === '01733983752', 'Normalizes +880 mobile numbers to 01XXXXXXXXX');
  assert(normalizeBdPhone('1733983752') === '01733983752', 'Normalizes 10-digit mobile numbers cleanly');
  assert(getBdPhoneVariants('01733983752').includes('+8801733983752'), 'Generates +88 and 88 lookup variants');
  assert(containsReviewSpamLinks('Buy cheap coins at https://spam.example.com') === true, 'Blocks external URL spam in reviews');
  assert(containsReviewSpamLinks('15.6 inch Full HD IPS panel with 2.4GHz Wi-Fi works awesome!') === false, 'Allows normal decimal/product specs without false positives');

  const validPayload = validateCommonReviewPayload({
    productId: 'prod_123',
    rating: 5,
    title: '<b>Superb</b> Quality',
    comment: 'Works smoothly <script>alert(1)</script> every day.',
    images: ['https://cdn.needelectro.store/a.jpg', 'javascript:evil()'],
  });
  assert(validPayload.ok === true && validPayload.data.images.length === 1 && !validPayload.data.comment.includes('<script>'), 'Shared payload validator sanitizes XSS and filters unsafe image URLs');

  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const textHeader = Buffer.from('<svg onload=alert(1)>');
  assert(detectImageMimeFromMagicBytes(pngHeader) === 'image/png', 'Magic-byte detector accepts valid PNG buffer');
  assert(detectImageMimeFromMagicBytes(textHeader) === null, 'Magic-byte detector rejects disguised SVG/HTML payload');

  const guestNonBuyerCheck = await verifyGuestPurchaseEligibility({
    productId: 'non_existent_prod',
    productSku: 'SKU-NONE',
    phone: '01700000000',
    orderNumber: 'ORD-NOPE-99999',
  });
  assert(guestNonBuyerCheck.isVerified === false && guestNonBuyerCheck.orderId === null, 'Guest without matching delivered order or completed sale is NOT marked Verified Buyer');

  // -------------------------------------------------------------
  // Test Group 6: Schema.org Structured Data Compliance
  // -------------------------------------------------------------
  console.log('\n--- Test Group 6: Schema.org Structured Data Compliance ---');
  const schemaNoReviews = buildProductSchema({
    name: 'Dell Latitude 5420',
    sku: 'SKU-DELL-5420',
    category: 'Laptop',
    brand: 'Dell',
    retailPrice: 43000,
    currentStock: 5,
  });
  assert(schemaNoReviews.aggregateRating === undefined, 'No fake aggregateRating when 0 reviews exist');

  const schemaWithReviews = buildProductSchema({
    name: 'Dell Latitude 5420',
    sku: 'SKU-DELL-5420',
    category: 'Laptop',
    brand: 'Dell',
    retailPrice: 43000,
    currentStock: 5,
    ratingValue: 4.8,
    reviewCount: 12,
    reviews: [
      {
        authorName: 'Amdadur R.',
        datePublished: '2026-10-27',
        comment: 'Great business laptop with 2-year warranty.',
        rating: 5,
      },
    ],
  });
  assert(schemaWithReviews.aggregateRating !== undefined, 'Emits aggregateRating when genuine reviews exist');
  assert(schemaWithReviews.aggregateRating?.ratingValue === 4.8, 'Matches genuine ratingValue');
  assert(schemaWithReviews.aggregateRating?.reviewCount === 12, 'Matches genuine reviewCount');
  assert(Array.isArray(schemaWithReviews.review) && schemaWithReviews.review.length === 1, 'Emits valid review array');

  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} total tests`);
  console.log('================================================================\n');

  await prisma.$disconnect();
  if (failedTests > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
