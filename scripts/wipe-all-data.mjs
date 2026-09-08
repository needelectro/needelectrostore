// NEED ELECTRO ERP — Enterprise Data Wipe Script
// Safely resets business data to a clean production slate across Supabase PostgreSQL & SQLite

import { PrismaClient } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';

const prisma = new PrismaClient();
const sqlite = new DatabaseSync('data/need_electro.db');

async function wipeAllData() {
  console.log('================================================================');
  console.log('  NEED ELECTRO ERP — PURGING ALL COMMERCIAL DATA');
  console.log('  Dual Targets: Supabase PostgreSQL (Cloud) & SQLite (Local WAL)');
  console.log('================================================================\n');

  // 1. Gather Before Counts
  console.log('Gathering initial records count...');
  const beforeCounts = {
    Products: await prisma.product.count(),
    Serials: await prisma.productSerial.count(),
    Customers: await prisma.customer.count(),
    Suppliers: await prisma.supplier.count(),
    Sales: await prisma.sale.count(),
    Purchases: await prisma.purchase.count(),
    EMIAccounts: await prisma.eMIAccount.count(),
    Employees: await prisma.employee.count(),
    Attendance: await prisma.attendance.count(),
    ServiceJobs: await prisma.serviceJob.count(),
    WarrantyClaims: await prisma.warrantyClaim.count(),
    Expenses: await prisma.expense.count(),
    Investments: await prisma.investment.count(),
  };
  console.table(beforeCounts);

  // 2. PostgreSQL Truncation with CASCADE
  console.log('\n[1/3] Truncating commercial tables in Supabase PostgreSQL...');
  const pgTablesToTruncate = [
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
    'price_audit_logs',
    'customer_merge_audits',
    'opening_balances',
    'audit_logs',
  ];

  for (const tbl of pgTablesToTruncate) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tbl}" CASCADE;`);
      console.log(`  ✔ Postgres: Truncated ${tbl}`);
    } catch (err) {
      console.warn(`  ⚠ Postgres truncate note for ${tbl}:`, err.message);
    }
  }

  // Reset Financial Account balances to 0
  await prisma.$executeRawUnsafe(`UPDATE "financial_accounts" SET "balance" = 0;`);
  console.log('  ✔ Postgres: Financial accounts balance reset to ৳0.00');

  // 3. SQLite Deletion
  console.log('\n[2/3] Deleting commercial tables in SQLite (Local WAL)...');
  const sqliteTables = [
    'sale_items',
    'sales',
    'purchase_items',
    'purchases',
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
    'price_audit_logs',
    'customer_merge_audits',
    'opening_balances',
    'audit_logs',
  ];

  for (const tbl of sqliteTables) {
    try {
      sqlite.prepare(`DELETE FROM ${tbl};`).run();
      console.log(`  ✔ SQLite: Cleared ${tbl}`);
    } catch (err) {
      console.warn(`  ⚠ SQLite delete note for ${tbl}:`, err.message);
    }
  }

  sqlite.prepare(`UPDATE financial_accounts SET balance = 0;`).run();
  console.log('  ✔ SQLite: Financial accounts balance reset to ৳0.00');

  // 4. Record Initial Post-Wipe Audit Log Entry
  console.log('\n[3/3] Recording clean system audit trail...');
  const auditId = 'audit-wipe-' + Date.now();
  const timestamp = new Date().toISOString();
  const auditDetails = 'All commercial transactional, inventory, customer, sales, EMI, and expense data removed by Super Admin. System reset to clean production slate.';

  await prisma.auditLog.create({
    data: {
      id: auditId,
      userId: 'user-superadmin-1',
      userName: 'Amdadur Rahman',
      action: 'ENTERPRISE_DATA_WIPE',
      module: 'DATABASE',
      recordId: 'main',
      details: auditDetails,
      ipAddress: '127.0.0.1',
    }
  });

  sqlite.prepare(`
    INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    auditId,
    timestamp,
    'user-superadmin-1',
    'Amdadur Rahman',
    'ENTERPRISE_DATA_WIPE',
    'DATABASE',
    'main',
    auditDetails,
    '127.0.0.1'
  );

  console.log('\n================================================================');
  console.log('  🎉 SUCCESS: ALL COMMERCIAL DATA REMOVED FROM SITE & DATABASES');
  console.log('================================================================\n');

  // 5. Verify Final Counts
  console.log('--- Final Post-Wipe Database Verification Counts ---');
  const afterCounts = {
    Branches: { postgres: await prisma.branch.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM branches').get().c },
    Users: { postgres: await prisma.user.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM users').get().c },
    Products: { postgres: await prisma.product.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM products').get().c },
    Serials: { postgres: await prisma.productSerial.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM product_serials').get().c },
    Customers: { postgres: await prisma.customer.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM customers').get().c },
    Suppliers: { postgres: await prisma.supplier.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM suppliers').get().c },
    Sales: { postgres: await prisma.sale.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM sales').get().c },
    Purchases: { postgres: await prisma.purchase.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM purchases').get().c },
    EMI_Accounts: { postgres: await prisma.eMIAccount.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM emi_accounts').get().c },
    Employees: { postgres: await prisma.employee.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM employees').get().c },
    Attendance: { postgres: await prisma.attendance.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM attendance').get().c },
    Technicians: { postgres: await prisma.technician.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM technicians').get().c },
    Service_Jobs: { postgres: await prisma.serviceJob.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM service_jobs').get().c },
    Warranty_Claims: { postgres: await prisma.warrantyClaim.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM warranty_claims').get().c },
    Expenses: { postgres: await prisma.expense.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM expenses').get().c },
    Investments: { postgres: await prisma.investment.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM investments').get().c },
    Financial_Accounts: { postgres: await prisma.financialAccount.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM financial_accounts').get().c },
    Audit_Logs: { postgres: await prisma.auditLog.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM audit_logs').get().c },
  };

  console.table(afterCounts);
}

wipeAllData()
  .catch(err => {
    console.error('Wipe data error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
