import { PrismaClient } from '@prisma/client';
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

async function run() {
  const models = [
    'systemSettings', 'posSettings', 'inventoryRules', 'setupStatus', 'branch',
    'role', 'permission', 'user', 'session', 'loginHistory', 'categoryConfig',
    'brandConfig', 'product', 'productSerial', 'customer', 'supplier',
    'financialAccount', 'configurablePaymentMethod', 'sale', 'saleItem',
    'eMIPlan', 'eMIAccount', 'eMIInstallment', 'eMIPayment', 'purchase',
    'purchaseItem', 'supplierPayment', 'productReturn', 'expenseCategoryConfig',
    'expense', 'serviceCategoryConfig', 'serviceJob', 'technician',
    'warrantyRuleConfig', 'warrantyClaim', 'investment', 'fundTransfer',
    'employee', 'attendance', 'inventoryTransaction', 'ledgerEntry',
    'otherIncome', 'ownerWithdrawal', 'auditLog', 'priceAudit',
    'customerMergeAudit', 'openingBalance', 'notificationTemplateConfig',
    'databaseBackup', 'cashAdjustment', 'cashReconciliation', 'customerPayment',
    'investor', 'monthlySettlement', 'investorMonthlyProfit'
  ];
  const counts = {};
  for (const m of models) {
    try {
      counts[m] = await prisma[m].count();
    } catch(e) {
      counts[m] = 'ERROR: ' + e.message;
    }
  }
  console.log('TABLE COUNTS:');
  console.log(JSON.stringify(counts, null, 2));

  // Inspect users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, username: true, role: true, roleId: true, branchId: true }
  });
  console.log('\nUsers in DB:', users);

  // Inspect branches
  const branches = await prisma.branch.findMany();
  console.log('\nBranches in DB:', branches);

  // Inspect financial accounts
  const financialAccounts = await prisma.financialAccount.findMany();
  console.log('\nFinancial Accounts in DB:', financialAccounts);

  // Inspect setup status
  const setupStatus = await prisma.setupStatus.findMany();
  console.log('\nSetup Status in DB:', setupStatus);
}

run().catch(console.error).finally(() => prisma.$disconnect());
