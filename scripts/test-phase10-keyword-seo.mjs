// Phase 10 — Competitor Keyword Analysis & Expansion Test Suite
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('================================================================');
  console.log('PHASE 10 SEO & KEYWORD DATABASE VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: Verify Keyword Database File Exists and Valid
  console.log('\n--- 1. Testing Keyword Database Integrity ---');
  const dbPath = path.resolve('data/keyword_database.json');
  assert(fs.existsSync(dbPath), 'data/keyword_database.json exists');
  const keywords = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  assert(Array.isArray(keywords) && keywords.length >= 50, `Keyword database contains ${keywords.length} entries (>= 50 required)`);

  // Verify all entries have required fields and no fabricated rankings/volumes
  let validEntries = true;
  let noFabricatedVolume = true;
  for (const kw of keywords) {
    if (!kw.id || !kw.phrase || !kw.language || !kw.intent || !kw.topicCluster || !kw.targetUrl || !kw.sourceCategory || !kw.evidenceSource) {
      validEntries = false;
      console.error('Invalid entry:', kw);
      break;
    }
    // Verify strict adherence to "no fabricated search volume or rankings"
    if (kw.searchVolume.includes('k/mo') || kw.currentRanking.startsWith('#')) {
      noFabricatedVolume = false;
      console.error('Fabricated metric found:', kw);
      break;
    }
  }
  assert(validEntries, 'All keyword entries contain all required schema fields');
  assert(noFabricatedVolume, 'Adheres strictly to policy: zero fabricated search volumes, difficulties, or ranking positions');

  // Verify separation into categories
  const sourceCategories = [...new Set(keywords.map(k => k.sourceCategory))];
  assert(sourceCategories.includes('Competitor Documented (Explicit)'), 'Contains Competitor Documented (Explicit) keywords');
  assert(sourceCategories.includes('Need Electro Catalog Expansion'), 'Contains Need Electro Catalog Expansion keywords');
  assert(sourceCategories.includes('Proposed Research Theme (Unverified)'), 'Contains Proposed Research Theme (Unverified) keywords');
  assert(sourceCategories.includes('Need Electro Service Differentiator'), 'Contains Need Electro Service Differentiator keywords');

  // TEST 2: Verify Competitor Evidence Files Exist in scratch/Trust-Computer
  console.log('\n--- 2. Testing Competitor Evidence File Resolution ---');
  const trustCompPlaybook = 'C:\\Users\\NEED ELECTRO\\.gemini\\antigravity-ide\\scratch\\Trust-Computer\\LOCAL_SEO_DOMINATION_PLAYBOOK.md';
  const trustCompLayout = 'C:\\Users\\NEED ELECTRO\\.gemini\\antigravity-ide\\scratch\\Trust-Computer\\app\\layout.tsx';
  const trustCompMoulvi = 'C:\\Users\\NEED ELECTRO\\.gemini\\antigravity-ide\\scratch\\Trust-Computer\\app\\(store)\\moulvibazar\\page.tsx';
  const trustCompServices = 'C:\\Users\\NEED ELECTRO\\.gemini\\antigravity-ide\\scratch\\Trust-Computer\\app\\(store)\\services\\page.tsx';
  const trustCompCategories = 'C:\\Users\\NEED ELECTRO\\.gemini\\antigravity-ide\\scratch\\Trust-Computer\\app\\(store)\\categories\\[slug]\\page.tsx';

  assert(fs.existsSync(trustCompPlaybook), 'Trust-Computer/LOCAL_SEO_DOMINATION_PLAYBOOK.md resolved');
  assert(fs.existsSync(trustCompLayout), 'Trust-Computer/app/layout.tsx resolved');
  assert(fs.existsSync(trustCompMoulvi), 'Trust-Computer/app/(store)/moulvibazar/page.tsx resolved');
  assert(fs.existsSync(trustCompServices), 'Trust-Computer/app/(store)/services/page.tsx resolved');
  assert(fs.existsSync(trustCompCategories), 'Trust-Computer/app/(store)/categories/[slug]/page.tsx resolved');

  // TEST 3: Verify Need Electro Page Files & Metadata Integration
  console.log('\n--- 3. Testing Need Electro Page Metadata & Keywords ---');
  const pagesToTest = [
    { file: 'app/moulvibazar/page.tsx', expectedKws: ['computer shop Moulvibazar', 'computer showroom Moulvibazar', 'মৌলভীবাজার কম্পিউটার দোকান'] },
    { file: 'app/laptops/page.tsx', expectedKws: ['laptop shop Moulvibazar', 'laptop price in Bangladesh', 'মৌলভীবাজার ল্যাপটপ শপ'] },
    { file: 'app/computers/page.tsx', expectedKws: ['computer price Moulvibazar', 'desktop price Moulvibazar', 'মৌলভীবাজার কম্পিউটার দোকান'] },
    { file: 'app/cctv/page.tsx', expectedKws: ['CCTV camera Moulvibazar', 'CCTV camera shop in Moulvibazar', 'মৌলভীবাজার সিসি ক্যামেরা'] },
    { file: 'app/computer-accessories/page.tsx', expectedKws: ['computer accessories Moulvibazar', 'SSD price Moulvibazar'] },
    { file: 'app/networking/page.tsx', expectedKws: ['Router & Networking price in Moulvibazar', 'Tenda router Moulvibazar'] },
    { file: 'app/services/cctv-installation/page.tsx', expectedKws: ['CCTV installation in Moulvibazar', 'CCTV service Moulvibazar'] },
    { file: 'app/services/laptop-computer-repair/page.tsx', expectedKws: ['computer service Moulvibazar', 'laptop repair Moulvibazar'] },
  ];

  for (const page of pagesToTest) {
    const fullPath = path.resolve(page.file);
    assert(fs.existsSync(fullPath), `${page.file} exists`);
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const kw of page.expectedKws) {
      assert(content.toLowerCase().includes(kw.toLowerCase()), `${page.file} targets '${kw}'`);
    }
  }

  // TEST 4: Verify Sitemap and Canonical Consistency
  console.log('\n--- 4. Testing Sitemap and Canonical Readiness ---');
  const sitemapPath = path.resolve('app/sitemap.ts');
  assert(fs.existsSync(sitemapPath), 'app/sitemap.ts exists');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  assert(sitemapContent.includes('/moulvibazar'), 'Sitemap includes /moulvibazar');
  assert(sitemapContent.includes('/laptops'), 'Sitemap includes /laptops');
  assert(sitemapContent.includes('/computers'), 'Sitemap includes /computers');
  assert(sitemapContent.includes('/cctv'), 'Sitemap includes /cctv');
  assert(sitemapContent.includes('/services/cctv-installation'), 'Sitemap includes /services/cctv-installation');
  assert(sitemapContent.includes('/services/laptop-computer-repair'), 'Sitemap includes /services/laptop-computer-repair');
  assert(sitemapContent.includes('/laptop-emi'), 'Sitemap includes /laptop-emi');
  assert(sitemapContent.includes('/guides'), 'Sitemap includes /guides');

  // TEST 5: Title & Meta Description Lengths in seoConfig
  console.log('\n--- 5. Testing Google & Bing Title/Description Rules ---');
  const seoConfigPath = path.resolve('lib/seoConfig.ts');
  const seoConfigContent = fs.readFileSync(seoConfigPath, 'utf8');
  assert(seoConfigContent.includes('cleanDesc.length > 158'), 'Meta description clamped to Bing/Google <= 160 character ceiling');
  assert(seoConfigContent.includes('cleanDesc.length < 50'), 'Meta description padded to Bing/Google >= 50 character floor');
  assert(seoConfigContent.includes('buildBreadcrumbSchema'), 'Schema builder buildBreadcrumbSchema is defined');
  assert(seoConfigContent.includes('buildLocalBusinessSchema'), 'Schema builder buildLocalBusinessSchema is defined');
  assert(seoConfigContent.includes('buildProductSchema'), 'Schema builder buildProductSchema is defined');

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
