// NEED ELECTRO ERP — Master Products & Inventory Import Engine
// Imports 52 products provided by user into PostgreSQL and SQLite

import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

const rawData = [
  { no: 1, name: 'HP G8', model: 'HP 845 G8 16/512', cpu: 'Ryzen 5 pro 5560U', ram: '16 gb', ssd: '512 gb', warranty: '1 year', stock: 0, retailPrice: 43000, wholesalePrice: 38000, buyPrice: 37000, source: '' },
  { no: 2, name: 'HP G8', model: 'HP 845 G8 16/256', cpu: 'Ryzen 5 pro 5650u', ram: '16gb', ssd: '256gb', warranty: '1 year', stock: 0, retailPrice: 38000, wholesalePrice: 36000, buyPrice: 35000, source: '' },
  { no: 3, name: 'HP G8', model: 'HP 845 G8 8/256', cpu: 'Ryzen 5 pro 5650u', ram: '8gb', ssd: '256gb', warranty: '1 year', stock: 0, retailPrice: 35000, wholesalePrice: 32500, buyPrice: 31500, source: '' },
  { no: 4, name: 'HP G8', model: 'HP 845 G8 8/512', cpu: 'Ryzen 5 pro 5560U', ram: '16 gb', ssd: '512 gb', warranty: '1 year', stock: 0, retailPrice: 37000, wholesalePrice: 35000, buyPrice: 34000, source: '' },
  { no: 5, name: 'HP G7', model: 'HP 840 G7 16/512', cpu: 'Intel i5 10 generation', ram: '16 gb', ssd: '512 gb', warranty: '1 year', stock: 0, retailPrice: 34000, wholesalePrice: 31000, buyPrice: 35000, source: '' },
  { no: 6, name: 'HP G7', model: 'HP 845 G7 8/256', cpu: 'Ryzen 5 pro 4560U', ram: '8 gb', ssd: '256 gb', warranty: '1 year', stock: 0, retailPrice: 33000, wholesalePrice: 30000, buyPrice: 29000, source: '' },
  { no: 7, name: 'HP G6', model: 'HP 840 g6 8/256', cpu: 'intel i5 8th gen', ram: '8gb', ssd: '256gb', warranty: '1 year', stock: 0, retailPrice: 30000, wholesalePrice: 28000, buyPrice: 27000, source: '' },
  { no: 8, name: 'HP G5', model: 'HP 640 g5 8/256', cpu: 'intel i5 8th gen', ram: '8gb', ssd: '256gb', warranty: '1 year', stock: 1, retailPrice: 30000, wholesalePrice: 29000, buyPrice: 28000, source: 'Aroz Technology' },
  { no: 9, name: 'HP G3', model: 'HP 840 G3 8/256', cpu: 'Intel i5 7 generation', ram: '8 gb', ssd: '256 gb', warranty: '1 year', stock: 0, retailPrice: 32000, wholesalePrice: 28200, buyPrice: 20000, source: '' },
  { no: 10, name: 'Dell Laptop', model: 'Dell Latitude 5400', cpu: 'intel i5 8gen', ram: '8gb', ssd: '256gb', warranty: '1 year', stock: 0, retailPrice: 21000, wholesalePrice: 19000, buyPrice: 30000, source: '' },
  { no: 11, name: 'Dell Laptop', model: 'Dell latitude 5320', cpu: 'intel i7 11th gen', ram: '16gb', ssd: '512gb', warranty: '1 year', stock: 0, retailPrice: 47000, wholesalePrice: 45000, buyPrice: 43000, source: '' },
  { no: 12, name: 'Fujitso', model: 'Fujitso', cpu: 'intel celeron 10 gen', ram: '4 gb', ssd: '128 gb', warranty: '1 year', stock: 0, retailPrice: 21000, wholesalePrice: 18000, buyPrice: 17000, source: '' },
  { no: 13, name: 'HP G9', model: 'HP 845 G9 16/512', cpu: 'Ryzen 5 pro 6560U', ram: '16 gb', ssd: '512 gb', warranty: '1 year', stock: 0, retailPrice: 52000, wholesalePrice: 50000, buyPrice: 48000, source: '' },
  { no: 14, name: 'HP 430 G8', model: 'HP 430 G8 8/256', cpu: 'intel i5 11gen', ram: '8gb', ssd: '256gb', warranty: '1 year', stock: 0, retailPrice: 35000, wholesalePrice: 34000, buyPrice: 33000, source: '' },
  { no: 15, name: 'HP 635 G7', model: 'HP 635 G7 8/256', cpu: 'ryzen 5 4500u', ram: '8gb', ssd: '256gb', warranty: '1 year', stock: 0, retailPrice: 31000, wholesalePrice: 29000, buyPrice: 27000, source: '' },
  { no: 16, name: 'Microsft Surface', model: 'Microsoft Surface Laptop 1', cpu: 'Intel i5 7 generation', ram: '8 gb', ssd: '256 gb', warranty: '1 year', stock: 1, retailPrice: 35000, wholesalePrice: 29000, buyPrice: 28000, source: 'Muscom' },
  { no: 17, name: 'Walton', model: 'Walton Prelude N40 pro', cpu: 'intel pentium 10 gen', ram: '8 gb', ssd: '256 gb', warranty: '1 year', stock: 1, retailPrice: 24000, wholesalePrice: 20000, buyPrice: 15000, source: 'Local Sourcing' },
  { no: 19, name: 'A4 tech Mouse', model: 'A4 tech Mouse', cpu: 'wireless', ram: '', ssd: '', warranty: '1 year', stock: 2, retailPrice: 999, wholesalePrice: 900, buyPrice: 750, source: 'Green View' },
  { no: 20, name: 'Logitech mouse', model: 'Logitech mouse B100 wired', cpu: 'wired', ram: '', ssd: '', warranty: '1 year', stock: 2, retailPrice: 450, wholesalePrice: 380, buyPrice: 320, source: 'Green View' },
  { no: 21, name: 'Logitech mouse', model: 'Logitech mouse B175 wireless', cpu: 'wireless', ram: '', ssd: '', warranty: '1 year', stock: 2, retailPrice: 990, wholesalePrice: 800, buyPrice: 660, source: 'Green View' },
  { no: 22, name: 'Fox mouse', model: 'Fox mouse wired', cpu: 'wired', ram: '', ssd: '', warranty: 'No', stock: 1, retailPrice: 250, wholesalePrice: 170, buyPrice: 80, source: 'Green View' },
  { no: 23, name: 'HP mouse', model: 'HP mouse wireless reachargable', cpu: 'wireless', ram: '', ssd: '', warranty: 'No', stock: 3, retailPrice: 590, wholesalePrice: 350, buyPrice: 190, source: 'Green View' },
  { no: 24, name: 'HP mouse', model: 'HP mouse wireless M100', cpu: 'wireless', ram: '', ssd: '', warranty: 'NO', stock: 2, retailPrice: 590, wholesalePrice: 350, buyPrice: 250, source: 'Green View' },
  { no: 25, name: 'A4 Tech keyboard', model: 'A4 Tech keyboard KRS 82BD', cpu: 'wired', ram: '', ssd: '', warranty: '1 year', stock: 2, retailPrice: 999, wholesalePrice: 860, buyPrice: 725, source: 'Green View' },
  { no: 26, name: 'Logitech Keyboard', model: 'Logitech Keyboard', cpu: 'wired', ram: '', ssd: '', warranty: '1 year', stock: 2, retailPrice: 850, wholesalePrice: 750, buyPrice: 640, source: 'Green View' },
  { no: 27, name: 'Hi Power Keyboard', model: 'Hi Power Keyboard', cpu: 'wired', ram: '', ssd: '', warranty: 'NO', stock: 5, retailPrice: 550, wholesalePrice: 350, buyPrice: 215, source: 'Green View' },
  { no: 28, name: 'HeadPhone Logitech', model: 'HeadPhone Logitech H110', cpu: 'wired', ram: '', ssd: '', warranty: '1 year', stock: 2, retailPrice: 1050, wholesalePrice: 930, buyPrice: 780, source: 'Green View' },
  { no: 29, name: 'HeadPhone Logitech', model: 'HeadPhone Logitech H111', cpu: 'wired', ram: '', ssd: '', warranty: '1 year', stock: 1, retailPrice: 1050, wholesalePrice: 930, buyPrice: 780, source: 'Green View' },
  { no: 30, name: 'Converter', model: 'Converter Type C to hub', cpu: 'wired', ram: '', ssd: '', warranty: 'NO', stock: 2, retailPrice: 350, wholesalePrice: 250, buyPrice: 180, source: 'Green View' },
  { no: 31, name: 'wifi adapter', model: 'wifi adapter alpha 150mbps', cpu: 'wireless', ram: '', ssd: '', warranty: 'NO', stock: 2, retailPrice: 450, wholesalePrice: 330, buyPrice: 180, source: 'Green View' },
  { no: 32, name: 'wifi adapter', model: 'wifi adapter 300m', cpu: 'wireless', ram: '', ssd: '', warranty: 'NO', stock: 3, retailPrice: 450, wholesalePrice: 330, buyPrice: 180, source: 'Green View' },
  { no: 33, name: 'Ezviz Cp 1 lite camera', model: 'Ezviz CP1 ip camera', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 0, retailPrice: 2500, wholesalePrice: 2100, buyPrice: 1800, source: 'Green View' },
  { no: 34, name: 'laptop cleaner', model: 'laptop cleaner normal', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 5, retailPrice: 150, wholesalePrice: 90, buyPrice: 60, source: 'Green View' },
  { no: 35, name: 'Wifi+Bluetoorh Adapter', model: 'Wifi+Bluetoorh Adapter', cpu: 'wireless', ram: '', ssd: '', warranty: 'NO', stock: 1, retailPrice: 950, wholesalePrice: 850, buyPrice: 250, source: 'Green View' },
  { no: 36, name: 'Laptop Stand', model: 'Laptop Stand Alluminium', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 4, retailPrice: 550, wholesalePrice: 380, buyPrice: 270, source: 'Green View' },
  { no: 37, name: 'HDMI Cable', model: 'HDMI Cable', cpu: 'wired', ram: '', ssd: '', warranty: 'NO', stock: 5, retailPrice: 300, wholesalePrice: 220, buyPrice: 150, source: 'Green View' },
  { no: 38, name: 'Power Cable', model: 'Power Cable 3 pin fita', cpu: 'wired', ram: '', ssd: '', warranty: 'NO', stock: 4, retailPrice: 150, wholesalePrice: 100, buyPrice: 80, source: 'Green View' },
  { no: 39, name: 'Office Mouse Pad', model: 'Office Mouse Pad', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 3, retailPrice: 100, wholesalePrice: 80, buyPrice: 35, source: 'Green View' },
  { no: 40, name: 'Apple Mouse Pad', model: 'Apple Mouse Pad', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 5, retailPrice: 150, wholesalePrice: 100, buyPrice: 60, source: 'Green View' },
  { no: 41, name: '4g wifi modem', model: '4g wifi modem', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 1, retailPrice: 900, wholesalePrice: 800, buyPrice: 700, source: 'Green View' },
  { no: 42, name: 'Adata Pendrive', model: 'Adata Pendrive 64 gb', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 2, retailPrice: 1300, wholesalePrice: 1000, buyPrice: 900, source: 'Green View' },
  { no: 43, name: 'Marsiva UPS', model: 'Marsiva UPS ET3', cpu: 'wired', ram: '', ssd: '', warranty: '1 year', stock: 0, retailPrice: 2400, wholesalePrice: 2000, buyPrice: 1280, source: 'Green View' },
  { no: 44, name: 'Mouse Pad Big', model: 'Mouse Pad Big', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 3, retailPrice: 550, wholesalePrice: 450, buyPrice: 160, source: 'Green View' },
  { no: 45, name: 'Mouse Pad Big X', model: 'Mouse Pad Big X', cpu: '', ram: '', ssd: '', warranty: 'NO', stock: 2, retailPrice: 1850, wholesalePrice: 1600, buyPrice: 230, source: 'Green View' },
  { no: 46, name: 'RGB Keyboard', model: 'Hi Power RGB keyboard', cpu: 'Wired', ram: '', ssd: '', warranty: 'NO', stock: 0, retailPrice: 900, wholesalePrice: 700, buyPrice: 500, source: 'Green View' },
  { no: 47, name: 'HAVIT', model: 'Havit mouse', cpu: 'wired', ram: '', ssd: '', warranty: 'no', stock: 1, retailPrice: 350, wholesalePrice: 300, buyPrice: 200, source: 'Green View' },
  { no: 48, name: 'wifi + Bt adapter', model: 'wifi + bt adapter', cpu: 'wireless', ram: '', ssd: '', warranty: 'NO', stock: 0, retailPrice: 700, wholesalePrice: 550, buyPrice: 300, source: 'Green View' },
  { no: 49, name: 'RGB Combo', model: 'PC POWER RGB mouse + Keyboard Combo', cpu: 'wired', ram: '', ssd: '', warranty: '1 Year', stock: 0, retailPrice: 1300, wholesalePrice: 1000, buyPrice: 750, source: 'Green View' },
  { no: 51, name: 'G03 Mouse', model: 'Mouse GO3', cpu: 'wireless', ram: '', ssd: '', warranty: 'No', stock: 1, retailPrice: 550, wholesalePrice: 450, buyPrice: 250, source: 'Green Tech' },
  { no: 52, name: 'Jeodel Keyboard', model: 'Jeodel Keyboard Combo', cpu: 'wireless', ram: '', ssd: '', warranty: 'No', stock: 1, retailPrice: 1200, wholesalePrice: 1000, buyPrice: 750, source: 'Green View' },
  { no: 53, name: 'WGP Ups', model: 'WGP UPS 10400 MAH', cpu: 'Wired', ram: '', ssd: '', warranty: 'NO', stock: 1, retailPrice: 1800, wholesalePrice: 1600, buyPrice: 1200, source: 'Green View' },
  { no: 54, name: 'HP Mouse M10', model: 'HP Mouse M10', cpu: 'wired', ram: '', ssd: '', warranty: 'No', stock: 0, retailPrice: 250, wholesalePrice: 200, buyPrice: 120, source: '' },
];

