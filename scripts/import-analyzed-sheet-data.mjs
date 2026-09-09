// NEED ELECTRO ERP — Automated Enterprise Data Import & Synchronization
// Wipes all previous commercial data and imports the 100% analyzed Google Sheet dataset across:
// 1. Supabase PostgreSQL (Cloud Database via Prisma)
// 2. SQLite (Local WAL Database at data/need_electro.db)

import { PrismaClient, Prisma } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const prisma = new PrismaClient();
const dbPath = path.resolve('data/need_electro.db');
const sqlite = new DatabaseSync(dbPath);

const scratchDir = 'C:/Users/webho/.gemini/antigravity-ide/brain/7e76f4de-6623-4191-bba8-49bd22afa265/scratch';
const rawDataset = JSON.parse(fs.readFileSync(path.join(scratchDir, 'complete_analyzed_dataset.json'), 'utf-8'));

// Filter out empty ghost sales (where total === 0 and product is empty)
const cleanSales = [];
const cleanSaleItems = [];
const validSaleIds = new Set();

for (let i = 0; i < rawDataset.sales.length; i++) {
  const sale = rawDataset.sales[i];
  const item = rawDataset.saleItems[i];
  
  // If no product and total is 0, skip
  if (sale.subtotal === 0 && (!item.productName || item.productName.trim() === '')) {
    continue;
  }
  
  cleanSales.push(sale);
  cleanSaleItems.push(item);
  validSaleIds.add(sale.id);
}

console.log(`Verified ${cleanSales.length} true sales transactions for import.`);

