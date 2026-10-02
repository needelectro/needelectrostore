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
  const deleted = await prisma.expense.deleteMany({
    where: {
      OR: [
        { status: 'CANCELLED' },
        { voucherNumber: { in: ['EXP-436404', 'EXP-270903', 'EXP-216831'] } }
      ]
    }
  });
  console.log(`Deleted ${deleted.count} cancelled expenses.`);

  const remaining = await prisma.expense.count();
  console.log(`Remaining expenses in DB: ${remaining}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
