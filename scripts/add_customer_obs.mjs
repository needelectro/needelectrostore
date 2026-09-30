import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const existing45 = await prisma.ledgerEntry.findFirst({ where: { referenceNumber: 'OB-CUST-45' } });
  if (!existing45) {
    await prisma.ledgerEntry.create({
      data: {
        id: 'led-ob-cust-45',
        date: new Date('2026-05-01T00:00:00.000Z'),
        partyType: 'CUSTOMER',
        partyId: 'cust-45',
        referenceType: 'OPENING_BALANCE',
        referenceNumber: 'OB-CUST-45',
        description: 'Historical customer opening due balance',
        debit: new Prisma.Decimal(1000.00),
        credit: new Prisma.Decimal(0),
        runningBalance: new Prisma.Decimal(1000.00),
        status: 'COMPLETED',
        performedBy: 'System Migration'
      }
    });
  }

  const existing42 = await prisma.ledgerEntry.findFirst({ where: { referenceNumber: 'OB-CUST-42' } });
  if (!existing42) {
    await prisma.ledgerEntry.create({
      data: {
        id: 'led-ob-cust-42',
        date: new Date('2026-05-01T00:00:00.000Z'),
        partyType: 'CUSTOMER',
        partyId: 'cust-42',
        referenceType: 'OPENING_BALANCE',
        referenceNumber: 'OB-CUST-42',
        description: 'Historical customer opening due balance',
        debit: new Prisma.Decimal(38000.00),
        credit: new Prisma.Decimal(0),
        runningBalance: new Prisma.Decimal(38000.00),
        status: 'COMPLETED',
        performedBy: 'System Migration'
      }
    });
  }

  console.log('Customer opening dues reconciled in ledger!');

  // Check customer balances vs customer ledger
  const customers = await prisma.customer.findMany({ where: { currentBalance: { gt: 0 } } });
  for (const cust of customers) {
    const agg = await prisma.ledgerEntry.aggregate({
      where: {
        partyType: 'CUSTOMER',
        partyId: cust.id,
        status: 'COMPLETED',
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const totalCharged = Number(agg._sum.debit || 0);
    const totalPaid = Number(agg._sum.credit || 0);
    const ledgerCustomerDue = totalCharged - totalPaid;

    console.log(`Customer ${cust.id} (${cust.name}): Stored Due: ৳${Number(cust.currentBalance)}, Ledger Net Due: ৳${ledgerCustomerDue}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
