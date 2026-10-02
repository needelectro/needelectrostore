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
  const expenses = await prisma.expense.findMany();
  console.log('Expenses in DB count:', expenses.length);
  console.log(JSON.stringify(expenses, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
