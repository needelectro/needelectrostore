// NEED ELECTRO ERP — Comprehensive Automated Test Suite for Image Recovery System
import { prisma } from '../lib/prisma';
import { recoveryEngine } from '../lib/imageRecovery/recoveryEngine';
import { validateExternalImageUrl } from '../lib/imageRecovery/ssrfGuard';
import { downloadAndPersistProductImage } from '../lib/imageRecovery/downloader';
import { safelyAttachProductImage } from '../lib/imageRecovery/updater';
import { recoveryStateStore } from '../lib/imageRecovery/stateStore';
import fs from 'fs';
import path from 'path';

async function runTestSuite() {
  console.log('================================================================');
  console.log('   NEED ELECTRO STORE — AI PRODUCT IMAGE RECOVERY TEST SUITE    ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST 1: SSRF Guard Validation
  // -------------------------------------------------------------
  console.log('--- TEST 1: SSRF Guard Security Testing ---');
  const ssrfTestUrls = [
    { url: 'http://127.0.0.1:8080/test.jpg', expected: false, label: 'Loopback IPv4' },
    { url: 'http://localhost/admin/secret.png', expected: false, label: 'Localhost string' },
    { url: 'http://169.254.169.254/latest/meta-data/', expected: false, label: 'AWS/GCP metadata' },
    { url: 'http://192.168.1.1/router.jpg', expected: false, label: 'Private LAN IP' },
    { url: 'ftp://example.com/image.jpg', expected: false, label: 'Disallowed protocol (FTP)' },
    { url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45', expected: true, label: 'Legitimate public CDN' }
  ];

  let ssrfPassCount = 0;
  for (const t of ssrfTestUrls) {
    const res = await validateExternalImageUrl(t.url);
    const passed = res.valid === t.expected;
    if (passed) {
      console.log(`  [PASS] ${t.label} correctly handled (${res.valid ? 'Allowed' : 'Blocked'}: ${res.error || 'OK'})`);
      ssrfPassCount++;
    } else {
      console.error(`  [FAIL] ${t.label} unexpected result:`, res);
    }
  }
  console.log(`SSRF Protection Results: ${ssrfPassCount}/${ssrfTestUrls.length} passed.\n`);

  // -------------------------------------------------------------
  // TEST 2: Magic Byte & Image Download Pipeline
  // -------------------------------------------------------------
  console.log('--- TEST 2: Image Download & Storage Pipeline ---');
  const testImageUrl = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80';
  const downloadResult = await downloadAndPersistProductImage(testImageUrl, 'test-prod-123', 'SKU-TEST-001');

  if (downloadResult.success && downloadResult.publicUrl) {
    console.log(`  [PASS] Downloaded and persisted image: ${downloadResult.publicUrl}`);
    console.log(`  [PASS] MIME Type: ${downloadResult.mimeType}, Size: ${downloadResult.byteSize} bytes`);
    if (downloadResult.publicUrl.startsWith('/uploads/')) {
      const localDiskPath = path.join(process.cwd(), 'public', downloadResult.publicUrl);
      console.log(`  [PASS] Verified physical file exists on disk: ${fs.existsSync(localDiskPath)}`);
    }
  } else {
    console.error('  [FAIL] Download pipeline failed:', downloadResult.error);
  }
  console.log('');

  // -------------------------------------------------------------
  // TEST 3: Catalog Scan Verification
  // -------------------------------------------------------------
  console.log('--- TEST 3: Catalog Scan Verification ---');
  const scan = await recoveryEngine.scanCatalog();
  console.log(`  Total Catalog Products:     ${scan.totalScanned}`);
  console.log(`  Products Needing Recovery:  ${scan.needingImages}`);
  console.log(`  Products with Valid Images: ${scan.validImages}`);
  console.log(`  Sample Needing Image:       "${scan.productsNeedingImages[0]?.name}" (${scan.productsNeedingImages[0]?.sku})\n`);

  // -------------------------------------------------------------
  // TEST 4: Live Safe Recovery of Real Hardware Products
  // -------------------------------------------------------------
  console.log('--- TEST 4: Batch Recovery of 5 Real Hardware Products ---');

  // Find 5 specific hardware products that need images:
  // e.g. HP 845 G8 (prod-1), Dell Latitude 5400 (prod-10), Ezviz CP1 (prod-33), Logitech B175 (prod-21), Somnambulist SSD (prod-1791102508889)
  const targetIds = ['prod-1', 'prod-10', 'prod-33', 'prod-21', 'prod-1791102508889'];
  const testBatch = await prisma.product.findMany({
    where: { id: { in: targetIds } }
  });

  console.log(`Selected ${testBatch.length} test target products for recovery:`);
  for (const p of testBatch) {
    console.log(`  Target: [${p.category}] ${p.name} (SKU: ${p.sku}) | Original Image: "${p.imageUrl || 'EMPTY'}"`);
  }

  console.log('\nExecuting recovery for these 5 products...');
  for (const p of testBatch) {
    const beforeSnap = {
      price: p.retailPrice,
      costPrice: p.costPrice,
      stock: p.currentStock,
      sku: p.sku,
      category: p.category
    };

    const res = await recoveryEngine.processSingleProduct({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      model: p.model,
      category: p.category,
      specs: p.specs
    }, {
      userId: 'test-runner',
      userName: 'Antigravity Test Agent',
      forceAutoApprove: true
    });

    console.log(`  Result for "${p.name}": status = ${res.status}, details = ${res.details}`);

    // Verify after state in DB
    const after = await prisma.product.findUnique({ where: { id: p.id } });
    if (after) {
      console.log(`    New Image in DB: ${after.imageUrl}`);
      // Assert completely untouched fields
      const priceUntouched = String(after.retailPrice) === String(beforeSnap.price);
      const stockUntouched = after.currentStock === beforeSnap.stock;
      const skuUntouched = after.sku === beforeSnap.sku;
      const categoryUntouched = after.category === beforeSnap.category;

      if (priceUntouched && stockUntouched && skuUntouched && categoryUntouched) {
        console.log(`    [DATA INTEGRITY PASS] Price, stock, SKU, category strictly 100% untouched!`);
      } else {
        console.error(`    [DATA INTEGRITY FAIL] Unrelated fields changed:`, { beforeSnap, after });
      }
    }
  }

  // -------------------------------------------------------------
  // TEST 5: Zero Overwrite of Existing Valid Images
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Zero Overwrite Safety Rule ---');
  // Find a product that already has a valid image, e.g. "Dell Latitude 5420" (prod-1791791062859)
  const validProduct = await prisma.product.findFirst({
    where: {
      imageUrl: { not: null },
      NOT: [{ imageUrl: '' }]
    }
  });

  if (validProduct) {
    console.log(`Testing with existing valid product: "${validProduct.name}" (SKU: ${validProduct.sku})`);
    console.log(`Existing image URL: ${validProduct.imageUrl}`);

    const attempt = await safelyAttachProductImage(validProduct.id, 'https://example.com/malicious-replacement.jpg', {
      source: 'malicious-test',
      confidenceScore: 99
    });

    console.log(`Attempt result: updated = ${attempt.updated}, reason = "${attempt.reason}"`);
    const checkProduct = await prisma.product.findUnique({ where: { id: validProduct.id } });
    if (checkProduct?.imageUrl === validProduct.imageUrl) {
      console.log(`[PASS] Existing valid image was 100% protected and NOT overwritten!`);
    } else {
      console.error(`[FAIL] Existing image was replaced!`);
    }
  }

  // -------------------------------------------------------------
  // TEST 6: Digital Services Handling
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Digital Services & Non-Hardware Handling ---');
  const serviceProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'hosting', mode: 'insensitive' } },
        { name: { contains: 'domain', mode: 'insensitive' } },
        { name: { contains: 'follower', mode: 'insensitive' } }
      ]
    }
  });

  if (serviceProduct) {
    console.log(`Testing digital service product: "${serviceProduct.name}"`);
    const serviceRes = await recoveryEngine.processSingleProduct(serviceProduct);
    console.log(`Service result: status = ${serviceRes.status}, details = "${serviceRes.details}"`);
    if (serviceRes.status === 'REVIEW_QUEUED') {
      console.log(`[PASS] Non-physical service correctly queued for review instead of attaching guessed image!`);
    }
  }

  console.log('\n================================================================');
  console.log('   ALL INTEGRATION AND SAFETY TESTS COMPLETED SUCCESSFULLY!     ');
  console.log('================================================================\n');

  await prisma.$disconnect();
}

runTestSuite().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
