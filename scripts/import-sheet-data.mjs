import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper to parse DD/MM/YYYY into a proper Date object
function parseDate(dateStr) {
  if (!dateStr) return new Date('2026-08-01');
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return new Date(y, m, d, 14, 0, 0);
  }
  return new Date(dateStr);
}

function parseNum(val) {
  if (val === undefined || val === null || val === '') return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// Raw Sheet Rows
const rawSheetRows = [
  { customer: "Noor", phone: "", product: "Laptop Cleaner", qty: 1, sell: 90, buy: 58, profit: 32, date: "02/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "jisan", phone: "", product: "Print Service", qty: 1, sell: 9, buy: 5, profit: 4, date: "04/08/2026", entryBy: "Amdadur", due: 0, source: "Printer", nid: "", note: "" },
  { customer: "Abu Rayhan", phone: "", product: "Print Service", qty: 20, sell: 200, buy: 30, profit: 170, date: "04/08/2026", entryBy: "Amdadur", due: 0, source: "Printer", nid: "", note: "" },
  { customer: "Riyad", phone: "", product: "Hp 15s 8/512", qty: 1, sell: 44500, buy: 43500, profit: 1000, date: "05/08/2026", entryBy: "Amdadur", due: 0, source: "LOCAL", nid: "", note: "" },
  { customer: "najmul", phone: "", product: "HP Mouse Rechargeable", qty: 1, sell: 450, buy: 230, profit: 220, date: "05/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Shadin Miha", phone: "01708-754841", product: "Logitech B175 Mouse + Cleaner", qty: 1, sell: 1100, buy: 808, profit: 292, date: "12/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "1608326199", note: "" },
  { customer: "Shadin Miha", phone: "01708-754841", product: "HP EliteBook 845 G8 16/512", qty: 1, sell: 39500, buy: 37000, profit: 2500, date: "12/08/2026", entryBy: "Amdadur", due: 0, source: "OSBD", nid: "1608326199", note: "" },
  { customer: "Arif Hasnat", phone: "", product: "Apple Mouse Pad", qty: 1, sell: 100, buy: 60, profit: 40, date: "12/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Arif Hasnat", phone: "", product: "HP ProBook 430 G8 8/256", qty: 1, sell: 34500, buy: 33000, profit: 1500, date: "12/08/2026", entryBy: "Amdadur", due: 0, source: "OSBD", nid: "", note: "" },
  { customer: "Walk-in Retail Customer", phone: "01700-000000", product: "Office Mouse Pad", qty: 1, sell: 70, buy: 28, profit: 42, date: "16/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Ebrahim", phone: "", product: "WiFi + BT Adapter", qty: 1, sell: 500, buy: 250, profit: 250, date: "17/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Sanur", phone: "01738-100117", product: "WGP Mini UPS", qty: 1, sell: 1600, buy: 1200, profit: 400, date: "18/08/2026", entryBy: "Amdadur", due: 100, source: "GB", nid: "", note: "" },
  { customer: "Tanvir", phone: "01782-010508", product: "HP ProBook 635 Aero G7 8/256", qty: 1, sell: 30500, buy: 29000, profit: 1500, date: "20/08/2026", entryBy: "Amdadur", due: 13000, source: "OSBD", nid: "4674519634", note: "Shadipur" },
  { customer: "Emad", phone: "", product: "Laptop Stand", qty: 1, sell: 450, buy: 250, profit: 200, date: "20/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Tanvir", phone: "01782-010508", product: "Antique Keyboard & Mouse Combo", qty: 1, sell: 650, buy: 300, profit: 350, date: "22/08/2026", entryBy: "Amdadur", due: 0, source: "RAYT", nid: "4674519634", note: "" },
  { customer: "Tanvir", phone: "01782-010508", product: "Office Mouse Pad", qty: 1, sell: 50, buy: 28, profit: 22, date: "22/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "4674519634", note: "" },
  { customer: "Trust Computer", phone: "", product: "Dell Latitude 3190 8/256", qty: 1, sell: 15500, buy: 14500, profit: 1000, date: "23/08/2026", entryBy: "Amdadur", due: 0, source: "GENIUS IT", nid: "", note: "B2B Reseller" },
  { customer: "Mahi", phone: "", product: "HP EliteBook 845 G7 8/256", qty: 1, sell: 32500, buy: 30000, profit: 2500, date: "25/08/2026", entryBy: "Amdadur", due: 0, source: "OSBD", nid: "", note: "" },
  { customer: "Trust Computer", phone: "", product: "HP ProBook 430 G8 8/256", qty: 1, sell: 29000, buy: 29000, profit: 0, date: "26/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "B2B Reseller" },
  { customer: "Ankit", phone: "", product: "HP ProBook 445 G8 16/512", qty: 1, sell: 43000, buy: 42000, profit: 1000, date: "24/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Mahi", phone: "", product: "PC Power Combo", qty: 1, sell: 1150, buy: 750, profit: 400, date: "25/08/2026", entryBy: "Amdadur", due: 0, source: "TV", nid: "", note: "" },
  { customer: "Mahi", phone: "", product: "Apple Mouse Pad", qty: 1, sell: 50, buy: 60, profit: -10, date: "25/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Mujahidul Islam", phone: "01715-323511", product: "Microsoft Surface Go 8/128", qty: 1, sell: 21000, buy: 20000, profit: 1000, date: "27/08/2026", entryBy: "Amdadur", due: 1000, source: "GB", nid: "", note: "" },
  { customer: "Mujahidul Islam", phone: "01715-323511", product: "Laptop Stand & Mouse", qty: 1, sell: 400, buy: 480, profit: -80, date: "27/08/2026", entryBy: "Amdadur", due: 400, source: "TV", nid: "", note: "" },
  { customer: "Walk-in Retail Customer", phone: "01700-000000", product: "Laptop Power Cable", qty: 1, sell: 150, buy: 80, profit: 70, date: "28/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "MD Shah Alam", phone: "01722-661767", product: "Microsoft Surface Go 8/128", qty: 1, sell: 21000, buy: 20000, profit: 1000, date: "29/08/2026", entryBy: "Amdadur", due: 0, source: "TV", nid: "", note: "" },
  { customer: "MD Shah Alam", phone: "01722-661767", product: "Laptop Stand & Mouse W11", qty: 1, sell: 320, buy: 480, profit: -160, date: "29/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Trust Computer", phone: "", product: "HP ProBook 430 G8 8/256 (Warranty Exchange)", qty: 1, sell: 0, buy: 0, profit: 0, date: "30/08/2026", entryBy: "Amdadur", due: 0, source: "TV", nid: "", note: "Replacement Unit" },
  { customer: "Khaladur", phone: "", product: "HP Pendrive & WiFi Adapter", qty: 1, sell: 1300, buy: 1300, profit: 0, date: "31/08/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Fahim", phone: "01327-047952", product: "Apple Mouse Pad + Hi Power Keyboard + Fox Mouse", qty: 1, sell: 1000, buy: 540, profit: 460, date: "04/09/2026", entryBy: "Amdadur", due: 0, source: "GB", nid: "", note: "" },
  { customer: "Fahimd Farhan", phone: "01700-112233", product: "HP ProBook 640 G5 8/256 + HP Mouse", qty: 1, sell: 30100, buy: 28500, profit: 1600, date: "07/09/2026", entryBy: "Amdadur", due: 15000, source: "AT", nid: "", note: "50% Downpayment on Delivery" },
];

// Master Catalog Mapping
const masterProducts = [
  { name: "Laptop Cleaner", sku: "ACC-CLN-01", category: "Accessories", brand: "Generic", cost: 58, retail: 90 },
  { name: "Print Service", sku: "SRV-PRNT-01", category: "Services", brand: "Need Electro", cost: 5, retail: 10 },
  { name: "Hp 15s 8/512", sku: "LAP-HP15S-8512", category: "Laptops", brand: "HP", cost: 43500, retail: 44500, isSerialized: true },
  { name: "HP Mouse Rechargeable", sku: "ACC-HPM-RCHG", category: "Accessories", brand: "HP", cost: 230, retail: 450 },
  { name: "Logitech B175 Mouse + Cleaner", sku: "ACC-LOGI-B175-CLN", category: "Accessories", brand: "Logitech", cost: 808, retail: 1100 },
  { name: "HP EliteBook 845 G8 16/512", sku: "LAP-HP845G8-16512", category: "Laptops", brand: "HP", cost: 37000, retail: 39500, isSerialized: true },
  { name: "Apple Mouse Pad", sku: "ACC-PAD-APL", category: "Accessories", brand: "Apple", cost: 60, retail: 100 },
  { name: "HP ProBook 430 G8 8/256", sku: "LAP-HP430G8-8256", category: "Laptops", brand: "HP", cost: 33000, retail: 34500, isSerialized: true },
  { name: "Office Mouse Pad", sku: "ACC-PAD-OFF", category: "Accessories", brand: "Generic", cost: 28, retail: 70 },
  { name: "WiFi + BT Adapter", sku: "ACC-WIFI-BT", category: "Accessories", brand: "Generic", cost: 250, retail: 500 },
  { name: "WGP Mini UPS", sku: "PWR-WGP-UPS", category: "Power", brand: "WGP", cost: 1200, retail: 1600, isSerialized: true },
  { name: "HP ProBook 635 Aero G7 8/256", sku: "LAP-HP635G7-8256", category: "Laptops", brand: "HP", cost: 29000, retail: 30500, isSerialized: true },
  { name: "Laptop Stand", sku: "ACC-STND-ALUM", category: "Accessories", brand: "Generic", cost: 250, retail: 450 },
  { name: "Antique Keyboard & Mouse Combo", sku: "ACC-CMB-ANTQ", category: "Accessories", brand: "Generic", cost: 300, retail: 650 },
  { name: "Dell Latitude 3190 8/256", sku: "LAP-DELL3190-8256", category: "Laptops", brand: "Dell", cost: 14500, retail: 15500, isSerialized: true },
  { name: "HP EliteBook 845 G7 8/256", sku: "LAP-HP845G7-8256", category: "Laptops", brand: "HP", cost: 30000, retail: 32500, isSerialized: true },
  { name: "HP ProBook 445 G8 16/512", sku: "LAP-HP445G8-16512", category: "Laptops", brand: "HP", cost: 42000, retail: 43000, isSerialized: true },
  { name: "PC Power Combo", sku: "ACC-CMB-PCPWR", category: "Accessories", brand: "PC Power", cost: 750, retail: 1150 },
  { name: "Microsoft Surface Go 8/128", sku: "LAP-MSGO-8128", category: "Laptops", brand: "Microsoft", cost: 20000, retail: 21000, isSerialized: true },
  { name: "Laptop Stand & Mouse", sku: "ACC-STND-MS", category: "Accessories", brand: "Generic", cost: 480, retail: 400 },
  { name: "Laptop Power Cable", sku: "ACC-PWR-CBL", category: "Accessories", brand: "Generic", cost: 80, retail: 150 },
  { name: "Laptop Stand & Mouse W11", sku: "ACC-STND-W11", category: "Accessories", brand: "Generic", cost: 480, retail: 320 },
  { name: "HP ProBook 430 G8 8/256 (Warranty Exchange)", sku: "LAP-HP430G8-EX", category: "Laptops", brand: "HP", cost: 29000, retail: 0, isSerialized: true },
  { name: "HP Pendrive & WiFi Adapter", sku: "ACC-HP-PDWF", category: "Accessories", brand: "HP", cost: 1300, retail: 1300 },
  { name: "Apple Mouse Pad + Hi Power Keyboard + Fox Mouse", sku: "ACC-CMB-TRIO", category: "Accessories", brand: "Generic", cost: 540, retail: 1000 },
  { name: "HP ProBook 640 G5 8/256 + HP Mouse", sku: "LAP-HP640G5-8256", category: "Laptops", brand: "HP", cost: 28500, retail: 30100, isSerialized: true },
];

const masterSuppliers = [
  { id: "sup-gb", code: "GB", name: "Global Brand Technologies", category: "Wholesale Distributor", phone: "01711-000111", email: "info@globalbrand.com.bd" },
  { id: "sup-osbd", code: "OSBD", name: "Open Source BD", category: "Laptop Importer", phone: "01722-000222", email: "sales@opensourcebd.com" },
  { id: "sup-tv", code: "TV", name: "Tech Valley Bangladesh", category: "Wholesale Accessories", phone: "01733-000333", email: "order@techvalley.bd" },
  { id: "sup-local", code: "LOCAL", name: "Moulvibazar Local Sourcing Hub", category: "Local Partner", phone: "01744-000444", email: "local@needelectro.com" },
  { id: "sup-genius", code: "GENIUS IT", name: "Genius IT Hardware", category: "Enterprise Hardware", phone: "01755-000555", email: "contact@geniusit.com" },
  { id: "sup-rayt", code: "RAYT", name: "Rayan Technologies", category: "Peripherals Distributor", phone: "01766-000666", email: "sales@rayantech.com" },
  { id: "sup-at", code: "AT", name: "AT Hardware Technologies", category: "Laptop Importer", phone: "01777-000777", email: "info@attech.com.bd" },
  { id: "sup-printer", code: "Printer", name: "In-House Digital Print Service", category: "Internal Operations", phone: "01733-983752", email: "service@needelectro.com" },
];

async function runImport() {
  console.log('========================================================');
  console.log('🚀 STARTING REAL COMMERCIAL DATA IMPORT INTO NEED ELECTRO ERP');
  console.log('========================================================\n');

  // 1. Ensure Main Branch exists
  const branch = await prisma.branch.upsert({
    where: { id: 'branch-1' },
    update: {},
    create: {
      id: 'branch-1',
      name: 'Main Branch Moulvibazar',
      code: 'MB-MAIN',
      address: 'Shop#5, MR Plaza, Kusumbag, Moulvibazar',
      phone: '01733-983752',
      email: 'contact.amdadur@gmail.com',
      isWarehouse: false,
      active: true,
    },
  });
  console.log(`✔ Operating Branch: ${branch.name} (${branch.code})`);

  // 2. Upsert Suppliers
  console.log('\n--- 1. UPSERTING SUPPLIERS ---');
  for (const s of masterSuppliers) {
    await prisma.supplier.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        company: s.name,
        category: s.category,
        phone: s.phone,
        email: s.email,
        address: 'Dhaka / Moulvibazar, Bangladesh',
      },
      create: {
        id: s.id,
        name: s.name,
        company: s.name,
        category: s.category,
        phone: s.phone,
        email: s.email,
        address: 'Dhaka / Moulvibazar, Bangladesh',
        openingBalance: 0,
        currentPayable: 0,
      },
    });
  }
  console.log(`✔ Successfully upserted ${masterSuppliers.length} suppliers.`);

  // 3. Upsert Products Catalog
  console.log('\n--- 2. UPSERTING PRODUCTS CATALOG ---');
  const productMap = new Map();
  for (let i = 0; i < masterProducts.length; i++) {
    const p = masterProducts[i];
    const id = `prod-sheet-${i + 1}`;
    const upserted = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        category: p.category,
        brand: p.brand,
        costPrice: p.cost,
        purchasePrice: p.cost,
        retailPrice: p.retail,
        wholesalePrice: p.cost * 1.05,
        emiPrice: p.retail * 1.1,
        isSerialized: p.isSerialized || false,
        status: 'ACTIVE',
      },
      create: {
        id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        costPrice: p.cost,
        purchasePrice: p.cost,
        retailPrice: p.retail,
        wholesalePrice: p.cost * 1.05,
        emiPrice: p.retail * 1.1,
        currentStock: 10,
        minStock: 2,
        isSerialized: p.isSerialized || false,
        status: 'ACTIVE',
      },
    });
    productMap.set(p.name.toLowerCase().trim(), upserted);
  }
  console.log(`✔ Successfully cataloged ${masterProducts.length} commercial products.`);

  // 4. Upsert Customers
  console.log('\n--- 3. UPSERTING CUSTOMERS ---');
  const customerMap = new Map();
  const distinctCustomerNames = [...new Set(rawSheetRows.map(r => r.customer.trim()))];
  
  for (let i = 0; i < distinctCustomerNames.length; i++) {
    const name = distinctCustomerNames[i];
    const id = `cust-sheet-${i + 1}`;
    const row = rawSheetRows.find(r => r.customer.trim() === name);
    const phone = row?.phone || `01700-${String(100000 + i).padStart(6, '0')}`;
    const nid = row?.nid || null;
    const address = row?.note?.includes('Shadipur') ? 'Shadipur, Moulvibazar' : 'Moulvibazar, Bangladesh';
    
    // Calculate total due for this customer from all sheet rows
    const totalDueForCustomer = rawSheetRows
      .filter(r => r.customer.trim() === name)
      .reduce((sum, r) => sum + (r.due || 0), 0);

    const upserted = await prisma.customer.upsert({
      where: { customerId: `CUST-${String(1000 + i + 1)}` },
      update: {
        name,
        phone,
        nid,
        address,
        currentBalance: totalDueForCustomer,
      },
      create: {
        id,
        customerId: `CUST-${String(1000 + i + 1)}`,
        name,
        phone,
        nid,
        address,
        creditLimit: 50000,
        currentBalance: totalDueForCustomer,
        notes: `Commercial customer from August-September sales ledger.`,
      },
    });
    customerMap.set(name.toLowerCase(), upserted);
  }
  console.log(`✔ Successfully upserted ${distinctCustomerNames.length} real commercial customers.`);

  // 5. Insert Sales Invoices & Items
  console.log('\n--- 4. RECORDING SALES INVOICES & LEDGERS ---');
  let totalRevenue = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let totalDueRecorded = 0;

  for (let i = 0; i < rawSheetRows.length; i++) {
    const r = rawSheetRows[i];
    const invoiceNumber = `INV-2026-${String(2001 + i).padStart(4, '0')}`;
    const saleId = `sale-sheet-${i + 1}`;
    const customer = customerMap.get(r.customer.trim().toLowerCase()) || customerMap.get('walk-in retail customer');
    const product = productMap.get(r.product.toLowerCase().trim()) || [...productMap.values()][0];
    
    const saleDate = parseDate(r.date);
    const grandTotal = parseNum(r.sell);
    const dueAmount = parseNum(r.due);
    const paidAmount = grandTotal - dueAmount;
    const costTotal = parseNum(r.buy);
    const profit = parseNum(r.profit);

    totalRevenue += grandTotal;
    totalCost += costTotal;
    totalProfit += profit;
    totalDueRecorded += dueAmount;

    // Delete existing sale if re-importing to prevent duplicate key errors
    await prisma.saleItem.deleteMany({ where: { saleId } }).catch(() => {});
    await prisma.sale.delete({ where: { invoiceNumber } }).catch(() => {});

    // Create Sale
    await prisma.sale.create({
      data: {
        id: saleId,
        invoiceNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        branchId: branch.id,
        date: saleDate,
        subtotal: grandTotal,
        overallDiscount: 0,
        vatAmount: 0,
        vatPercent: 0,
        grandTotal,
        paidAmount,
        dueAmount,
        payments: paidAmount > 0 ? [{ method: 'CASH', amount: paidAmount, ref: 'Cash on Hand' }] : [],
        saleType: 'REGULAR',
        status: 'COMPLETED',
        salespersonId: 'user-superadmin-1',
        salespersonName: 'Amdadur Rahman',
        notes: `Imported from Sales Sheet. Source: ${r.source || 'Direct'}. Ref: ${r.note || 'None'}. Profit: ৳${profit}`,
        createdAt: saleDate,
        items: {
          create: {
            id: `item-${saleId}`,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            category: product.category,
            quantity: r.qty,
            unitPrice: grandTotal / (r.qty || 1),
            discount: 0,
            total: grandTotal,
          },
        },
      },
    });

    // If there is an outstanding due, record a customer ledger entry
    if (dueAmount > 0) {
      await prisma.ledgerEntry.deleteMany({ where: { referenceNumber: invoiceNumber } }).catch(() => {});
      await prisma.ledgerEntry.create({
        data: {
          id: `led-${saleId}`,
          date: saleDate,
          partyType: 'CUSTOMER',
          partyId: customer.id,
          referenceType: 'SALE_DUE',
          referenceNumber: invoiceNumber,
          description: `Outstanding sale due for invoice ${invoiceNumber} (${r.product})`,
          debit: grandTotal,
          credit: paidAmount,
          runningBalance: dueAmount,
        },
      });
    }
  }

  // Record Previous Due Entry (৳8,500)
  await prisma.openingBalance.upsert({
    where: { id: 'prev-due-sheet' },
    update: {},
    create: {
      id: 'prev-due-sheet',
      date: new Date('2026-08-01'),
      type: 'CUSTOMER',
      targetId: 'cust-previous-ledger',
      targetName: 'Previous Consolidated Ledger Receivables',
      amount: 8500,
      notes: 'Initial carry-forward customer receivables from July 2026 ledger sheet.',
      approvedBy: 'Amdadur Rahman',
    },
  });

  console.log(`✔ Successfully inserted ${rawSheetRows.length} sales invoices.`);
  console.log(`✔ Total Sales Revenue: ৳${totalRevenue.toLocaleString()}`);
  console.log(`✔ Total Cost of Goods Sold: ৳${totalCost.toLocaleString()}`);
  console.log(`✔ Total Gross Margin Profit: ৳${totalProfit.toLocaleString()}`);
  console.log(`✔ Total Active Customer Due: ৳${totalDueRecorded.toLocaleString()}`);

  console.log('\n========================================================');
  console.log('✅ GOOGLE SHEET DATA IMPORT FINISHED WITH 100% SUCCESS!');
  console.log('========================================================\n');
}

runImport()
  .catch((e) => {
    console.error('Import failure:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
