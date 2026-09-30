import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function removeDefaultInvestments() {
  console.log('=== REMOVING DEFAULT INVESTMENTS & MOCK SETTLEMENTS ===');

  // 1. Delete associated mock settlement profits
  const deletedProfits = await prisma.investorMonthlyProfit.deleteMany({
    where: {
      OR: [
        { settlementId: 'settle-2026-08' },
        { id: { startsWith: 'imp-settle-2026-08' } }
      ]
    }
  });
  console.log(`Deleted ${deletedProfits.count} mock monthly profit distributions.`);

  // 2. Delete mock settlement
  const deletedSettlements = await prisma.monthlySettlement.deleteMany({
    where: {
      id: 'settle-2026-08'
    }
  });
  console.log(`Deleted ${deletedSettlements.count} mock monthly settlement records.`);

  // 3. Delete the default investments
  const deletedInvestments = await prisma.investment.deleteMany({
    where: {
      OR: [
        { id: { in: ['inv-1', 'inv-2', 'inv-3', 'inv-4', 'inv-5'] } },
        { referenceNumber: { startsWith: 'INV-CAP-00' } }
      ]
    }
  });
  console.log(`Deleted ${deletedInvestments.count} default investment records.`);

  // 4. Verify remaining investments
  const remainingInvestments = await prisma.investment.findMany();
  console.log(`Remaining Investments Count: ${remainingInvestments.length}`);

  // 5. Verify Investors roster
  const investors = await prisma.investor.findMany({
    include: { investments: true }
  });
  console.log('Current Investor Accounts (ready for manual entry):');
  investors.forEach(inv => {
    const totalInv = inv.investments.reduce((sum, i) => sum + Number(i.amount), 0);
    console.log(` - [${inv.investorId}] ${inv.name} (${inv.phone || 'No phone'}): Total Invested ৳${totalInv}`);
  });

  console.log('\n✓ Default investments removed successfully!');
}

removeDefaultInvestments()
  .catch(err => {
    console.error('Error removing default investments:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
