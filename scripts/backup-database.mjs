// NEED ELECTRO ERP — Automated Database Backup Script
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backup() {
  const backupDir = path.resolve('scripts/backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_before_sheet_import_${timestamp}.json`);

  console.log('Initiating complete database backup...');

  const data = {
    timestamp: new Date().toISOString(),
    users: await prisma.user.findMany(),
    roles: await prisma.role.findMany(),
    permissions: await prisma.permission.findMany(),
    branches: await prisma.branch.findMany(),
    systemSettings: await prisma.systemSettings.findMany(),
    posSettings: await prisma.posSettings.findMany(),
    financialAccounts: await prisma.financialAccount.findMany(),
    products: await prisma.product.findMany(),
    productSerials: await prisma.productSerial.findMany(),
    customers: await prisma.customer.findMany(),
    suppliers: await prisma.supplier.findMany(),
    sales: await prisma.sale.findMany({ include: { items: true } }),
    purchases: await prisma.purchase.findMany({ include: { items: true } }),
    expenses: await prisma.expense.findMany(),
    investments: await prisma.investment.findMany(),
    ledgerEntries: await prisma.ledgerEntry.findMany(),
    auditLogs: await prisma.auditLog.findMany(),
    cashAdjustments: await prisma.cashAdjustment.findMany(),
    customerPayments: await prisma.customerPayment.findMany(),
  };

  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Backup successfully created at: ${backupFile}`);
  console.log(`  - Products: ${data.products.length}`);
  console.log(`  - Sales: ${data.sales.length}`);
  console.log(`  - Customers: ${data.customers.length}`);
  console.log(`  - Expenses: ${data.expenses.length}`);
  console.log(`  - Investments: ${data.investments.length}`);
  console.log(`  - Users: ${data.users.length}`);
  return backupFile;
}

backup().catch(console.error).finally(() => prisma.$disconnect());
