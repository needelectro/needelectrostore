import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const counts = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    serials: await prisma.productSerial.count(),
    customers: await prisma.customer.count(),
    suppliers: await prisma.supplier.count(),
    sales: await prisma.sale.count(),
    purchases: await prisma.purchase.count(),
    emiPlans: await prisma.eMIPlan.count(),
    emiAccounts: await prisma.eMIAccount.count(),
    branches: await prisma.branch.count(),
    settings: await prisma.systemSettings.count(),
    expenses: await prisma.expense.count(),
    services: await prisma.serviceJob.count(),
    warrantyClaims: await prisma.warrantyClaim.count(),
    employees: await prisma.employee.count(),
    financialAccounts: await prisma.financialAccount.count(),
    categories: await prisma.categoryConfig.count(),
    brands: await prisma.brandConfig.count(),
  };
  console.log('Supabase Live Counts:', JSON.stringify(counts, null, 2));

  // Sample products
  const products = await prisma.product.findMany({ take: 5, select: { id: true, name: true, sku: true, brand: true, category: true, retailPrice: true } });
  console.log('Sample Products:', products);

  // Sample users
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, roleId: true } });
  console.log('Users:', users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
