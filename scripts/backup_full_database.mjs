// NEED ELECTRO ERP — Complete Database Backup Script
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl
    }
  }
});

async function runBackup() {
  const backupDir = path.resolve('scripts/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_full_reset_safety_${timestamp}.json`);

  console.log('Initiating comprehensive database backup before reset...');

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      creator: 'Antigravity Reset Workflow',
      target: 'Supabase PostgreSQL Production'
    },
    tables: {
      systemSettings: await prisma.systemSettings.findMany(),
      posSettings: await prisma.posSettings.findMany(),
      inventoryRules: await prisma.inventoryRules.findMany(),
      setupStatus: await prisma.setupStatus.findMany(),
      branches: await prisma.branch.findMany(),
      roles: await prisma.role.findMany(),
      permissions: await prisma.permission.findMany(),
      users: await prisma.user.findMany(),
      sessions: await prisma.session.findMany(),
      loginHistory: await prisma.loginHistory.findMany(),
      categoryConfig: await prisma.categoryConfig.findMany(),
      brandConfig: await prisma.brandConfig.findMany(),
      products: await prisma.product.findMany(),
      productSerials: await prisma.productSerial.findMany(),
      customers: await prisma.customer.findMany(),
      suppliers: await prisma.supplier.findMany(),
      financialAccounts: await prisma.financialAccount.findMany(),
      configurablePaymentMethods: await prisma.configurablePaymentMethod.findMany(),
      sales: await prisma.sale.findMany({ include: { items: true } }),
      eMIPlans: await prisma.eMIPlan.findMany(),
      eMIAccounts: await prisma.eMIAccount.findMany(),
      eMIInstallments: await prisma.eMIInstallment.findMany(),
      eMIPayments: await prisma.eMIPayment.findMany(),
      purchases: await prisma.purchase.findMany({ include: { items: true } }),
      supplierPayments: await prisma.supplierPayment.findMany(),
      productReturns: await prisma.productReturn.findMany(),
      expenseCategoryConfig: await prisma.expenseCategoryConfig.findMany(),
      expenses: await prisma.expense.findMany(),
      serviceCategoryConfig: await prisma.serviceCategoryConfig.findMany(),
      serviceJobs: await prisma.serviceJob.findMany(),
      technicians: await prisma.technician.findMany(),
      warrantyRuleConfig: await prisma.warrantyRuleConfig.findMany(),
      warrantyClaims: await prisma.warrantyClaim.findMany(),
      investments: await prisma.investment.findMany(),
      fundTransfers: await prisma.fundTransfer.findMany(),
      employees: await prisma.employee.findMany(),
      attendance: await prisma.attendance.findMany(),
      inventoryTransactions: await prisma.inventoryTransaction.findMany(),
      ledgerEntries: await prisma.ledgerEntry.findMany(),
      otherIncomes: await prisma.otherIncome.findMany(),
      ownerWithdrawals: await prisma.ownerWithdrawal.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
      priceAudits: await prisma.priceAudit.findMany(),
      customerMergeAudits: await prisma.customerMergeAudit.findMany(),
      openingBalances: await prisma.openingBalance.findMany(),
      notificationTemplateConfigs: await prisma.notificationTemplateConfig.findMany(),
      databaseBackups: await prisma.databaseBackup.findMany(),
      cashAdjustments: await prisma.cashAdjustment.findMany(),
      cashReconciliations: await prisma.cashReconciliation.findMany(),
      customerPayments: await prisma.customerPayment.findMany(),
      investors: await prisma.investor.findMany(),
      monthlySettlements: await prisma.monthlySettlement.findMany(),
      investorMonthlyProfits: await prisma.investorMonthlyProfit.findMany()
    }
  };

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`\n================================================================`);
  console.log(`✔ BACKUP COMPLETED AND SAVED TO: ${backupFile}`);
  console.log(`================================================================`);
  console.log(`Suppliers: ${backupData.tables.suppliers.length}`);
  console.log(`Users: ${backupData.tables.users.length}`);
  console.log(`Branches: ${backupData.tables.branches.length}`);
  console.log(`Roles: ${backupData.tables.roles.length}`);
  console.log(`SystemSettings: ${backupData.tables.systemSettings.length}`);
}

runBackup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
