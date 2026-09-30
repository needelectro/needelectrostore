import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    where: { currentBalance: { gt: 0 } }
  });
  console.log(`Customers with positive balance (${customers.length}):`);
  for (const c of customers) {
    console.log(`${c.id} | ${c.name} | Phone: ${c.phone} | Balance: ৳${c.currentBalance}`);
  }

  // Check sales that have dueAmount > 0
  const dueSales = await prisma.sale.findMany({
    where: { dueAmount: { gt: 0 } },
    select: { id: true, invoiceNumber: true, customerId: true, customerName: true, dueAmount: true, paidAmount: true, grandTotal: true, date: true }
  });
  console.log(`\nSales with dueAmount > 0 (${dueSales.length}):`);
  for (const s of dueSales) {
    console.log(`${s.invoiceNumber} | Customer: ${s.customerName} (${s.customerId}) | Due: ৳${s.dueAmount} | Paid: ৳${s.paidAmount} | Grand: ৳${s.grandTotal}`);
  }

  // Check customer payments
  const payments = await prisma.customerPayment.findMany();
  console.log(`\nCustomer payments (${payments.length}):`);
  for (const p of payments) {
    console.log(`${p.receiptNumber} | Customer: ${p.customerName} (${p.customerId}) | Amount: ৳${p.amount}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
