import { PrismaClient } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';

const prisma = new PrismaClient();
const sqlite = new DatabaseSync('data/need_electro.db');

async function verify() {
  console.log('=== VERIFYING BANK & PAYMENT CHANNELS IN POSTGRESQL ===');
  const pgAccs = await prisma.financialAccount.findMany({ orderBy: { id: 'asc' } });
  pgAccs.forEach(a => {
    console.log(`  - [${a.type}] ${a.name} | Bank: ${a.bankName || 'N/A'} | Number: ${a.accountNumber || 'N/A'} | Balance: ৳${Number(a.balance).toLocaleString()}`);
  });

  const pgMethods = await prisma.configurablePaymentMethod.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log('\nPostgreSQL Configured Payment Methods:');
  pgMethods.forEach(m => {
    console.log(`  ${m.sortOrder}. ${m.name} (${m.code}) -> Linked Account: ${m.linkedAccountId}`);
  });

  console.log('\n=== VERIFYING BANK & PAYMENT CHANNELS IN SQLITE ===');
  const sqliteAccs = sqlite.prepare('SELECT * FROM financial_accounts ORDER BY id ASC').all();
  sqliteAccs.forEach(a => {
    console.log(`  - [${a.type}] ${a.name} | Bank: ${a.bank_name || 'N/A'} | Number: ${a.account_number || 'N/A'} | Balance: ৳${a.balance.toLocaleString()}`);
  });

  await prisma.$disconnect();
}

verify().catch(console.error);
