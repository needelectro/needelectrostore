/**
 * Offline SEO Regression Suite for NEED ELECTRO Store
 * Verifies canonical host, JSON-LD @graph deduplication, NAP accuracy,
 * OG showcase banner asset integrity, robots/sitemap hygiene, and zero stale copy.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const ts = require('typescript');

const ROOT = process.cwd();

function loadTsModule(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const src = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const mod = { exports: {} };
  const fakeRequire = (id) => {
    if (id.startsWith('@/')) {
      const targetRel = id.slice(2);
      const candidates = [`${targetRel}.ts`, `${targetRel}.tsx`, targetRel];
      for (const c of candidates) {
        if (fs.existsSync(path.join(ROOT, c))) {
          return loadTsModule(c);
        }
      }
    }
    return require(id);
  };

  const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', transpiled);
  fn(mod.exports, fakeRequire, mod, fullPath, path.dirname(fullPath));
  return mod.exports;
}

function collectFiles(relDir, exts = ['.ts', '.tsx']) {
  const results = [];
  const start = path.join(ROOT, relDir);
  if (!fs.existsSync(start)) return results;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (exts.some((ext) => entry.name.endsWith(ext))) {
        results.push({
          rel: path.relative(ROOT, full).replace(/\\/g, '/'),
          content: fs.readFileSync(full, 'utf8'),
        });
      }
    }
  }
  walk(start);
  return results;
}

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      throw new Error(`Sync check expected for ${name}`);
    }
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('\n=== NEED ELECTRO SEO REGRESSION SUITE ===\n');

  const seoConfig = loadTsModule('lib/seoConfig.ts');
  const robotsMod = loadTsModule('app/robots.ts');
  const sitemapSrc = fs.readFileSync(path.join(ROOT, 'app/sitemap.ts'), 'utf8');
  const layoutSrc = fs.readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8');
  const middlewareSrc = fs.readFileSync(path.join(ROOT, 'middleware.ts'), 'utf8');
  const moulvibazarSrc = fs.readFileSync(path.join(ROOT, 'app/moulvibazar/page.tsx'), 'utf8');

  // 1. OG Store Banner asset checks
  await checkAsync('public/og-store-banner.jpg exists, is 1200x630 JPEG, and non-transparent', async () => {
    const bannerPath = path.join(ROOT, 'public/og-store-banner.jpg');
    assert.equal(fs.existsSync(bannerPath), true, 'Missing public/og-store-banner.jpg');
    const stat = fs.statSync(bannerPath);
    assert.ok(stat.size > 15000, `Banner file too small (${stat.size} bytes)`);
    const meta = await sharp(bannerPath).metadata();
    assert.equal(meta.format, 'jpeg', `Expected jpeg, got ${meta.format}`);
    assert.equal(meta.width, 1200, `Expected width 1200, got ${meta.width}`);
    assert.equal(meta.height, 630, `Expected height 630, got ${meta.height}`);
    assert.equal(meta.hasAlpha, false, 'OG banner should not be transparent');
  });

  // 2. Canonical host & verified NAP
  check('Canonical host is consistently https://www.needelectro.store without trailing slash', () => {
    assert.equal(seoConfig.BUSINESS_INFO.domain, 'https://www.needelectro.store');
    assert.equal(seoConfig.getCanonicalUrl('/'), 'https://www.needelectro.store');
    assert.equal(seoConfig.getCanonicalUrl('/moulvibazar'), 'https://www.needelectro.store/moulvibazar');
    assert.ok(sitemapSrc.includes('BUSINESS_INFO.domain'), 'sitemap.ts should use BUSINESS_INFO.domain');
  });

  check('Verified Moulvibazar NAP matches Central Road, NEED ELECTRO Building and Sat-Thu 09:30-21:30', () => {
    assert.equal(seoConfig.BUSINESS_INFO.name, 'NEED ELECTRO');
    assert.equal(seoConfig.BUSINESS_INFO.phoneClean, '+8801733983752');
    assert.equal(seoConfig.BUSINESS_INFO.email, 'needelectro23@gmail.com');
    assert.match(seoConfig.BUSINESS_INFO.address.streetAddress, /Central Road,\s*NEED ELECTRO Building/i);
    assert.equal(seoConfig.BUSINESS_INFO.address.postalCode, '3200');
    assert.deepEqual(seoConfig.BUSINESS_INFO.openingHours.days, [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
    ]);
    assert.equal(seoConfig.BUSINESS_INFO.openingHours.opens, '09:30');
    assert.equal(seoConfig.BUSINESS_INFO.openingHours.closes, '21:30');
    assert.equal(seoConfig.BUSINESS_INFO.openingHours.days.includes('Friday'), false, 'Friday must remain Closed');
  });

  // 3. Global JSON-LD @graph uniqueness & completeness
  check('buildGlobalSiteGraphSchema outputs single @graph with 1 Organization, 1 ComputerStore, 1 WebSite', () => {
    const graphDoc = seoConfig.buildGlobalSiteGraphSchema();
    assert.equal(graphDoc['@context'], 'https://schema.org');
    assert.ok(Array.isArray(graphDoc['@graph']), 'Expected @graph array');

    const orgs = graphDoc['@graph'].filter((n) => n['@type'] === 'Organization');
    const stores = graphDoc['@graph'].filter((n) => n['@type'] === 'ComputerStore');
    const sites = graphDoc['@graph'].filter((n) => n['@type'] === 'WebSite');

    assert.equal(orgs.length, 1, `Expected 1 Organization, found ${orgs.length}`);
    assert.equal(stores.length, 1, `Expected 1 ComputerStore, found ${stores.length}`);
    assert.equal(sites.length, 1, `Expected 1 WebSite, found ${sites.length}`);

    assert.equal(orgs[0]['@id'], 'https://www.needelectro.store/#organization');
    assert.equal(stores[0]['@id'], 'https://www.needelectro.store/#store');
    assert.equal(sites[0]['@id'], 'https://www.needelectro.store/#website');

    // SearchAction target
    assert.equal(
      sites[0].potentialAction.target.urlTemplate,
      'https://www.needelectro.store/shop?q={search_term_string}'
    );

    // ComputerStore image uses og-store-banner.jpg, verified address, areaServed (all 7 upazilas)
    const storeImages = Array.isArray(stores[0].image) ? stores[0].image : [stores[0].image];
    assert.ok(storeImages.includes('https://www.needelectro.store/og-store-banner.jpg'));
    assert.equal(stores[0].telephone, '+8801733983752');
    assert.equal(stores[0].address.streetAddress, 'Central Road, NEED ELECTRO Building');
    const areas = (stores[0].areaServed || []).map((a) => a.name);
    for (const upazila of ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura', 'Rajnagar', 'Kamalganj', 'Juri', 'Barlekha']) {
      assert.ok(areas.includes(upazila), `Missing Moulvibazar upazila in areaServed: ${upazila}`);
    }

    // Geo & hasMap must NOT be emitted with unverified coordinates unless env explicitly configures them
    if (!process.env.NEXT_PUBLIC_STORE_LAT && !process.env.NEXT_PUBLIC_STORE_LNG) {
      assert.equal(stores[0].geo, undefined, 'Unverified geo coordinates must not be emitted');
    }
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL) {
      assert.equal(stores[0].hasMap, undefined, 'Unverified hasMap link must not be emitted');
    }
  });

  // 4. Metadata & keyword deduplication & OG image fallback
  check('generateSeoMetadata deduplicates keywords and uses /og-store-banner.jpg by default', () => {
    const meta = seoConfig.generateSeoMetadata({
      title: 'Computer & Laptop Shop in Moulvibazar | NEED ELECTRO',
      description:
        'Trusted computer & laptop shop at Central Road, Moulvibazar. Genuine HP, Dell & Lenovo laptops, desktop PCs & accessories with warranty & EMI.',
      path: '/',
      keywords: [
        'Computer shop in Moulvibazar',
        'computer shop in moulvibazar',
        'Laptop shop in Moulvibazar',
        'Desktop PC Moulvibazar',
      ],
    });
    assert.equal(meta.alternates.canonical, 'https://www.needelectro.store');
    assert.equal(meta.openGraph.images[0].url, 'https://www.needelectro.store/og-store-banner.jpg');
    assert.equal(meta.twitter.images[0], 'https://www.needelectro.store/og-store-banner.jpg');
    assert.equal(meta.keywords.length, 3, `Expected case-insensitive deduplicated keywords of length 3, got ${meta.keywords.length}`);
  });

  check('resolveCleanImageUrl strips encrypted-tbn0 hotlinks and logo-dark-transparent.png', () => {
    assert.equal(
      seoConfig.resolveCleanImageUrl('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTest'),
      'https://www.needelectro.store/og-store-banner.jpg'
    );
    assert.equal(
      seoConfig.resolveCleanImageUrl('/logo-dark-transparent.png'),
      'https://www.needelectro.store/og-store-banner.jpg'
    );
    assert.equal(
      seoConfig.resolveCleanImageUrl('/uploads/products/catalog/prod-6815.webp'),
      'https://www.needelectro.store/uploads/products/catalog/prod-6815.webp'
    );
  });

  // 5. Layout, Breadcrumbs, Local pages & Robots structural invariants
  check('app/layout.tsx emits single buildGlobalSiteGraphSchema and has no root canonical leak', () => {
    assert.ok(layoutSrc.includes('buildGlobalSiteGraphSchema()'), 'Root layout must emit buildGlobalSiteGraphSchema()');
    assert.equal(layoutSrc.includes("canonical: '/'"), false, 'Root layout must not hardcode alternates.canonical');
    assert.equal(layoutSrc.includes('logo-dark-transparent.png'), false, 'Root layout must not reference logo-dark-transparent.png');
  });

  check('app/robots.ts allows store pages & sitemap and blocks /admin and /api', () => {
    const robotsConfig = robotsMod.default();
    const wildcard = robotsConfig.rules.find((r) => r.userAgent === '*');
    assert.ok(wildcard, 'Missing wildcard userAgent rule');
    assert.ok(wildcard.allow.includes('/shop'));
    assert.ok(wildcard.allow.includes('/moulvibazar'));
    assert.ok(wildcard.disallow.includes('/admin'));
    assert.ok(wildcard.disallow.includes('/admin/*'));
    assert.ok(wildcard.disallow.includes('/api'));
    assert.ok(wildcard.disallow.includes('/api/*'));
    assert.equal(robotsConfig.sitemap, 'https://www.needelectro.store/sitemap.xml');
  });

  check('No route renders both <Breadcrumb /> and manual buildBreadcrumbSchema', () => {
    const appFiles = collectFiles('app');
    const offenders = appFiles
      .filter((f) => f.content.includes('buildBreadcrumbSchema'))
      .map((f) => f.rel);
    assert.deepEqual(offenders, [], `Pages duplicating BreadcrumbList schema: ${offenders.join(', ')}`);
  });

  check('No route re-emits duplicate LocalBusiness, Organization, or inline OnlineStore schema', () => {
    const appFiles = collectFiles('app');
    const offenders = appFiles
      .filter(
        (f) =>
          f.content.includes('buildLocalBusinessSchema') ||
          f.content.includes('buildOrganizationSchema') ||
          f.content.includes("'@type': 'OnlineStore'")
      )
      .map((f) => f.rel);
    assert.deepEqual(offenders, [], `Pages duplicating business/org schema: ${offenders.join(', ')}`);
  });

  check('Public storefront & SEO content contains zero stale Kusumbag showroom / Hub labels', () => {
    const targets = [
      ...collectFiles('app').filter((f) => !f.rel.startsWith('app/api/') && !f.rel.startsWith('app/admin') && !f.rel.startsWith('app/customer/')),
      ...collectFiles('src/components/customer'),
      { rel: 'lib/seoConfig.ts', content: fs.readFileSync(path.join(ROOT, 'lib/seoConfig.ts'), 'utf8') },
      { rel: 'lib/guidesData.ts', content: fs.readFileSync(path.join(ROOT, 'lib/guidesData.ts'), 'utf8') },
      { rel: 'src/lib/i18n.ts', content: fs.readFileSync(path.join(ROOT, 'src/lib/i18n.ts'), 'utf8') },
    ];

    const forbidden = [/Shop No:\s*5/i, /Shop#5/i, /MR Plaza/i, /Hub:\s*Moulvibazar/i, /Central Tech Hub/i];
    const hits = [];
    for (const file of targets) {
      for (const re of forbidden) {
        if (re.test(file.content)) {
          hits.push(`${file.rel} matched ${re}`);
        }
      }
    }
    assert.deepEqual(hits, [], `Stale address/hub strings found:\n${hits.join('\n')}`);
  });

  check('Moulvibazar local page has FAQPage schema and keyword redirects exist in middleware', () => {
    assert.ok(moulvibazarSrc.includes('buildFaqSchema'), '/moulvibazar should emit FAQPage JSON-LD');
    for (const alias of [
      '/computer-shop-moulvibazar',
      '/laptop-shop-moulvibazar',
      '/computer-shop-in-moulvibazar',
      '/laptop-shop-in-moulvibazar',
    ]) {
      assert.ok(middlewareSrc.includes(alias), `Missing 301 local SEO redirect in middleware.ts for ${alias}`);
    }
  });

  check('getCategoryUrlPath resolves all store categories to real existing App Router pages', () => {
    const knownRoutes = new Set(
      collectFiles('app', ['page.tsx']).map((f) => {
        const dir = f.rel.replace(/^app\/?/, '').replace(/\/?page\.tsx$/, '');
        return dir ? `/${dir}` : '/';
      })
    );
    const sampleCategories = [
      'Laptop',
      'Laptop Accessories',
      'Desktop',
      'Monitor',
      'Computers',
      'Computer Accessories',
      'Accessories',
      'Cables',
      'Chargers',
      'Networking',
      'Router',
      'CCTV',
      'Electrical Products',
      'Smart Devices',
    ];
    for (const cat of sampleCategories) {
      const target = seoConfig.getCategoryUrlPath(cat);
      assert.ok(knownRoutes.has(target), `Category "${cat}" resolved to non-existent route "${target}"`);
    }
  });

  check('Organization node links founder Person & needelectro.com; Product schema uses specs + #organization seller', () => {
    const graphNodes = seoConfig.buildGlobalSiteGraphSchema()['@graph'];
    const org = graphNodes.find((n) => n['@type'] === 'Organization');
    assert.equal(org.founder['@type'], 'Person');
    assert.equal(org.founder.name, 'Amdadur Rahman');
    assert.ok(org.sameAs.includes('https://www.needelectro.com'), 'Organization sameAs should include https://www.needelectro.com');

    const prod = seoConfig.buildProductSchema({
      name: 'HP EliteBook 840 G8',
      sku: 'SKU-TEST-1',
      category: 'Laptop',
      brand: 'HP',
      retailPrice: 42000,
      currentStock: 3,
      specs: { processor: 'Core i5 11th Gen', ram: '16GB DDR4' },
    });
    assert.equal(prod.offers.seller['@id'], 'https://www.needelectro.store/#organization');
    assert.ok(Array.isArray(prod.additionalProperty) && prod.additionalProperty.length === 2, 'Product schema should map structured specs');
  });

  check('Private/transactional routes have noindex layouts and API endpoints enforce auth/PII protection', () => {
    for (const route of ['admin', 'cart', 'checkout', 'order-confirmation', 'offline', 'track-order', 'customer']) {
      const layoutPath = path.join(ROOT, 'app', route, 'layout.tsx');
      assert.equal(fs.existsSync(layoutPath), true, `Missing noindex layout app/${route}/layout.tsx`);
      const layoutTxt = fs.readFileSync(layoutPath, 'utf8');
      assert.ok(layoutTxt.includes('buildNoIndexMetadata'), `app/${route}/layout.tsx must call buildNoIndexMetadata`);
    }
    const indexNowSrc = fs.readFileSync(path.join(ROOT, 'app/api/indexnow/route.ts'), 'utf8');
    assert.ok(indexNowSrc.includes('authenticateRequest'), 'POST /api/indexnow must authenticate staff callers');
    const bootstrapSrc = fs.readFileSync(path.join(ROOT, 'app/api/bootstrap/route.ts'), 'utf8');
    assert.ok(!bootstrapSrc.slice(0, bootstrapSrc.indexOf('authenticated: false')).includes('wholesalePrice'), 'Unauthenticated bootstrap must not expose wholesalePrice');
    const trackSrc = fs.readFileSync(path.join(ROOT, 'app/api/orders/track/route.ts'), 'utf8');
    assert.ok(trackSrc.includes('maskPhone') && !trackSrc.includes('contains:'), 'Order tracking API must avoid substring phone enumeration and mask PII');
    assert.equal(fs.existsSync(path.join(ROOT, 'public/llms.txt')), true, 'Missing public/llms.txt AIO guide');
    assert.equal(fs.existsSync(path.join(ROOT, 'public/logo-tool.html')), false, 'Unused public/logo-tool.html should remain removed');
  });

  console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
