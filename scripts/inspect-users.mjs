import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  console.log('Users:', users);
  const branches = await prisma.branch.findMany({ select: { id: true, name: true } });
  console.log('Branches:', branches);
}
run().finally(() => prisma.$disconnect());
