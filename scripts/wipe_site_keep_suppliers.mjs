// NEED ELECTRO ERP — Selective Wipe: Keep ONLY Supplier Records
import { PrismaClient } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
console.log('Connecting to PostgreSQL using connection URL host...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl
    }
  }
});

let sqlite = null;
const sqlitePath = path.resolve('data/need_electro.db');
if (fs.existsSync(sqlitePath)) {
  sqlite = new DatabaseSync(sqlitePath);
}

async function runSelectiveWipe() {
  console.log('================================================================');
  console.log('  NEED ELECTRO ERP — PURGING ALL SITE DATA EXCEPT SUPPLIERS');
  console.log('================================================================\n');

  // 1. Check existing suppliers
  const suppliersBefore = await prisma.supplier.findMany();
  console.log(`Found ${suppliersBefore.length} suppliers in PostgreSQL before wipe:`);
  suppliersBefore.forEach((s, idx) => console.log(`  ${idx + 1}. [${s.id}] ${s.name} - ${s.company} (${s.phone || 'No phone'})`));

  // 2. Tables to truncate in PostgreSQL (CASCADE)
  const pgTablesToTruncate = [
    'sale_items',
    'sales',
    'purchase_items',
    'purchases',
    'supplier_payments',
    'emi_payments',
    'emi_installments',
    'emi_accounts',
    'emi_plans',
    'product_serials',
    'products',
    'product_returns',
    'service_jobs',
    'technicians',
    'service_categories_config',
    'warranty_claims',
    'warranty_rules_config',
    'expenses',
    'expense_categories_config',
    'investor_monthly_profits',
    'monthly_settlements',
    'investments',
    'investors',
    'fund_transfers',
    'owner_withdrawals',
    'other_incomes',
    'customer_payments',
    'customers',
    'customer_merge_audits',
    'attendance',
    'employees',
    'inventory_transactions',
    'ledger_entries',
    'price_audits',
    'opening_balances',
    'cash_adjustments',
    'cash_reconciliations',
    'database_backups',
    'login_history',
    'sessions',
    'users',
    'roles',
    'permissions',
    'branches',
    'financial_accounts',
    'configurable_payment_methods',
    'categories_config',
    'brands_config',
    'notification_templates_config',
    'pos_settings',
    'inventory_rules',
    'audit_logs'
  ];

  console.log('\n[1/3] Truncating tables in PostgreSQL...');
  for (const tbl of pgTablesToTruncate) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tbl}" CASCADE;`);
      console.log(`  ✔ PostgreSQL: Truncated ${tbl}`);
    } catch (err) {
      console.warn(`  ⚠ PostgreSQL Note for ${tbl}:`, err.message);
    }
  }

  // Reset suppliers current_payable to 0
  await prisma.$executeRawUnsafe(`UPDATE "suppliers" SET "current_payable" = 0;`);
  console.log('  ✔ PostgreSQL: Reset supplier current payables to ৳0.00');

  // Reset Setup Status to initial setup mode
  await prisma.setupStatus.upsert({
    where: { id: 'main' },
    update: {
      initialSetupCompleted: false,
      setupDate: null,
      initializedBy: null
    },
    create: {
      id: 'main',
      initialSetupCompleted: false,
      setupDate: null,
      initializedBy: null
    }
  });
  console.log('  ✔ PostgreSQL: System reset to Initial Setup Wizard mode');

  // 3. SQLite Sync (if tables exist)
  if (sqlite) {
    console.log('\n[2/3] Cleaning SQLite local store...');
    for (const tbl of pgTablesToTruncate) {
      try {
        sqlite.prepare(`DELETE FROM "${tbl}";`).run();
        console.log(`  ✔ SQLite: Cleared ${tbl}`);
      } catch (err) {
        // Table might not exist in SQLite
      }
    }
    try {
      sqlite.prepare(`UPDATE suppliers SET current_payable = 0;`).run();
    } catch (e) {}
    try {
      sqlite.prepare(`UPDATE setup_status SET initial_setup_completed = 0;`).run();
    } catch (e) {}
  }

  // 4. Verification
  console.log('\n[3/3] Verifying remaining data...');
  const [
    suppliersCount,
    productsCount,
    salesCount,
    purchasesCount,
    customersCount,
    expensesCount,
    usersCount,
    branchesCount,
    setupStatus
  ] = await Promise.all([
    prisma.supplier.count(),
    prisma.product.count(),
    prisma.sale.count(),
    prisma.purchase.count(),
    prisma.customer.count(),
    prisma.expense.count(),
    prisma.user.count(),
    prisma.branch.count(),
    prisma.setupStatus.findUnique({ where: { id: 'main' } })
  ]);

  const summary = {
    'Suppliers (PRESERVED)': suppliersCount,
    'Products': productsCount,
    'Sales': salesCount,
    'Purchases': purchasesCount,
    'Customers': customersCount,
    'Expenses': expensesCount,
    'Users': usersCount,
    'Branches': branchesCount,
    'Initial Setup Completed': setupStatus?.initialSetupCompleted ?? false
  };

  console.table(summary);
  console.log('\n✔ All data successfully purged! ONLY suppliers remain intact.');
  console.log('The system will now guide the administrator through the clean Initial Setup Wizard on next launch.');
}

runSelectiveWipe()
  .catch(err => {
    console.error('Fatal error during wipe:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
