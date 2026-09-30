import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sups = await prisma.supplier.findMany({
    select: { id: true, name: true, company: true, openingBalance: true, currentPayable: true }
  });
  console.table(sups.map(s => ({
    id: s.id,
    name: s.name,
    company: s.company,
    openingBalance: Number(s.openingBalance),
    currentPayable: Number(s.currentPayable)
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
