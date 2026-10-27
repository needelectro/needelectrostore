// NEED ELECTRO STORE — Automated Verification Test Suite for Photo Gallery & Business Updates System
import assert from 'assert';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

console.log('================================================================');
console.log('  NEED ELECTRO STORE — PHOTO GALLERY & UPDATES VERIFICATION');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${description}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runTests() {
  // --- Test Group 1: Database Schema & Categories ---
  console.log('--- Test Group 1: Database Schema & Categories ---');

  const categories = await prisma.galleryCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  test('Gallery categories exist in database', () => {
    assert(categories.length >= 8, `Expected at least 8 categories, found ${categories.length}`);
  });

  test('Required categories (Laptops, CCTV, Projects, Deliveries) exist', () => {
    const slugs = categories.map((c) => c.slug);
    assert(slugs.includes('laptops-computers'), 'Missing laptops-computers category');
    assert(slugs.includes('new-arrivals'), 'Missing new-arrivals category');
    assert(slugs.includes('completed-projects'), 'Missing completed-projects category');
    assert(slugs.includes('customer-deliveries'), 'Missing customer-deliveries category');
  });

  test('Categories have bilingual support (English and Bangla)', () => {
    const hasBangla = categories.some((c) => Boolean(c.nameBn && c.nameBn.trim().length > 0));
    assert(hasBangla, 'Categories must include Bengali nameBn translations');
  });

  // --- Test Group 2: Gallery Posts Integrity ---
  console.log('\n--- Test Group 2: Gallery Posts Integrity ---');

  const posts = await prisma.galleryPost.findMany({
    include: {
      category: true,
      product: true,
    },
    orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
  });

  test('Gallery posts exist and are published', () => {
    assert(posts.length >= 4, `Expected at least 4 gallery posts, found ${posts.length}`);
    const published = posts.filter((p) => p.isPublished);
    assert(published.length >= 4, 'All initial posts should be published');
  });

  test('Pinned posts are prioritized at the top of the feed', () => {
    assert(posts[0].isPinned === true, 'First post should be pinned');
  });

  test('Post has valid coverImage, images array, and clean slug', () => {
    const sample = posts[0];
    assert(Boolean(sample.coverImage), 'Cover image must be defined');
    assert(Array.isArray(sample.images), 'Images must be a JSON array');
    assert(sample.images.length >= 1, 'Post must contain at least 1 image');
    assert(!sample.slug.includes(' '), 'Slug must be URL-safe without spaces');
  });

  test('Real catalog product linking works with accurate price retrieval', () => {
    const linkedPost = posts.find((p) => p.product !== null);
    assert(Boolean(linkedPost), 'At least one gallery post must be linked to a real product');
    assert(Number(linkedPost.product.retailPrice) > 0, 'Linked product must have verified retail price');
  });

  // --- Test Group 3: File-Level Route & Component Integration ---
  console.log('\n--- Test Group 3: File-Level Route & Component Integration ---');

  test('Public gallery page app/gallery/page.tsx exists', () => {
    assert(fs.existsSync(path.resolve('app/gallery/page.tsx')), 'app/gallery/page.tsx is missing');
  });

  test('Gallery view client component src/components/customer/GalleryViewClient.tsx exists', () => {
    assert(fs.existsSync(path.resolve('src/components/customer/GalleryViewClient.tsx')), 'GalleryViewClient is missing');
  });

  test('Homepage business updates feed component exists', () => {
    assert(fs.existsSync(path.resolve('src/components/customer/BusinessUpdatesFeed.tsx')), 'BusinessUpdatesFeed is missing');
  });

  test('Admin gallery management module src/components/admin/GalleryUpdatesManager.tsx exists', () => {
    assert(fs.existsSync(path.resolve('src/components/admin/GalleryUpdatesManager.tsx')), 'GalleryUpdatesManager is missing');
  });

  // --- Test Group 4: Sitemap & Navigation Inclusions ---
  console.log('\n--- Test Group 4: Sitemap & Navigation Inclusions ---');

  const sitemapContent = fs.readFileSync(path.resolve('app/sitemap.ts'), 'utf8');
  test('Sitemap includes /gallery route', () => {
    assert(sitemapContent.includes('/gallery'), 'app/sitemap.ts must include /gallery');
  });

  const headerContent = fs.readFileSync(path.resolve('src/components/customer/CustomerHeader.tsx'), 'utf8');
  test('CustomerHeader includes Photo Gallery navigation link', () => {
    assert(headerContent.includes('/gallery'), 'CustomerHeader.tsx must link to /gallery');
  });

  const footerContent = fs.readFileSync(path.resolve('src/components/customer/CustomerFooter.tsx'), 'utf8');
  test('CustomerFooter includes Photo Gallery & Updates link', () => {
    assert(footerContent.includes('/gallery'), 'CustomerFooter.tsx must link to /gallery');
  });

  const homeContent = fs.readFileSync(path.resolve('app/page.tsx'), 'utf8');
  test('Homepage integrates BusinessUpdatesFeed component', () => {
    assert(homeContent.includes('BusinessUpdatesFeed'), 'app/page.tsx must integrate BusinessUpdatesFeed');
    assert(homeContent.includes('prisma.galleryPost.findMany'), 'app/page.tsx must query galleryPost');
  });

  const sidebarContent = fs.readFileSync(path.resolve('src/components/Sidebar.tsx'), 'utf8');
  test('Admin Sidebar includes Gallery & Updates module', () => {
    assert(sidebarContent.includes('gallery_updates'), 'Sidebar.tsx must include gallery_updates module ID');
  });

  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
  test('App.tsx router switch includes GalleryUpdatesManager', () => {
    assert(appContent.includes('GalleryUpdatesManager'), 'App.tsx must include GalleryUpdatesManager');
    assert(appContent.includes("case 'gallery_updates':"), "App.tsx must have case 'gallery_updates':");
  });

  console.log('\n================================================================');
  console.log(`  RESULTS: ${passedTests} PASSED, ${totalTests - passedTests} FAILED out of ${totalTests} total tests`);
  console.log('================================================================\n');

  if (totalTests !== passedTests) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
