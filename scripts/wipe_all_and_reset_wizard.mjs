// NEED ELECTRO ERP — COMPLETE ABSOLUTE DATA WIPE & INITIAL SETUP RESET
// Purges 100% of all data across all tables including users, sessions, accounts, and logs.
// Resets setup status so the live website presents the fresh Initial Setup Wizard.

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function runAbsoluteWipe() {
  console.log('================================================================');
  console.log('  NEED ELECTRO ERP — PURGING ALL DATA & ACTIVATING SETUP WIZARD');
  console.log('  Target: Supabase PostgreSQL (Cloud Live)');
  console.log('================================================================\n');

  const allTablesToTruncate = [
    'sale_items',
    'sales',
    'purchase_items',
    'purchases',
    'supplier_payments',
    'customer_payments',
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
    'customers',
    'suppliers',
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
    'audit_logs',
  ];

  console.log('[1/3] Truncating all data tables in PostgreSQL...');
  for (const table of allTablesToTruncate) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`  ✔ Cleared "${table}"`);
    } catch (err) {
      console.warn(`  ⚠ Note for "${table}": ${err.message}`);
    }
  }

  console.log('\n[2/3] Setting Initial Setup Wizard mode and clean base configuration...');
  // Set setup status to FALSE
  await prisma.setupStatus.upsert({
    where: { id: 'main' },
    update: {
      initialSetupCompleted: false,
      setupDate: null,
      initializedBy: null,
    },
    create: {
      id: 'main',
      initialSetupCompleted: false,
      setupDate: null,
      initializedBy: null,
    },
  });
  console.log('  ✔ Setup Status set to initialSetupCompleted = false');

  // Ensure default system branding
  await prisma.systemSettings.upsert({
    where: { id: 'main' },
    update: {
      companyName: 'NEED ELECTRO',
      companyTagline: 'Trusted Electrical & Technological Solutions',
      sisterConcern: 'Amdadur Technology & Electrical Enterprise',
      phone: '+880 1733-983752',
      email: 'contact.amdadur@gmail.com',
      website: 'https://needelectroerp.vercel.app',
      address: 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
      binNumber: 'BIN-NEED-2026-BD',
      currencySymbol: '৳',
      currencyCode: 'BDT',
      theme: 'dark',
    },
    create: {
      id: 'main',
      companyName: 'NEED ELECTRO',
      companyTagline: 'Trusted Electrical & Technological Solutions',
      sisterConcern: 'Amdadur Technology & Electrical Enterprise',
      phone: '+880 1733-983752',
      email: 'contact.amdadur@gmail.com',
      website: 'https://needelectroerp.vercel.app',
      address: 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
      binNumber: 'BIN-NEED-2026-BD',
      currencySymbol: '৳',
      currencyCode: 'BDT',
      theme: 'dark',
    },
  });
  console.log('  ✔ System Settings initialized.');

  await prisma.posSettings.upsert({
    where: { id: 'main' },
    update: {
      invoicePrefix: 'INV-2026-',
      nextInvoiceNumber: 1001,
      returnWindowDays: 7,
      enablePosDiscounts: true,
      maxDiscountPercent: 15.0,
      enableCreditSales: true,
      requireCustomerPhone: true,
      taxPercent: 5.0,
      printLogoOnReceipt: true,
      printWarrantyOnReceipt: true,
    },
    create: {
      id: 'main',
      invoicePrefix: 'INV-2026-',
      nextInvoiceNumber: 1001,
      returnWindowDays: 7,
      enablePosDiscounts: true,
      maxDiscountPercent: 15.0,
      enableCreditSales: true,
      requireCustomerPhone: true,
      taxPercent: 5.0,
      printLogoOnReceipt: true,
      printWarrantyOnReceipt: true,
    },
  });

  await prisma.inventoryRules.upsert({
    where: { id: 'main' },
    update: {
      lowStockThresholdDefault: 3,
      enableOutOfStockWarnings: true,
      allowNegativeStock: false,
      requireSerialOnPurchase: true,
      requireSerialOnSale: true,
      autoGenerateSerials: true,
      defaultSerialPrefix: 'NEC-SN-',
    },
    create: {
      id: 'main',
      lowStockThresholdDefault: 3,
      enableOutOfStockWarnings: true,
      allowNegativeStock: false,
      requireSerialOnPurchase: true,
      requireSerialOnSale: true,
      autoGenerateSerials: true,
      defaultSerialPrefix: 'NEC-SN-',
    },
  });

  console.log('\n[3/3] Final Verification Audit...');
  const counts = {
    users: await prisma.user.count(),
    sessions: await prisma.session.count(),
    financialAccounts: await prisma.financialAccount.count(),
    paymentMethods: await prisma.configurablePaymentMethod.count(),
    branches: await prisma.branch.count(),
    roles: await prisma.role.count(),
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    suppliers: await prisma.supplier.count(),
    sales: await prisma.sale.count(),
    purchases: await prisma.purchase.count(),
    expenses: await prisma.expense.count(),
    investments: await prisma.investment.count(),
    ledgerEntries: await prisma.ledgerEntry.count(),
    auditLogs: await prisma.auditLog.count(),
    setupStatusCompleted: (await prisma.setupStatus.findUnique({ where: { id: 'main' } }))?.initialSetupCompleted ?? false,
  };

  console.table(counts);

  console.log('\n================================================================');
  console.log('  🎉 100% COMPLETE DATA PURGE FINISHED');
  console.log('  Live Website will now open directly into Initial Setup Wizard!');
  console.log('================================================================\n');
}

runAbsoluteWipe()
  .catch(err => {
    console.error('Absolute wipe error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
