import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const investors = await prisma.investor.findMany();
  console.log('=== INVESTORS ===');
  console.table(investors);

  const investments = await prisma.investment.findMany();
  console.log('=== INVESTMENTS ===');
  console.table(investments);

  const ledgers = await prisma.ledgerEntry.findMany({
    where: {
      OR: [
        { referenceType: { contains: 'INVEST' } },
        { description: { contains: 'invest', mode: 'insensitive' } },
        { partyType: 'INVESTOR' }
      ]
    }
  });
  console.log('=== INVESTMENT LEDGER ENTRIES ===');
  console.table(ledgers);

  const monthlySettlements = await prisma.monthlySettlement.findMany();
  console.log('=== MONTHLY SETTLEMENTS ===');
  console.table(monthlySettlements);

  const profits = await prisma.investorMonthlyProfit.findMany();
  console.log('=== INVESTOR MONTHLY PROFITS ===');
  console.table(profits);
}

check().catch(console.error).finally(() => prisma.$disconnect());
