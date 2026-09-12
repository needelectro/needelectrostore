// NEED ELECTRO ERP — Real Bank Accounts & Payment Methods Migration
// Updates PostgreSQL and SQLite in 100% lockstep
import { PrismaClient, Prisma } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';

const prisma = new PrismaClient();
const sqlite = new DatabaseSync('data/need_electro.db');

async function updateAccounts() {
  console.log('=== UPDATING REAL BANK ACCOUNTS & PAYMENT CHANNELS ===\n');

  // 1. Prepare target financial accounts
  const accounts = [
    {
      id: 'acc-1',
      name: 'Main Cash Drawer (Moulvibazar Showroom)',
      type: 'CASH',
      accountNumber: 'CASH-MB-01',
      bankName: 'Cash in Hand Vault',
      branchName: 'Moulvibazar Main',
      balance: 167789.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-ebl-amdadur',
      name: 'Eastern Bank - Amdadur Rahman',
      type: 'BANK',
      accountNumber: 'EBL-AMDADUR',
      bankName: 'Eastern Bank PLC',
      branchName: 'Moulvibazar Branch',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-pubali-amdadur',
      name: 'Pubali Bank - Amdadur Rahman',
      type: 'BANK',
      accountNumber: 'PUBALI-AMDADUR',
      bankName: 'Pubali Bank PLC',
      branchName: 'Moulvibazar Branch',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-pubali-fulori',
      name: 'Pubali Bank - Fulori Miha',
      type: 'BANK',
      accountNumber: 'PUBALI-FULORI',
      bankName: 'Pubali Bank PLC',
      branchName: 'Moulvibazar Branch',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-bkash-primary',
      name: 'bKash Payment (01884599271)',
      type: 'MOBILE_BANKING',
      accountNumber: '01884599271',
      bankName: 'bKash Limited',
      branchName: 'Official Payment Wallet',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
  ];

  // 2. Prepare target payment methods
  const paymentMethods = [
    {
      id: 'pm-1',
      name: 'Cash',
      code: 'CASH',
      type: 'CASH',
      linkedAccountId: 'acc-1',
      accountNumber: '',
      chargePercent: 0,
      instructions: 'Accepted at counter. Verify currency security strips.',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'pm-2',
      name: 'bKash Payment (01884599271)',
      code: 'BKASH',
      type: 'MOBILE_BANKING',
      linkedAccountId: 'acc-bkash-primary',
      accountNumber: '01884599271',
      chargePercent: 0,
      instructions: 'Payment / Send Money to 01884599271. Verify TrxID at billing counter.',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'pm-3',
      name: 'Eastern Bank - Amdadur Rahman',
      code: 'EASTERN_BANK',
      type: 'BANK',
      linkedAccountId: 'acc-ebl-amdadur',
      accountNumber: 'EBL-AMDADUR',
      chargePercent: 0,
      instructions: 'BEFTN / NPSB / RTGS transfer to Eastern Bank — Account: Amdadur Rahman.',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'pm-4',
      name: 'Pubali Bank - Amdadur Rahman',
      code: 'PUBALI_AMDADUR',
      type: 'BANK',
      linkedAccountId: 'acc-pubali-amdadur',
      accountNumber: 'PUBALI-AMDADUR',
      chargePercent: 0,
      instructions: 'BEFTN / NPSB / RTGS transfer to Pubali Bank — Account: Amdadur Rahman.',
      isActive: true,
      sortOrder: 4,
    },
    {
      id: 'pm-5',
      name: 'Pubali Bank - Fulori Miha',
      code: 'PUBALI_FULORI',
      type: 'BANK',
      linkedAccountId: 'acc-pubali-fulori',
      accountNumber: 'PUBALI-FULORI',
      chargePercent: 0,
      instructions: 'BEFTN / NPSB / RTGS transfer to Pubali Bank — Account: Fulori Miha.',
      isActive: true,
      sortOrder: 5,
    },
    {
      id: 'pm-6',
      name: 'Credit / Debit Card (POS)',
      code: 'CARD_POS',
      type: 'CARD',
      linkedAccountId: 'acc-ebl-amdadur',
      accountNumber: '',
      chargePercent: 1.5,
      instructions: 'Visa, MasterCard, Amex via counter POS swipe terminal.',
      isActive: true,
      sortOrder: 6,
    },
    {
      id: 'pm-7',
      name: 'Credit / Customer Due',
      code: 'CREDIT_SALE',
      type: 'OTHER',
      linkedAccountId: 'acc-1',
      accountNumber: '',
      chargePercent: 0,
      instructions: 'Allowed only for pre-approved credit customers.',
      isActive: true,
      sortOrder: 7,
    },
    {
      id: 'pm-8',
      name: 'Laptop EMI Facility',
      code: 'EMI_SALE',
      type: 'OTHER',
      linkedAccountId: 'acc-1',
      accountNumber: '',
      chargePercent: 0,
      instructions: 'Financed via Need Electro EMI installment system.',
      isActive: true,
      sortOrder: 8,
    },
  ];

  // --- SYNC POSTGRESQL ---
  console.log('1. Syncing PostgreSQL (Supabase)...');
  // Clean old payment methods & financial accounts (except preserving acc-1 balance if exists)
  const existingAcc1 = await prisma.financialAccount.findUnique({ where: { id: 'acc-1' } });
  const cashBalance = existingAcc1 ? Number(existingAcc1.balance) : 167789.00;
  accounts[0].balance = cashBalance;

  await prisma.configurablePaymentMethod.deleteMany({});
  await prisma.financialAccount.deleteMany({});

  for (const acc of accounts) {
    await prisma.financialAccount.create({
      data: {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        accountNumber: acc.accountNumber,
        bankName: acc.bankName,
        branchName: acc.branchName,
        balance: new Prisma.Decimal(acc.balance),
        currency: acc.currency,
        isActive: acc.isActive,
      },
    });
  }

  for (const pm of paymentMethods) {
    await prisma.configurablePaymentMethod.create({
      data: {
        id: pm.id,
        name: pm.name,
        code: pm.code,
        type: pm.type,
        linkedAccountId: pm.linkedAccountId,
        accountNumber: pm.accountNumber,
        chargePercent: new Prisma.Decimal(pm.chargePercent),
        instructions: pm.instructions,
        isActive: pm.isActive,
        sortOrder: pm.sortOrder,
      },
    });
  }
  console.log('✓ PostgreSQL accounts and payment methods synced successfully.');

  // --- SYNC SQLITE ---
  console.log('\n2. Syncing SQLite (data/need_electro.db)...');
  sqlite.exec('DELETE FROM configurable_payment_methods;');
  sqlite.exec('DELETE FROM financial_accounts;');

  const insertSqliteAccount = sqlite.prepare(`
    INSERT INTO financial_accounts (id, name, type, account_number, bank_name, branch_name, balance, currency, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const acc of accounts) {
    insertSqliteAccount.run(
      acc.id,
      acc.name,
      acc.type,
      acc.accountNumber,
      acc.bankName,
      acc.branchName,
      acc.balance,
      acc.currency,
      acc.isActive ? 1 : 0
    );
  }

  const insertSqlitePm = sqlite.prepare(`
    INSERT INTO configurable_payment_methods (id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const pm of paymentMethods) {
    insertSqlitePm.run(
      pm.id,
      pm.name,
      pm.code,
      pm.type,
      pm.linkedAccountId,
      pm.accountNumber,
      pm.chargePercent,
      pm.instructions,
      pm.isActive ? 1 : 0,
      pm.sortOrder
    );
  }
  console.log('✓ SQLite accounts and payment methods synced successfully.');

  console.log('\n=== VERIFICATION ===');
  const pgAccList = await prisma.financialAccount.findMany({ orderBy: { id: 'asc' } });
  console.log(`PostgreSQL Financial Accounts (${pgAccList.length}):`);
  pgAccList.forEach(a => console.log(`  - [${a.type}] ${a.name} (${a.bankName || a.accountNumber}) -> Balance: ৳${Number(a.balance).toLocaleString()}`));

  const sqliteAccList = sqlite.prepare('SELECT * FROM financial_accounts ORDER BY id ASC').all();
  console.log(`\nSQLite Financial Accounts (${sqliteAccList.length}):`);
  sqliteAccList.forEach(a => console.log(`  - [${a.type}] ${a.name} (${a.bank_name || a.account_number}) -> Balance: ৳${a.balance.toLocaleString()}`));

  await prisma.$disconnect();
}

updateAccounts().catch(console.error);
