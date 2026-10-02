// NEED ELECTRO ERP — Asset & Expense Import Engine
// Imports 23 initial asset and setup expenses dated 2026-06-01 paid from Main Cash Drawer.

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

const items = [
  { no: 1, name: 'table', price: 5500, category: 'Shop Assets & Equipment' },
  { no: 2, name: 'printer', price: 18000, category: 'Shop Assets & Equipment' },
  { no: 3, name: 'lamenating machine', price: 4500, category: 'Shop Assets & Equipment' },
  { no: 4, name: 'chair', price: 4500, category: 'Shop Assets & Equipment' },
  { no: 5, name: 'tool', price: 450, category: 'Shop Assets & Equipment' },
  { no: 6, name: 'scale+stapler+seal', price: 250, category: 'Shop Assets & Equipment' },
  { no: 7, name: 'others', price: 4265, category: 'Other Operating Expenses' },
  { no: 8, name: 'punch machine', price: 250, category: 'Shop Assets & Equipment' },
  { no: 9, name: 'pc pendrive', price: 2000, category: 'Shop Assets & Equipment' },
  { no: 10, name: 'muti flug', price: 1100, category: 'Shop Assets & Equipment' },
  { no: 11, name: 'paper', price: 600, category: 'Office Supplies & Hospitality' },
  { no: 12, name: 'juri', price: 120, category: 'Office Supplies & Hospitality' },
  { no: 13, name: 'Shop PC Setup', price: 0, category: 'Shop Assets & Equipment' },
  { no: 14, name: 'Business Card', price: 700, category: 'Marketing & Advertising' },
  { no: 15, name: 't shirt', price: 4000, category: 'Marketing & Advertising' },
  { no: 16, name: 'sticker and banner', price: 2000, category: 'Marketing & Advertising' },
  { no: 17, name: 'marketing poster', price: 3000, category: 'Marketing & Advertising' },
  { no: 18, name: 'Laptop scru driver', price: 150, category: 'Shop Assets & Equipment' },
  { no: 19, name: 'tester', price: 40, category: 'Shop Assets & Equipment' },
  { no: 20, name: 'Lock', price: 1200, category: 'Shop Assets & Equipment' },
  { no: 21, name: 'Website domain', price: 1200, category: 'Internet & Communications' },
  { no: 22, name: '1 year website hosting', price: 4800, category: 'Internet & Communications' },
  { no: 23, name: 'Laptop Cleaner Tools', price: 400, category: 'Shop Assets & Equipment' },
];