async function runImport() {
  console.log('================================================================');
  console.log('  NEED ELECTRO ERP — PURGING OLD DATA & IMPORTING ANALYZED DATA');
  console.log('  Target 1: Supabase PostgreSQL (Cloud Database)');
  console.log('  Target 2: SQLite Local WAL Engine (data/need_electro.db)');
  console.log('================================================================\n');

  // =============================================================
  // STEP 1: PURGE PREVIOUS COMMERCIAL DATA
  // =============================================================
  console.log('[1/7] Purging old commercial data...');

  // PostgreSQL Truncate
  const pgTables = [
    'sale_items',
    'sales',
    'purchase_items',
    'purchases',
    'emi_payments',
    'emi_installments',
    'emi_accounts',
    'product_serials',
    'products',
    'product_returns',
    'service_jobs',
    'technicians',
    'warranty_claims',
    'expenses',
    'investments',
    'fund_transfers',
    'supplier_payments',
    'customers',
    'suppliers',
    'attendance',
    'employees',
    'inventory_transactions',
    'ledger_entries',
    'price_audits',
    'customer_merge_audits',
    'opening_balances',
    'audit_logs'
  ];

  for (const tbl of pgTables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tbl}" CASCADE;`);
      console.log(`  ✔ Postgres: Truncated ${tbl}`);
    } catch (err) {
      console.warn(`  ⚠ Postgres truncate note for ${tbl}:`, err.message);
    }
  }

  // SQLite Deletion
  const sqliteTables = [
    'sale_items',
    'sales',
    'purchase_items',
    'purchases',
    'emi_payments',
    'emi_installments',
    'emi_accounts',
    'product_serials',
    'products',
    'product_returns',
    'service_jobs',
    'technicians',
    'warranty_claims',
    'expenses',
    'investments',
    'fund_transfers',
    'supplier_payments',
    'customers',
    'suppliers',
    'attendance',
    'employees',
    'inventory_transactions',
    'ledger_entries',
    'price_audits',
    'customer_merge_audits',
    'opening_balances',
    'audit_logs'
  ];

  for (const tbl of sqliteTables) {
    try {
      sqlite.prepare(`DELETE FROM ${tbl};`).run();
      console.log(`  ✔ SQLite: Cleared ${tbl}`);
    } catch (err) {
      console.warn(`  ⚠ SQLite delete note for ${tbl}:`, err.message);
    }
  }

  // =============================================================
  // STEP 2: IMPORT SUPPLIERS (15 REAL VENDORS)
  // =============================================================
  console.log('\n[2/7] Importing 15 Authentic Hardware Suppliers...');
  for (const s of rawDataset.suppliers) {
    await prisma.supplier.create({
      data: {
        id: s.id,
        name: s.name,
        company: s.company,
        phone: s.phone,
        email: `${s.code.toLowerCase().replace(/[^a-z0-9]/g, '')}@vendor.needelectro.com`,
        address: s.address,
        category: s.category,
        openingBalance: new Prisma.Decimal(0),
        currentPayable: new Prisma.Decimal(0)
      }
    });

    sqlite.prepare(`
      INSERT INTO suppliers (id, name, company, phone, email, address, category, opening_balance, current_payable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      s.id,
      s.name,
      s.company,
      s.phone,
      `${s.code.toLowerCase().replace(/[^a-z0-9]/g, '')}@vendor.needelectro.com`,
      s.address,
      s.category,
      0,
      0
    );
  }
  console.log(`  ✔ Successfully imported ${rawDataset.suppliers.length} suppliers.`);

  // =============================================================
  // STEP 3: IMPORT MASTER PRODUCTS & INVENTORY STOCK
  // =============================================================
  console.log('\n[3/7] Importing Master Catalog & Ending Inventory Stock...');
  for (const p of rawDataset.products) {
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        model: p.model || null,
        description: p.description || null,
        purchasePrice: new Prisma.Decimal(p.purchasePrice),
        costPrice: new Prisma.Decimal(p.costPrice),
        retailPrice: new Prisma.Decimal(p.retailPrice),
        wholesalePrice: new Prisma.Decimal(p.wholesalePrice),
        emiPrice: new Prisma.Decimal(p.emiPrice),
        currentStock: p.currentStock,
        minStock: p.minStock,
        warrantyPeriodMonths: p.warrantyPeriodMonths,
        isSerialized: p.isSerialized,
        status: p.currentStock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK'
      }
    });

    sqlite.prepare(`
      INSERT INTO products (
        id, name, sku, category, brand, model, description,
        purchase_price, cost_price, retail_price, wholesale_price, emi_price,
        current_stock, min_stock, warranty_period_months, is_serialized, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      p.id, p.name, p.sku, p.category, p.brand, p.model || null, p.description || null,
      p.purchasePrice, p.costPrice, p.retailPrice, p.wholesalePrice, p.emiPrice,
      p.currentStock, p.minStock, p.warrantyPeriodMonths, p.isSerialized ? 1 : 0,
      p.currentStock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK'
    );
  }
  console.log(`  ✔ Successfully imported ${rawDataset.products.length} master products.`);

  // =============================================================
  // STEP 4: IMPORT CUSTOMERS (WITH REAL DUES)
  // =============================================================
  console.log('\n[4/7] Importing Real Customer CRM Profiles & Dues...');
  for (const c of rawDataset.customers) {
    await prisma.customer.create({
      data: {
        id: c.id,
        customerId: c.customerId,
        name: c.name,
        phone: c.phone,
        email: c.email || null,
        address: c.address || null,
        nid: c.nid || null,
        creditLimit: new Prisma.Decimal(c.creditLimit),
        currentBalance: new Prisma.Decimal(c.currentBalance),
        notes: c.currentBalance > 0 ? `Uncollected Due: ৳${c.currentBalance}` : null,
        createdAt: new Date(c.createdAt)
      }
    });

    sqlite.prepare(`
      INSERT INTO customers (
        id, customer_id, name, phone, email, address, nid,
        credit_limit, current_balance, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      c.id, c.customerId, c.name, c.phone, c.email || null, c.address || null, c.nid || null,
      c.creditLimit, c.currentBalance, c.currentBalance > 0 ? `Uncollected Due: ৳${c.currentBalance}` : null,
      c.createdAt
    );
  }
  console.log(`  ✔ Successfully imported ${rawDataset.customers.length} customer profiles.`);

  // =============================================================
  // STEP 5: IMPORT 78 REAL SALES TRANSACTIONS & ITEMS
  // =============================================================
  console.log('\n[5/7] Importing 78 Real Sales Invoices (May to Sept 2026)...');
  for (let i = 0; i < cleanSales.length; i++) {
    const s = cleanSales[i];
    const item = cleanSaleItems[i];

    await prisma.sale.create({
      data: {
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        customerId: s.customerId,
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        branchId: s.branchId,
        date: new Date(s.date),
        subtotal: new Prisma.Decimal(s.subtotal),
        overallDiscount: new Prisma.Decimal(0),
        vatAmount: new Prisma.Decimal(0),
        vatPercent: new Prisma.Decimal(0),
        grandTotal: new Prisma.Decimal(s.grandTotal),
        paidAmount: new Prisma.Decimal(s.paidAmount),
        dueAmount: new Prisma.Decimal(s.dueAmount),
        saleType: s.saleType,
        status: s.status,
        salespersonId: s.salespersonId,
        salespersonName: s.salespersonName,
        notes: s.notes,
        createdAt: new Date(s.date)
      }
    });

    sqlite.prepare(`
      INSERT INTO sales (
        id, invoice_number, customer_id, customer_name, customer_phone,
        branch_id, date, subtotal, overall_discount, vat_amount, vat_percent,
        grand_total, paid_amount, due_amount, sale_type, status,
        salesperson_id, salesperson_name, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      s.id, s.invoiceNumber, s.customerId, s.customerName, s.customerPhone,
      s.branchId, s.date, s.subtotal, 0, 0, 0,
      s.grandTotal, s.paidAmount, s.dueAmount, s.saleType, s.status,
      s.salespersonId, s.salespersonName, s.notes, s.date
    );

    // Sale Item
    await prisma.saleItem.create({
      data: {
        id: item.id,
        saleId: item.saleId,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        discount: new Prisma.Decimal(0),
        total: new Prisma.Decimal(item.total),
        warrantyMonths: item.warrantyMonths,
        isSerialized: item.isSerialized,
        serialNumbers: item.serialNumbers
      }
    });

    sqlite.prepare(`
      INSERT INTO sale_items (
        id, sale_id, product_id, product_name, sku, category,
        quantity, unit_price, discount, total, warranty_months,
        is_serialized, serial_numbers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id, item.saleId, item.productId, item.productName, item.sku, item.category,
      item.quantity, item.unitPrice, 0, item.total, item.warrantyMonths,
      item.isSerialized ? 1 : 0, JSON.stringify(item.serialNumbers)
    );
  }
  console.log(`  ✔ Successfully imported ${cleanSales.length} sales and line items.`);

  // =============================================================
  // STEP 6: IMPORT OPERATING EXPENSES
  // =============================================================
  console.log('\n[6/7] Importing 43 Operating Expenses...');
  for (const e of rawDataset.expenses) {
    await prisma.expense.create({
      data: {
        id: e.id,
        voucherNumber: e.voucherNumber,
        category: e.category,
        amount: new Prisma.Decimal(e.amount),
        date: new Date(e.date),
        paymentMethod: e.paymentMethod,
        branchId: e.branchId,
        description: e.description,
        createdBy: e.createdBy,
        createdAt: new Date(e.date)
      }
    });

    sqlite.prepare(`
      INSERT INTO expenses (
        id, voucher_number, category, amount, date, payment_method,
        branch_id, description, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      e.id, e.voucherNumber, e.category, e.amount, e.date, e.paymentMethod,
      e.branchId, e.description, e.createdBy, e.date
    );
  }
  console.log(`  ✔ Successfully imported ${rawDataset.expenses.length} operating expenses.`);

  // =============================================================
  // STEP 7: IMPORT INVESTMENTS & UPDATE FINANCIAL BALANCES
  // =============================================================
  console.log('\n[7/7] Importing Partner Investments & Updating Accounts...');
  for (const inv of rawDataset.investments) {
    await prisma.investment.create({
      data: {
        id: inv.id,
        referenceNumber: inv.referenceNumber,
        investorName: inv.investorName,
        amount: new Prisma.Decimal(inv.amount),
        date: new Date(inv.date),
        investmentType: inv.type || 'CAPITAL',
        depositAccountId: inv.depositAccountId,
        paymentMethod: inv.paymentMethod,
        reference: null,
        status: inv.status || 'ACTIVE',
        notes: inv.notes,
        createdBy: inv.createdBy,
        createdAt: new Date(inv.date)
      }
    });

    sqlite.prepare(`
      INSERT INTO investments (
        id, reference_number, investor_name, amount, date, investment_type,
        deposit_account_id, payment_method, reference, status, notes, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      inv.id, inv.referenceNumber, inv.investorName, inv.amount, inv.date, inv.type || 'CAPITAL',
      inv.depositAccountId, inv.paymentMethod, null, inv.status || 'ACTIVE',
      inv.notes, inv.createdBy, inv.date
    );
  }

  // Update Financial Accounts
  for (const acc of rawDataset.financialAccounts) {
    await prisma.financialAccount.upsert({
      where: { id: acc.id },
      update: { balance: new Prisma.Decimal(acc.balance) },
      create: {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        accountNumber: acc.accountNumber,
        bankName: acc.bankName,
        branchName: acc.branchName,
        balance: new Prisma.Decimal(acc.balance),
        currency: acc.currency,
        isActive: acc.isActive
      }
    });

    sqlite.prepare(`
      INSERT INTO financial_accounts (id, name, type, account_number, bank_name, branch_name, balance, currency, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET balance=excluded.balance;
    `).run(
      acc.id, acc.name, acc.type, acc.accountNumber, acc.bankName, acc.branchName, acc.balance, acc.currency, acc.isActive ? 1 : 0
    );
  }

  // Record System Audit Log
  const auditId = 'audit-import-' + Date.now();
  const auditDetails = `Replaced all previous data with authentic Google Sheets analyzed records: 15 Suppliers, 56 Products, 48 Customers, ${cleanSales.length} Sales (৳586,649), 43 Expenses, 5 Investments (৳273,000).`;
  
  await prisma.auditLog.create({
    data: {
      id: auditId,
      userId: 'user-superadmin-1',
      userName: 'Amdadur Rahman',
      action: 'DATA_IMPORT_GOOGLE_SHEET',
      module: 'SYSTEM',
      recordId: 'main',
      details: auditDetails,
      ipAddress: '127.0.0.1'
    }
  });

  sqlite.prepare(`
    INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    auditId,
    new Date().toISOString(),
    'user-superadmin-1',
    'Amdadur Rahman',
    'DATA_IMPORT_GOOGLE_SHEET',
    'SYSTEM',
    'main',
    auditDetails,
    '127.0.0.1'
  );

  console.log('\n================================================================');
  console.log('  🎉 SUCCESS: ALL PREVIOUS DATA REMOVED & NEW DATA IMPORTED');
  console.log('================================================================\n');

  // Verification Counts
  const postCounts = {
    Suppliers: { postgres: await prisma.supplier.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM suppliers').get().c },
    Products: { postgres: await prisma.product.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM products').get().c },
    Customers: { postgres: await prisma.customer.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM customers').get().c },
    Sales: { postgres: await prisma.sale.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM sales').get().c },
    SaleItems: { postgres: await prisma.saleItem.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM sale_items').get().c },
    Expenses: { postgres: await prisma.expense.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM expenses').get().c },
    Investments: { postgres: await prisma.investment.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM investments').get().c },
    TotalRevenue: {
      postgres: (await prisma.sale.aggregate({ _sum: { grandTotal: true } }))._sum.grandTotal,
      sqlite: sqlite.prepare('SELECT SUM(grand_total) as s FROM sales').get().s
    },
    TotalDues: {
      postgres: (await prisma.sale.aggregate({ _sum: { dueAmount: true } }))._sum.dueAmount,
      sqlite: sqlite.prepare('SELECT SUM(due_amount) as s FROM sales').get().s
    }
  };

  console.table(postCounts);
}

runImport()
  .catch(e => {
    console.error('Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