function getBrand(name, model) {
  const full = `${name} ${model}`.toLowerCase();
  if (full.includes('hp')) return 'HP';
  if (full.includes('dell')) return 'Dell';
  if (full.includes('fujitso') || full.includes('fujitsu')) return 'Fujitsu';
  if (full.includes('surface') || full.includes('microsoft')) return 'Microsoft';
  if (full.includes('walton')) return 'Walton';
  if (full.includes('a4 tech') || full.includes('a4tech')) return 'A4Tech';
  if (full.includes('logitech')) return 'Logitech';
  if (full.includes('fox')) return 'Fox';
  if (full.includes('hi power')) return 'Hi Power';
  if (full.includes('apple')) return 'Apple';
  if (full.includes('adata')) return 'Adata';
  if (full.includes('ezviz')) return 'Ezviz';
  if (full.includes('marsiva') || full.includes('marsriva')) return 'Marsriva';
  if (full.includes('pc power')) return 'PC Power';
  if (full.includes('havit')) return 'Havit';
  if (full.includes('jeodel')) return 'Jeodel';
  if (full.includes('wgp')) return 'WGP';
  if (full.includes('g03') || full.includes('green tech')) return 'Green Tech';
  return 'Generic';
}

function getCategory(no, name, model) {
  if (no <= 17) return 'Laptops';
  if (no === 33 || `${name} ${model}`.toLowerCase().includes('camera')) return 'CCTV & Surveillance';
  return 'Computer Accessories';
}