async function main() {
  console.log('=== Starting Import of 23 Asset Expenses ===');

  // 1. Verify / Create Category "Shop Assets & Equipment"
  const existingCat = await prisma.expenseCategoryConfig.findFirst({
    where: {
      OR: [
        { code: 'SHOP_ASSETS' },
        { name: 'Shop Assets & Equipment' },
      ],
    },
  });

  if (!existingCat) {
    console.log('Creating category "Shop Assets & Equipment"...');
    await prisma.expenseCategoryConfig.create({
      data: {
        id: 'exp-assets',
        name: 'Shop Assets & Equipment',
        code: 'SHOP_ASSETS',
        description: 'Showroom assets, furniture, machinery and tools',
        isTaxDeductible: true,
        isActive: true,
      },
    });
  }

  // 2. Fetch target account (acc-1: Main Cash Drawer) and branch
  const cashAccount = await prisma.financialAccount.findUnique({
    where: { id: 'acc-1' },
  });
  if (!cashAccount) {
    throw new Error('Main Cash Drawer account (acc-1) not found in database.');
  }

  const branch = await prisma.branch.findFirst({
    where: { active: true },
  });
  const branchId = branch?.id || 'branch-main-1';

  const user = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });
  const creatorName = user?.name || 'Amdadur Rahman';
  const creatorId = user?.id || 'user-superadmin-1';

  const expenseDate = new Date('2026-06-01T10:00:00.000Z');

  console.log(`Target Account: ${cashAccount.name} (${cashAccount.id})`);
  console.log(`Branch: ${branch?.name || branchId}`);
  console.log(`Creator: ${creatorName}`);
  console.log(`Date: ${expenseDate.toISOString()}`);

  let totalExpenseAmount = 0;
  const createdExpenses = [];

  await prisma.$transaction(async (tx) => {
    // Check if any of these vouchers already exist to prevent duplicate creation
    for (const item of items) {
      const voucherNumber = `EXP-2026-0601-${String(item.no).padStart(3, '0')}`;
      const expenseId = `exp-20260601-${String(item.no).padStart(2, '0')}`;

      // Check if expense exists
      const existing = await tx.expense.findFirst({
        where: {
          OR: [
            { id: expenseId },
            { voucherNumber },
          ],
        },
      });

      if (existing) {
        console.log(`Skipping existing expense: ${voucherNumber}`);
        continue;
      }

      const price = Number(item.price);

      // Create Expense
      const exp = await tx.expense.create({
        data: {
          id: expenseId,
          voucherNumber,
          category: item.category,
          amount: new Prisma.Decimal(price),
          date: expenseDate,
          paymentMethod: 'Cash',
          branchId,
          description: item.name.trim(),
          attachmentName: null,
          status: 'COMPLETED',
          createdBy: creatorName,
          createdAt: expenseDate,
        },
      });

      createdExpenses.push(exp);

      // If price > 0, record Central Ledger Entry and decrement cash drawer
      if (price > 0) {
        totalExpenseAmount += price;

        await tx.financialAccount.update({
          where: { id: cashAccount.id },
          data: {
            balance: { decrement: new Prisma.Decimal(price) },
          },
        });

        // Current balance after this decrement
        const accNow = await tx.financialAccount.findUnique({
          where: { id: cashAccount.id },
        });

        await tx.ledgerEntry.create({
          data: {
            id: `led-exp-20260601-${String(item.no).padStart(2, '0')}`,
            date: expenseDate,
            partyType: 'ACCOUNT',
            partyId: cashAccount.id,
            referenceType: 'EXPENSE',
            referenceNumber: voucherNumber,
            description: `Operating Expense: [${item.category}] ${item.name.trim()}`,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(price),
            runningBalance: accNow?.balance || new Prisma.Decimal(0),
            status: 'COMPLETED',
            paymentMethod: 'Cash',
            performedBy: creatorName,
            relatedTransactionId: exp.id,
          },
        });
      }

      console.log(`✔ Recorded #${item.no}: [${voucherNumber}] ${item.name} - ৳${price} (${item.category})`);
    }

    // Record Audit Log
    if (createdExpenses.length > 0) {
      await tx.auditLog.create({
        data: {
          id: `audit-exp-import-${Date.now()}`,
          userId: creatorId,
          userName: creatorName,
          action: 'EXPENSE_IMPORTED',
          module: 'EXPENSES',
          recordId: 'batch-23-assets',
          details: `Imported ${createdExpenses.length} asset expense vouchers totaling ৳${totalExpenseAmount} dated 2026-06-01 paid from Main Cash Drawer.`,
          timestamp: new Date(),
        },
      });
    }
  }, {
    timeout: 60000,
    maxWait: 20000,
  });

  // Verify and sync stored balances with ledger
  const accounts = await prisma.financialAccount.findMany({ where: { isActive: true } });
  for (const acc of accounts) {
    const agg = await prisma.ledgerEntry.aggregate({
      where: {
        partyType: 'ACCOUNT',
        partyId: acc.id,
        status: { in: ['COMPLETED', 'REVERSED'] },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const trueBalance = Number(agg._sum.debit || 0) - Number(agg._sum.credit || 0);

    if (Number(acc.balance) !== trueBalance) {
      await prisma.financialAccount.update({
        where: { id: acc.id },
        data: {
          balance: new Prisma.Decimal(trueBalance),
        },
      });
    }
  }

  const finalCash = await prisma.financialAccount.findUnique({ where: { id: 'acc-1' } });
  const finalExpCount = await prisma.expense.count();

  console.log('\n=== PostgreSQL Import Complete ===');
  console.log(`Total Expenses in DB: ${finalExpCount}`);
  console.log(`Total Amount Expensed: ৳${totalExpenseAmount}`);
  console.log(`Main Cash Drawer Stored Balance: ৳${Number(finalCash?.balance || 0).toLocaleString()}`);

  // 3. Sync to local SQLite if it exists
  const sqlitePath = path.resolve('data/need_electro.db');
  if (fs.existsSync(sqlitePath)) {
    console.log('\nSyncing to local SQLite (data/need_electro.db)...');
    try {
      const sqlite = new DatabaseSync(sqlitePath);
      // Ensure tables exist
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS expense_categories_config (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT UNIQUE NOT NULL,
          description TEXT,
          is_tax_deductible INTEGER DEFAULT 1,
          is_active INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY,
          voucher_number TEXT UNIQUE NOT NULL,
          category TEXT NOT NULL,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          branch_id TEXT NOT NULL,
          description TEXT NOT NULL,
          attachment_name TEXT,
          status TEXT DEFAULT 'COMPLETED',
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS ledger_entries (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          party_type TEXT NOT NULL,
          party_id TEXT NOT NULL,
          reference_type TEXT NOT NULL,
          reference_number TEXT NOT NULL,
          description TEXT NOT NULL,
          debit REAL DEFAULT 0,
          credit REAL DEFAULT 0,
          running_balance REAL DEFAULT 0,
          status TEXT DEFAULT 'COMPLETED',
          reversal_of_id TEXT,
          related_transaction_id TEXT,
          payment_method TEXT,
          performed_by TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        );
      `);

      const insertCat = sqlite.prepare(`
        INSERT OR IGNORE INTO expense_categories_config (id, name, code, description, is_tax_deductible, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertCat.run('exp-assets', 'Shop Assets & Equipment', 'SHOP_ASSETS', 'Showroom assets, furniture, machinery and tools', 1, 1);

      const insertExp = sqlite.prepare(`
        INSERT OR REPLACE INTO expenses (
          id, voucher_number, category, amount, date, payment_method,
          branch_id, description, attachment_name, status, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertLedger = sqlite.prepare(`
        INSERT OR REPLACE INTO ledger_entries (
          id, date, party_type, party_id, reference_type, reference_number,
          description, debit, credit, running_balance, status, payment_method, performed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        const voucherNumber = `EXP-2026-0601-${String(item.no).padStart(3, '0')}`;
        const expenseId = `exp-20260601-${String(item.no).padStart(2, '0')}`;
        const price = Number(item.price);
        const isoDate = '2026-06-01';

        insertExp.run(
          expenseId, voucherNumber, item.category, price, isoDate, 'Cash',
          branchId, item.name.trim(), '', 'COMPLETED', creatorName, '2026-06-01T10:00:00.000Z'
        );

        if (price > 0) {
          insertLedger.run(
            `led-exp-20260601-${String(item.no).padStart(2, '0')}`,
            '2026-06-01T10:00:00.000Z',
            'ACCOUNT',
            'acc-1',
            'EXPENSE',
            voucherNumber,
            `Operating Expense: [${item.category}] ${item.name.trim()}`,
            0,
            price,
            Number(finalCash?.balance || 0),
            'COMPLETED',
            'Cash',
            creatorName
          );
        }
      }

      // Update SQLite account balance
      sqlite.prepare('UPDATE financial_accounts SET balance = ? WHERE id = ?').run(Number(finalCash?.balance || 0), 'acc-1');

      console.log('✔ SQLite sync successful.');
    } catch (e) {
      console.warn('SQLite sync notice:', e.message);
    }
  }

  console.log('\n=== All 23 Asset Expenses Successfully Imported! ===');
}

main()
  .catch((err) => {
    console.error('Import failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
