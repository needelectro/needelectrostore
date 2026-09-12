import { PrismaClient } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';

const prisma = new PrismaClient();
const sqlite = new DatabaseSync('data/need_electro.db');

async function test() {
  const pgSalesCount = await prisma.sale.count();
  const sqliteSalesCount = sqlite.prepare('SELECT COUNT(*) as c FROM sales').get().c;
  console.log(`Sales Counts -> PostgreSQL: ${pgSalesCount}, SQLite: ${sqliteSalesCount}`);

  console.log('\nTop 5 Sales in SQLite:');
  const sqliteTop = sqlite.prepare('SELECT invoice_number, customer_name, date, grand_total, paid_amount, due_amount FROM sales ORDER BY date DESC LIMIT 5').all();
  sqliteTop.forEach(s => console.log(`  - ${s.invoice_number} | ${s.date.slice(0, 10)} | ${s.customer_name} | ৳${s.grand_total} (Paid: ৳${s.paid_amount}, Due: ৳${s.due_amount})`));

  console.log('\nTop 5 Sales in PostgreSQL:');
  const pgTop = await prisma.sale.findMany({
    select: { invoiceNumber: true, customerName: true, date: true, grandTotal: true, paidAmount: true, dueAmount: true },
    orderBy: { date: 'desc' },
    take: 5,
  });
  pgTop.forEach(s => console.log(`  - ${s.invoiceNumber} | ${s.date.toISOString().slice(0, 10)} | ${s.customerName} | ৳${s.grandTotal} (Paid: ৳${s.paidAmount}, Due: ৳${s.dueAmount})`));
}

test().finally(() => prisma.$disconnect());
