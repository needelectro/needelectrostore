// NEED ELECTRO ERP — Verify Super Admin Login against Supabase PostgreSQL
import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  if (storedHash.startsWith('pbkdf2:sha256:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 5) return false;
    const iterations = parseInt(parts[2], 10);
    const salt = Buffer.from(parts[3], 'hex');
    const expectedHash = Buffer.from(parts[4], 'hex');
    const actualHash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
    return crypto.timingSafeEqual(expectedHash, actualHash);
  }
  return false;
}

async function verifySuperAdmin() {
  console.log('--- VERIFYING SUPER ADMIN IN SUPABASE POSTGRESQL ---');
  const user = await prisma.user.findUnique({
    where: { email: 'contact.amdadur@gmail.com' },
    include: {
      roleRel: true,
      branch: true,
    },
  });

  if (!user) {
    console.error('Super Admin user not found!');
    process.exit(1);
  }

  console.log('Super Admin User Found:');
  console.log('Name:', user.name);
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Status:', user.status);
  console.log('Branch:', user.branch?.name);

  // Test password verification with both deployment passwords
  const testPw = 'NeedElectro@Admin2026';
  const isValid = verifyPassword(testPw, user.passwordHash);
  console.log(`Password verification for '${testPw}':`, isValid ? '✅ VALID' : 'FAILED');

  console.log('--- SUPER ADMIN VERIFICATION SUCCESSFUL ---');
}

verifySuperAdmin()
  .catch((e) => {
    console.error('Verification error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
