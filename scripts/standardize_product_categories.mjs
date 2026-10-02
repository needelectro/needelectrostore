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
  const products = await prisma.product.findMany();
  console.log(`Checking ${products.length} products in DB...`);

  let updatedCount = 0;
  for (const p of products) {
    let newCategory = p.category;
    const nameLower = p.name.toLowerCase();

    if (p.category === 'Laptops') {
      newCategory = 'Laptop';
    } else if (p.category === 'CCTV & Surveillance' || nameLower.includes('camera') || nameLower.includes('cctv')) {
      newCategory = 'CCTV';
    } else if (nameLower.includes('cable') || nameLower.includes('hdmi')) {
      newCategory = 'Cables';
    } else if (nameLower.includes('modem') || nameLower.includes('router')) {
      newCategory = 'Router';
    } else if (nameLower.includes('adapter') || nameLower.includes('charger')) {
      newCategory = 'Chargers';
    } else if (p.category === 'Computer Accessories') {
      newCategory = 'Accessories';
    }

    if (newCategory !== p.category) {
      await prisma.product.update({
        where: { id: p.id },
        data: { category: newCategory }
      });
      console.log(`Updated "${p.name}": [${p.category}] -> [${newCategory}]`);
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} products to standardized showroom categories.`);

  // Print summary of categories in DB now
  const afterProducts = await prisma.product.findMany({ select: { category: true } });
  const breakdown = {};
  for (const p of afterProducts) {
    breakdown[p.category] = (breakdown[p.category] || 0) + 1;
  }
  console.log('Final categories breakdown in DB:', breakdown);
}

main().catch(console.error).finally(() => prisma.$disconnect());
