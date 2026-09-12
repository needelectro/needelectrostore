import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  console.log('Existing roles:', roles.map(r => ({ id: r.id, code: r.code, name: r.name })));

  // Ensure INVESTOR role
  const investorRole = await prisma.role.upsert({
    where: { code: 'INVESTOR' },
    update: {},
    create: {
      id: 'role-investor',
      name: 'Investor',
      code: 'INVESTOR',
      description: 'Read-only financial investor portal access',
      isSystem: true,
      permissions: ['investor:view'],
      isActive: true,
    }
  });
  console.log('Investor role ready:', investorRole);
}

main().finally(() => prisma.$disconnect());
