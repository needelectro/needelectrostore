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

async function main() {
  const vouchers = ['EXP-436404', 'EXP-270903', 'EXP-216831'];
  const ledgers = await prisma.ledgerEntry.findMany({
    where: {
      referenceNumber: { in: vouchers }
    }
  });
  console.log('Ledger entries for these vouchers:');
  console.log(JSON.stringify(ledgers, null, 2));

  const accounts = await prisma.financialAccount.findMany();
  console.log('Current financial accounts:');
  console.log(JSON.stringify(accounts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
