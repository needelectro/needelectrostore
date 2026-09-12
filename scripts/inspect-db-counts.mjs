import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function count() {
  const [users, roles, branches, products, sales, purchases, expenses, customers, suppliers, accounts, investments, ledgers, audits] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.branch.count(),
    prisma.product.count(),
    prisma.sale.count(),
    prisma.purchase.count(),
    prisma.expense.count(),
    prisma.customer.count(),
    prisma.supplier.count(),
    prisma.financialAccount.count(),
    prisma.investment.count(),
    prisma.ledgerEntry.count(),
    prisma.auditLog.count(),
  ]);
  console.log(JSON.stringify({ users, roles, branches, products, sales, purchases, expenses, customers, suppliers, accounts, investments, ledgers, audits }, null, 2));
}

count().catch(console.error).finally(() => prisma.$disconnect());