async function main() {
  console.log('=== Starting Master Products & Inventory Import ===\n');

  // 1. Ensure auxiliary suppliers (Green Tech, Local Sourcing) exist
  await prisma.supplier.upsert({
    where: { id: 'supp-greentech' },
    update: {},
    create: {
      id: 'supp-greentech',
      code: 'GT',
      name: 'Green Tech Sales',
      company: 'Green Tech',
      representative: 'Green Tech Sales',
      contactBy: 'Amdadur',
      category: 'Computer Accessories',
      phone: '01700-000000',
      address: 'Dhaka, Bangladesh',
      openingBalance: 0,
      currentPayable: 0,
    },
  });

  await prisma.supplier.upsert({
    where: { id: 'supp-local' },
    update: {},
    create: {
      id: 'supp-local',
      code: 'LOCAL',
      name: 'Local Sourcing Vendor',
      company: 'Local Sourcing',
      representative: 'Local Vendor',
      contactBy: 'Amdadur',
      category: 'Laptop',
      phone: '01733-983752',
      address: 'Moulvibazar, Bangladesh',
      openingBalance: 0,
      currentPayable: 0,
    },
  });

  const suppliers = await prisma.supplier.findMany();
  const supplierMap = new Map();
  for (const s of suppliers) {
    if (s.code) supplierMap.set(s.code.toUpperCase(), s.id);
    supplierMap.set(s.company.toLowerCase().trim(), s.id);
  }
  // aliases
  supplierMap.set('green view', supplierMap.get('green view computer') || 'supp-gb');
  supplierMap.set('green tech', 'supp-greentech');
  supplierMap.set('local sourcing', 'supp-local');
  supplierMap.set('aroz technology', 'supp-at');
  supplierMap.set('muscom', 'supp-muscom');

  // Fetch branch for serial tracking
  const branch = await prisma.branch.findFirst({ where: { active: true } });
  const branchId = branch?.id || 'branch-main-1';

  let importedCount = 0;
  let inStockCount = 0;
  let totalStockUnits = 0;

  for (const item of rawData) {
    const isLaptop = item.no <= 17;
    const isCCTV = item.no === 33;
    const isSerialized = isLaptop || isCCTV;
    const category = getCategory(item.no, item.name, item.model);
    const brand = getBrand(item.name, item.model);

    // Format clean display name
    let prodName = item.model && item.model.trim().toLowerCase() !== item.name.trim().toLowerCase()
      ? `${item.name.trim()} - ${item.model.trim()}`
      : (item.model.trim() || item.name.trim());

    // Deduplicate if name prefix repeated
    if (item.model && item.name && item.model.toLowerCase().startsWith(item.name.toLowerCase())) {
      prodName = item.model.trim();
    }

    const skuPrefix = isLaptop ? 'LPT' : (isCCTV ? 'CCTV' : 'ACC');
    const sku = `SKU-${skuPrefix}-${String(item.no).padStart(4, '0')}`;
    const prodId = `prod-${item.no}`;

    // Supplier resolution
    const sourceKey = item.source ? item.source.toLowerCase().trim() : '';
    const resolvedSupplierId = sourceKey ? (supplierMap.get(sourceKey) || null) : null;

    const warrantyText = (item.warranty || '').toLowerCase();
    const warrantyMonths = warrantyText.includes('1') ? 12 : (warrantyText.includes('2') ? 24 : 0);

    const specs = {
      processor: item.cpu || '',
      cpu: item.cpu || '',
      ram: item.ram || '',
      storage: item.ssd || '',
      ssd: item.ssd || '',
      type: item.cpu || '',
    };

    const description = `[${brand}] ${prodName}. ${item.cpu ? 'Processor/Type: ' + item.cpu + '. ' : ''}${item.ram ? 'RAM: ' + item.ram + '. ' : ''}${item.ssd ? 'Storage: ' + item.ssd + '. ' : ''}Warranty: ${item.warranty || 'No'}.`.trim();

    // Check existing
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { id: prodId },
          { sku: sku },
        ],
      },
    });

    const productPayload = {
      name: prodName,
      sku,
      category,
      brand,
      model: item.model || item.name,
      description,
      purchasePrice: new Prisma.Decimal(item.buyPrice),
      costPrice: new Prisma.Decimal(item.buyPrice),
      retailPrice: new Prisma.Decimal(item.retailPrice),
      wholesalePrice: new Prisma.Decimal(item.wholesalePrice || item.retailPrice),
      emiPrice: new Prisma.Decimal(Math.round(item.retailPrice * 1.1)),
      currentStock: item.stock,
      minStock: 1,
      supplierId: resolvedSupplierId,
      warrantyPeriodMonths: warrantyMonths,
      isSerialized,
      status: item.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
      specs,
    };

    let savedProduct;
    if (existing) {
      savedProduct = await prisma.product.update({
        where: { id: existing.id },
        data: productPayload,
      });
      console.log(`Updated #${item.no}: [${sku}] ${prodName} (Stock: ${item.stock}, Price: ৳${item.retailPrice})`);
    } else {
      savedProduct = await prisma.product.create({
        data: {
          id: prodId,
          ...productPayload,
        },
      });
      console.log(`Created #${item.no}: [${sku}] ${prodName} (Stock: ${item.stock}, Price: ৳${item.retailPrice})`);
    }

    // If serialized product has stock > 0, generate Available Physical Serials
    if (isSerialized && item.stock > 0) {
      for (let sIdx = 1; sIdx <= item.stock; sIdx++) {
        const serialNum = `SN-${brand.toUpperCase()}-${String(item.no).padStart(2, '0')}-${String(sIdx).padStart(2, '0')}`;
        const existingSerial = await prisma.productSerial.findUnique({ where: { serialNumber: serialNum } });
        if (!existingSerial) {
          await prisma.productSerial.create({
            data: {
              id: `sn-${item.no}-${sIdx}-${Date.now()}`,
              serialNumber: serialNum,
              productId: savedProduct.id,
              branchId,
              status: 'AVAILABLE',
              supplierId: resolvedSupplierId,
              purchaseCost: new Prisma.Decimal(item.buyPrice),
            },
          });
          console.log(`  └─ Created Physical Serial: ${serialNum}`);
        }
      }
    }

    importedCount++;
    if (item.stock > 0) {
      inStockCount++;
      totalStockUnits += item.stock;
    }
  }

  // 2. Sync to local SQLite
  const sqlitePath = path.resolve('data/need_electro.db');
  if (fs.existsSync(sqlitePath)) {
    console.log('\nSyncing to local SQLite (data/need_electro.db)...');
    try {
      const sqlite = new DatabaseSync(sqlitePath);
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          sku TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          model TEXT,
          category TEXT NOT NULL,
          brand TEXT NOT NULL,
          purchase_price REAL DEFAULT 0,
          cost_price REAL DEFAULT 0,
          retail_price REAL DEFAULT 0,
          wholesale_price REAL DEFAULT 0,
          emi_price REAL DEFAULT 0,
          current_stock INTEGER DEFAULT 0,
          min_stock INTEGER DEFAULT 5,
          supplier_id TEXT,
          warranty_period_months INTEGER DEFAULT 0,
          is_serialized INTEGER DEFAULT 0,
          status TEXT DEFAULT 'ACTIVE',
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);

      const insertSqlite = sqlite.prepare(`
        INSERT OR REPLACE INTO products (
          id, sku, name, model, category, brand, purchase_price, cost_price, retail_price,
          wholesale_price, emi_price, current_stock, min_stock, supplier_id,
          warranty_period_months, is_serialized, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of rawData) {
        const isLaptop = item.no <= 17;
        const isCCTV = item.no === 33;
        const isSerialized = isLaptop || isCCTV;
        const category = getCategory(item.no, item.name, item.model);
        const brand = getBrand(item.name, item.model);
        const skuPrefix = isLaptop ? 'LPT' : (isCCTV ? 'CCTV' : 'ACC');
        const sku = `SKU-${skuPrefix}-${String(item.no).padStart(4, '0')}`;
        const prodId = `prod-${item.no}`;
        let prodName = item.model && item.model.trim().toLowerCase() !== item.name.trim().toLowerCase()
          ? `${item.name.trim()} - ${item.model.trim()}`
          : (item.model.trim() || item.name.trim());
        if (item.model && item.name && item.model.toLowerCase().startsWith(item.name.toLowerCase())) {
          prodName = item.model.trim();
        }

        const sourceKey = item.source ? item.source.toLowerCase().trim() : '';
        const resolvedSupplierId = sourceKey ? (supplierMap.get(sourceKey) || null) : null;
        const warrantyText = (item.warranty || '').toLowerCase();
        const warrantyMonths = warrantyText.includes('1') ? 12 : (warrantyText.includes('2') ? 24 : 0);

        insertSqlite.run(
          prodId,
          sku,
          prodName,
          item.model || item.name,
          category,
          brand,
          item.buyPrice,
          item.buyPrice,
          item.retailPrice,
          item.wholesalePrice || item.retailPrice,
          Math.round(item.retailPrice * 1.1),
          item.stock,
          1,
          resolvedSupplierId,
          warrantyMonths,
          isSerialized ? 1 : 0,
          item.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
          new Date().toISOString()
        );
      }
      console.log('✔ SQLite products sync complete.');
    } catch (err) {
      console.warn('SQLite notice:', err.message);
    }
  }

  // 3. Record Audit Log
  const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (user) {
    await prisma.auditLog.create({
      data: {
        id: `audit-prod-import-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        action: 'PRODUCTS_IMPORTED',
        module: 'INVENTORY',
        recordId: 'batch-52-products',
        details: `Imported 52 master product catalog items with live stock, buy prices, wholesale prices, and warranty specs.`,
        timestamp: new Date(),
      },
    });
  }

  console.log('\n=== Products Import Successfully Finished! ===');
  console.log(`Total Products in Catalog: ${importedCount}`);
  console.log(`In-Stock Products: ${inStockCount}`);
  console.log(`Total Physical Stock Units: ${totalStockUnits}`);
}

main()
  .catch((err) => {
    console.error('Import error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
