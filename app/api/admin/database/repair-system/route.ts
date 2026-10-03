// NEED ELECTRO ERP — Auto-Repair & System Table Seed API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import { SYSTEM_PERMISSIONS } from '../seed-permissions/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Super Admin clearance required.' }, { status: 403 });
  }

  try {
    const summary: Record<string, string> = {};

    // 1. Sync all Permissions
    for (const p of SYSTEM_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { id: p.id },
        update: p,
        create: p,
      });
    }
    const totalPermissions = await prisma.permission.count();
    summary.permissions = `Synchronized ${totalPermissions} permissions`;

    // 2. Default System Roles
    const DEFAULT_ROLES = [
      {
        id: 'role-superadmin',
        name: 'Super Administrator',
        code: 'SUPER_ADMIN',
        description: 'Full unconstrained system authority and security management.',
        isSystem: true,
        permissions: ['*'],
        isActive: true,
      },
      {
        id: 'role-admin',
        name: 'Administrator',
        code: 'ADMIN',
        description: 'Complete operations, branch, inventory, sales, and financial reporting authority.',
        isSystem: true,
        permissions: SYSTEM_PERMISSIONS.filter(p => p.id !== 'perm_backup_manage').map(p => `${p.module}.${p.action}`),
        isActive: true,
      },
      {
        id: 'role-manager',
        name: 'Branch Manager',
        code: 'MANAGER',
        description: 'Supervises branch sales, customer credit, EMI approvals, and inventory transfers.',
        isSystem: true,
        permissions: [
          'dashboard.view', 'sales.view', 'sales.create', 'sales.apply_discount', 'sales.return',
          'emi.view', 'emi.create', 'emi.collect',
          'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.manage_serials',
          'purchases.view', 'purchases.create',
          'products.view', 'products.create', 'products.edit',
          'customers.view', 'customers.create', 'customers.merge',
          'suppliers.view', 'suppliers.manage',
          'service.view', 'service.manage',
          'warranty.view', 'warranty.process_claims',
          'expenses.view', 'expenses.create',
          'reports.view', 'reports.export',
          'employees.view',
          'cash.view', 'cash.collect', 'cash.count', 'cash.report'
        ],
        isActive: true,
      },
      {
        id: 'role-sales',
        name: 'Sales Executive',
        code: 'SALES',
        description: 'Counter POS checkout, customer inquiries, and EMI installment collections.',
        isSystem: true,
        permissions: [
          'dashboard.view', 'sales.view', 'sales.create',
          'emi.view', 'emi.collect',
          'inventory.view', 'products.view',
          'customers.view', 'customers.create',
          'service.view', 'warranty.view',
          'cash.view', 'cash.collect'
        ],
        isActive: true,
      },
      {
        id: 'role-accountant',
        name: 'Senior Accountant',
        code: 'ACCOUNTANT',
        description: 'Financial ledgers, accounts receivable, accounts payable, and tax records.',
        isSystem: true,
        permissions: [
          'dashboard.view', 'dashboard.view_profit', 'sales.view', 'emi.view', 'emi.collect',
          'purchases.view', 'suppliers.view', 'suppliers.manage',
          'accounting.view', 'accounting.transfer_funds', 'accounting.manage_investments',
          'expenses.view', 'expenses.create', 'reports.view', 'reports.export',
          'cash.view', 'cash.create', 'cash.collect', 'cash.payment', 'cash.transfer', 'cash.adjust', 'cash.count', 'cash.report', 'cash.export'
        ],
        isActive: true,
      },
      {
        id: 'role-inventory',
        name: 'Inventory Specialist',
        code: 'INVENTORY',
        description: 'Serial tracking, warehouse movements, and physical stock audits.',
        isSystem: true,
        permissions: [
          'dashboard.view', 'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.manage_serials',
          'products.view', 'products.create', 'products.edit', 'purchases.view', 'purchases.create',
          'suppliers.view', 'warranty.view'
        ],
        isActive: true,
      },
      {
        id: 'role-technician',
        name: 'Service Technician',
        code: 'TECHNICIAN',
        description: 'Device hardware diagnostics, warranty inspections, and repair jobs.',
        isSystem: true,
        permissions: [
          'dashboard.view', 'service.view', 'service.manage', 'warranty.view', 'warranty.process_claims',
          'inventory.view', 'products.view'
        ],
        isActive: true,
      },
      {
        id: 'role-investor',
        name: 'Investor',
        code: 'INVESTOR',
        description: 'Dedicated Investor Portal access for viewing investments and returns.',
        isSystem: true,
        permissions: ['investor.portal', 'investor.view'],
        isActive: true,
      }
    ];

    for (const r of DEFAULT_ROLES) {
      await prisma.role.upsert({
        where: { code: r.code },
        update: {
          name: r.name,
          description: r.description,
          permissions: r.permissions,
          isSystem: r.isSystem,
          isActive: r.isActive,
        },
        create: {
          id: r.id,
          name: r.name,
          code: r.code,
          description: r.description,
          permissions: r.permissions,
          isSystem: r.isSystem,
          isActive: r.isActive,
        },
      });
    }
    const rolesCount = await prisma.role.count();
    summary.roles = `Verified ${rolesCount} system & custom roles`;

    // 3. Ensure System Settings exist
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      await prisma.systemSettings.create({
        data: {
          id: 'main',
          companyName: 'NEED ELECTRO',
          companyTagline: 'Trusted Electrical & Technological Solutions',
          phone: '+880 1733-983752',
          email: 'contact.amdadur@gmail.com',
          website: 'https://needelectroerp.vercel.app',
          address: 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
          binNumber: 'BIN-NEED-2026-BD',
          invoicePrefix: 'INV-2026-',
          emiPrefix: 'EMI-2026-',
          currencyCode: 'BDT',
          currencySymbol: '৳',
          defaultVatPercent: new Prisma.Decimal(5),
          theme: 'dark',
          accentColor: '#008CFF',
        }
      });
      summary.settings = 'Initialized default System Settings';
    } else {
      summary.settings = 'System Settings verified';
    }

    // 4. Ensure POS Settings exist
    const posSettings = await prisma.posSettings.findUnique({ where: { id: 'main' } });
    if (!posSettings) {
      await prisma.posSettings.create({
        data: {
          id: 'main',
          invoicePrefix: 'INV-2026-',
          nextInvoiceNumber: 1001,
          returnWindowDays: 7,
          enablePosDiscounts: true,
          maxDiscountPercent: new Prisma.Decimal(15),
          enableCreditSales: true,
          requireCustomerPhone: true,
          taxPercent: new Prisma.Decimal(5),
          printLogoOnReceipt: true,
          printWarrantyOnReceipt: true,
        }
      });
      summary.pos = 'Initialized default POS Settings';
    } else {
      summary.pos = 'POS Settings verified';
    }

    // 5. Ensure Inventory Rules exist
    const invRules = await prisma.inventoryRules.findUnique({ where: { id: 'main' } });
    if (!invRules) {
      await prisma.inventoryRules.create({
        data: {
          id: 'main',
          lowStockThresholdDefault: 3,
          enableOutOfStockWarnings: true,
          allowNegativeStock: false,
          requireSerialOnPurchase: true,
          requireSerialOnSale: true,
          autoGenerateSerials: true,
          defaultSerialPrefix: 'NEC-SN-',
        }
      });
      summary.inventory = 'Initialized default Inventory Rules';
    } else {
      summary.inventory = 'Inventory Rules verified';
    }

    return NextResponse.json({
      success: true,
      message: 'Database system self-repair & permission synchronization completed successfully.',
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'System repair failed.',
    }, { status: 500 });
  }
}
