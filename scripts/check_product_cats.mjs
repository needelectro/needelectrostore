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
  const products = await prisma.product.findMany({
    select: { id: true, name: true, category: true }
  });
  console.log('Product items:');
  for (const p of products) {
    console.log(`[${p.category}] ${p.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
