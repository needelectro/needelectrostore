import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({ select: { date: true, grandTotal: true, status: true } });
  const expenses = await prisma.expense.findMany({ select: { date: true, amount: true } });
  const investments = await prisma.investment.findMany({ select: { id: true, investorName: true, amount: true, status: true, date: true } });

  console.log('Total sales records:', sales.length);
  console.log('Total expense records:', expenses.length);
  console.log('Total investments:', investments);

  const months = {};
  for (const s of sales) {
    if (s.status === 'COMPLETED') {
      const m = s.date.toISOString().slice(0, 7);
      months[m] = months[m] || { revenue: 0, expenses: 0 };
      months[m].revenue += Number(s.grandTotal);
    }
  }
  for (const e of expenses) {
    const m = e.date.toISOString().slice(0, 7);
    months[m] = months[m] || { revenue: 0, expenses: 0 };
    months[m].expenses += Number(e.amount);
  }

  console.log('Monthly Financial Aggregates:', months);
}

main().finally(() => prisma.$disconnect());
