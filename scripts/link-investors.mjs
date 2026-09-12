import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `pbkdf2:sha256:100000:${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function main() {
  const branch = await prisma.branch.findFirst();
  const defaultBranchId = branch?.id || 'branch-main-1';

  const seedInvestors = [
    {
      invId: 'inv-1',
      code: 'INV-1001',
      name: 'Amdadur Rahman',
      email: 'investor.amdadur@needelectro.com',
      phone: '+880 1733-983752',
      amount: 80000,
    },
    {
      invId: 'inv-2',
      code: 'INV-1002',
      name: 'Kohes Ahmed',
      email: 'kohes@needelectro.com',
      phone: '+880 1711-000002',
      amount: 100000,
    },
    {
      invId: 'inv-3',
      code: 'INV-1003',
      name: 'Khaled',
      email: 'khaled@needelectro.com',
      phone: '+880 1711-000003',
      amount: 35000,
    },
    {
      invId: 'inv-4',
      code: 'INV-1004',
      name: 'Jisan',
      email: 'jisan@needelectro.com',
      phone: '+880 1711-000004',
      amount: 38000,
    },
    {
      invId: 'inv-5',
      code: 'INV-1005',
      name: 'Saleh',
      email: 'saleh@needelectro.com',
      phone: '+880 1711-000005',
      amount: 20000,
    },
  ];

  for (const item of seedInvestors) {
    // 1. Create or find User
    let user = await prisma.user.findUnique({ where: { email: item.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `usr-${item.code.toLowerCase()}`,
          name: item.name,
          email: item.email,
          username: item.code.toLowerCase(),
          role: 'INVESTOR',
          roleId: 'role-investor',
          branchId: defaultBranchId,
          primaryBranchId: defaultBranchId,
          allowedBranchIds: [defaultBranchId],
          phone: item.phone,
          passwordHash: hashPassword('investor123'),
          status: 'ACTIVE',
        },
      });
      console.log(`Created user for ${item.name}: ${item.email}`);
    }

    // 2. Create or update Investor record
    let investor = await prisma.investor.findUnique({ where: { investorId: item.code } });
    if (!investor) {
      investor = await prisma.investor.create({
        data: {
          id: `investor-${item.code.toLowerCase()}`,
          investorId: item.code,
          name: item.name,
          email: item.email,
          phone: item.phone,
          userId: user.id,
          status: 'ACTIVE',
        },
      });
      console.log(`Created investor profile: ${investor.investorId} for ${investor.name}`);
    }

    // 3. Link existing investment
    await prisma.investment.update({
      where: { id: item.invId },
      data: {
        investorId: investor.id,
      },
    });
    console.log(`Linked investment ${item.invId} to investor ${investor.investorId}`);
  }

  console.log('Seed investors setup completed!');
}

main().finally(() => prisma.$disconnect());
