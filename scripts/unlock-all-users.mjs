import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Unlocking all users in database...');
  const result = await prisma.user.updateMany({
    data: {
      lockedUntil: null,
      failedLoginAttempts: 0,
    },
  });
  console.log(`Successfully unlocked ${result.count} users.`);

  // Verify the specific user
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'contact.amdadur@gmail.com' },
        { username: 'contact.amdadur@gmail.com' },
        { username: 'superadmin' }
      ]
    },
    select: {
      id: true,
      email: true,
      username: true,
      status: true,
      active: true,
      failedLoginAttempts: true,
      lockedUntil: true,
    }
  });
  console.log('Admin user status:', JSON.stringify(adminUser, null, 2));
}

main()
  .catch(err => {
    console.error('Error unlocking users:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
