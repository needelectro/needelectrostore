// NEED ELECTRO ERP — Automated Super Admin & System Initialization Seed (ESM)
import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `pbkdf2:sha256:100000:${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function main() {
  console.log('--- INITIALIZING NEED ELECTRO ERP SYSTEM ---');

  // 1. Ensure System Settings exist
  await prisma.systemSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      companyName: 'NEED ELECTRO',
      companyTagline: 'Trusted Electrical & Technological Solutions',
      sisterConcern: 'Amdadur Technology & Electrical Enterprise',
      mainBranchName: 'NEED ELECTRO Main Showroom',
      phone: '+880 1733-983752',
      email: 'info.needelectro@gmail.com',
      website: 'https://needelectroerp.vercel.app',
      address: 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
      binNumber: 'BIN-NEED-2026-BD',
      currencySymbol: '৳',
      currencyCode: 'BDT',
      theme: 'dark',
    },
  });

  // 2. Ensure Main Branch exists
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'DHK-MAIN' },
    update: {},
    create: {
      id: 'branch-main-1',
      name: 'NEED ELECTRO Main Showroom (Moulvibazar)',
      code: 'DHK-MAIN',
      address: 'NEED ELECTRO Building, Central Road, Moulvibazar',
      phone: '+880 1733-983752',
      email: 'info.needelectro@gmail.com',
      isWarehouse: false,
      active: true,
    },
  });

  // 3. Ensure Super Admin Role exists with all permissions
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {},
    create: {
      id: 'role-superadmin',
      name: 'Super Administrator',
      code: 'SUPER_ADMIN',
      description: 'Full unconstrained system authority over all ERP operations and settings',
      isSystem: true,
      permissions: ['*'],
      isActive: true,
    },
  });

  // 3b. Ensure Investor Role exists for dedicated investor portal logins
  await prisma.role.upsert({
    where: { code: 'INVESTOR' },
    update: {},
    create: {
      id: 'role-investor',
      name: 'Investor',
      code: 'INVESTOR',
      description: 'Dedicated Investor Portal access for viewing investments and returns',
      isSystem: true,
      permissions: ['investor.portal', 'investor.view'],
      isActive: true,
    },
  });

  // 4. Initialize Super Admin Account
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'contact.amdadur@gmail.com';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Amdadur Rahman';
  const deploymentSecret = process.env.SUPER_ADMIN_PASSWORD || 'NeedElectro@2026';

  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: superAdminEmail },
        { role: 'SUPER_ADMIN' },
      ],
    },
  });

  if (!existingSuperAdmin) {
    console.log(`Creating initial Super Admin: ${superAdminName} (${superAdminEmail})`);
    const passwordHash = hashPassword(deploymentSecret);

    const user = await prisma.user.create({
      data: {
        id: 'user-superadmin-1',
        name: superAdminName,
        email: superAdminEmail,
        username: 'superadmin',
        role: 'SUPER_ADMIN',
        roleId: superAdminRole.id,
        branchId: mainBranch.id,
        primaryBranchId: mainBranch.id,
        allowedBranchIds: [mainBranch.id],
        phone: process.env.SUPER_ADMIN_PHONE || '+880 1733-983752',
        passwordHash,
        status: 'ACTIVE',
        mustChangePassword: !process.env.SUPER_ADMIN_PASSWORD,
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        id: 'audit-init-' + Date.now(),
        userId: user.id,
        userName: user.name,
        action: 'SUPER_ADMIN_INITIALIZATION',
        module: 'SECURITY',
        recordId: user.id,
        details: 'Initial Super Admin account provisioned securely through system seed.',
      },
    });

    // Mark setup status
    await prisma.setupStatus.upsert({
      where: { id: 'main' },
      update: {
        initialSetupCompleted: true,
        setupDate: new Date(),
        initializedBy: user.email,
      },
      create: {
        id: 'main',
        initialSetupCompleted: true,
        setupDate: new Date(),
        initializedBy: user.email,
      },
    });

    console.log('Super Admin successfully created.');
  } else {
    console.log(`Super Admin already exists: ${existingSuperAdmin.name} (${existingSuperAdmin.email})`);
  }

  console.log('--- SYSTEM INITIALIZATION COMPLETED ---');
}

main()
  .catch((e) => {
    console.error('Initialization error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
