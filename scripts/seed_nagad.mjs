import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.financialAccount.findUnique({ where: { id: 'acc-nagad-primary' } });
  if (!existing) {
    await prisma.financialAccount.create({
      data: {
        id: 'acc-nagad-primary',
        name: 'Nagad Payment Wallet',
        type: 'MOBILE_BANKING',
        accountNumber: '01733-983752',
        bankName: 'Nagad (Bangladesh Post Office)',
        branchName: 'Showroom Merchant Wallet',
        balance: 0,
        currency: 'BDT',
        isActive: true,
      }
    });
    console.log('Created Nagad account.');
  } else {
    console.log('Nagad account already exists.');
  }

  // Also check configurable payment methods:
  const pm = await prisma.configurablePaymentMethod.findUnique({ where: { code: 'NAGAD' } });
  if (!pm) {
    await prisma.configurablePaymentMethod.create({
      data: {
        id: 'pm-nagad',
        name: 'Nagad',
        code: 'NAGAD',
        type: 'MOBILE_BANKING',
        linkedAccountId: 'acc-nagad-primary',
        accountNumber: '01733-983752',
        chargePercent: 0,
        instructions: 'Send money or merchant pay to 01733-983752',
        isActive: true,
        sortOrder: 4,
      }
    });
    console.log('Created Nagad payment method.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
