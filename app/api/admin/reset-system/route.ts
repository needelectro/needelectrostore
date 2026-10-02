// NEED ELECTRO ERP — Super Admin Data Reset & Platform Purge Engine
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_ACCOUNTS = [
  {
    id: "acc-1",
    name: "Main Cash Drawer (Moulvibazar Showroom)",
    type: "CASH",
    accountNumber: "CASH-MB-01",
    bankName: "Cash in Hand Vault",
    branchName: "Moulvibazar Main",
    balance: 0,
    currency: "BDT",
    isActive: true
  },
  {
    id: "acc-ebl-amdadur",
    name: "Eastern Bank - Amdadur Rahman",
    type: "BANK",
    accountNumber: "EBL-AMDADUR",
    bankName: "Eastern Bank PLC",
    branchName: "Moulvibazar Branch",
    balance: 0,
    currency: "BDT",
    isActive: true
  },
  {
    id: "acc-pubali-amdadur",
    name: "Pubali Bank - Amdadur Rahman",
    type: "BANK",
    accountNumber: "PUBALI-AMDADUR",
    bankName: "Pubali Bank PLC",
    branchName: "Moulvibazar Branch",
    balance: 0,
    currency: "BDT",
    isActive: true
  },
  {
    id: "acc-pubali-fulori",
    name: "Pubali Bank - Fulori Miha",
    type: "BANK",
    accountNumber: "PUBALI-FULORI",
    bankName: "Pubali Bank PLC",
    branchName: "Moulvibazar Branch",
    balance: 0,
    currency: "BDT",
    isActive: true
  },
  {
    id: "acc-bkash-primary",
    name: "bKash Payment (01884599271)",
    type: "MOBILE_BANKING",
    accountNumber: "01884599271",
    bankName: "bKash Limited",
    branchName: "Official Payment Wallet",
    balance: 0,
    currency: "BDT",
    isActive: true
  },
  {
    id: "acc-nagad-primary",
    name: "Nagad Payment Wallet (01733-983752)",
    type: "MOBILE_BANKING",
    accountNumber: "01733-983752",
    bankName: "Nagad (Bangladesh Post Office)",
    branchName: "Official Merchant Wallet",
    balance: 0,
    currency: "BDT",
    isActive: true
  }
];

const DEFAULT_PAYMENT_METHODS = [
  { id: 'pm-1', name: 'Cash', code: 'CASH', type: 'CASH', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: 0, instructions: 'Accepted at counter. Verify currency security strips.', isActive: true, sortOrder: 1 },
  { id: 'pm-2', name: 'bKash Payment (01884599271)', code: 'BKASH', type: 'MFS', linkedAccountId: 'acc-bkash-primary', accountNumber: '01884599271', chargePercent: 0, instructions: 'Payment / Send Money to 01884599271. Verify TrxID at billing counter.', isActive: true, sortOrder: 2 },
  { id: 'pm-3', name: 'Eastern Bank - Amdadur Rahman', code: 'EASTERN_BANK', type: 'BANK', linkedAccountId: 'acc-ebl-amdadur', accountNumber: 'EBL-AMDADUR', chargePercent: 0, instructions: 'BEFTN / NPSB / RTGS transfer to Eastern Bank — Account: Amdadur Rahman.', isActive: true, sortOrder: 3 },
  { id: 'pm-4', name: 'Pubali Bank - Amdadur Rahman', code: 'PUBALI_AMDADUR', type: 'BANK', linkedAccountId: 'acc-pubali-amdadur', accountNumber: 'PUBALI-AMDADUR', chargePercent: 0, instructions: 'BEFTN / NPSB / RTGS transfer to Pubali Bank — Account: Amdadur Rahman.', isActive: true, sortOrder: 4 },
  { id: 'pm-5', name: 'Pubali Bank - Fulori Miha', code: 'PUBALI_FULORI', type: 'BANK', linkedAccountId: 'acc-pubali-fulori', accountNumber: 'PUBALI-FULORI', chargePercent: 0, instructions: 'BEFTN / NPSB / RTGS transfer to Pubali Bank — Account: Fulori Miha.', isActive: true, sortOrder: 5 },
  { id: 'pm-6', name: 'Credit / Debit Card (POS)', code: 'CARD_POS', type: 'CARD', linkedAccountId: 'acc-ebl-amdadur', accountNumber: '', chargePercent: 1.5, instructions: 'Visa, MasterCard, Amex via counter POS swipe.', isActive: true, sortOrder: 6 },
  { id: 'pm-7', name: 'Credit / Customer Due', code: 'CREDIT_SALE', type: 'OTHER', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: 0, instructions: 'Allowed only for pre-approved credit accounts.', isActive: true, sortOrder: 7 },
  { id: 'pm-8', name: 'Laptop EMI Facility', code: 'EMI_SALE', type: 'OTHER', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: 0, instructions: 'Financed via Need Electro EMI installment system.', isActive: true, sortOrder: 8 }
];

export async function POST(req: NextRequest) {
  const user = await requireSuperAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const mode = body.mode || 'CLEAN_BUSINESS_DATA';
    const confirmationKeyword = (body.confirmationKeyword || '').trim();

    if (confirmationKeyword !== 'CONFIRM RESET' && confirmationKeyword !== 'RESET-NEED-ELECTRO') {
      return NextResponse.json(
        { success: false, error: 'Confirmation phrase incorrect. You must type "CONFIRM RESET" to proceed.' },
        { status: 400 }
      );
    }

    const businessTables = [
      'sale_items',
      'sales',
      'product_returns',
      'purchase_items',
      'purchases',
      'supplier_payments',
      'expenses',
      'service_jobs',
      'technicians',
      'warranty_claims',
      'investments',
      'fund_transfers',
      'employees',
      'attendance',
      'inventory_transactions',
      'ledger_entries',
      'other_incomes',
      'owner_withdrawals',
      'cash_adjustments',
      'cash_reconciliations',
      'customer_payments',
      'investors',
      'monthly_settlements',
      'investor_monthly_profits',
      'audit_logs',
      'price_audits',
      'customer_merge_audits',
      'opening_balances',
      'emi_installments',
      'emi_payments',
      'emi_accounts',
      'product_serials',
      'products',
      'customers',
      'suppliers'
    ];

    const purgedTables: string[] = [];

    if (mode === 'FULL_FACTORY_RESET') {
      const fullTables = [
        ...businessTables,
        'sessions',
        'login_history',
        'users',
        'roles',
        'permissions',
        'branch'
      ];

      for (const table of fullTables) {
        try {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
          purgedTables.push(table);
        } catch (e: any) {
          console.warn(`Truncate notice on ${table}:`, e.message);
        }
      }

      await prisma.$executeRawUnsafe(`UPDATE "setup_status" SET "initial_setup_completed" = false;`);

      return NextResponse.json({
        success: true,
        mode: 'FULL_FACTORY_RESET',
        message: 'Full factory reset executed successfully. The platform has been returned to Initial Setup Wizard mode.',
        purgedTables
      });
    }

    // Default mode: CLEAN_BUSINESS_DATA (Clean Business Slate)
    for (const table of businessTables) {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
        purgedTables.push(table);
      } catch (e: any) {
        console.warn(`Truncate notice on ${table}:`, e.message);
      }
    }

    // Reset financial account balances to 0.00
    await prisma.$executeRawUnsafe(`UPDATE "financial_accounts" SET "balance" = 0.00;`);

    // Ensure baseline accounts & payment methods exist
    for (const acc of DEFAULT_ACCOUNTS) {
      await prisma.financialAccount.upsert({
        where: { id: acc.id },
        update: {
          balance: 0.00,
          name: acc.name,
          type: acc.type,
          accountNumber: acc.accountNumber,
          bankName: acc.bankName,
          branchName: acc.branchName,
          currency: acc.currency,
          isActive: acc.isActive
        },
        create: {
          id: acc.id,
          name: acc.name,
          type: acc.type,
          accountNumber: acc.accountNumber,
          bankName: acc.bankName,
          branchName: acc.branchName,
          balance: 0.00,
          currency: acc.currency,
          isActive: acc.isActive
        }
      });
    }

    for (const pm of DEFAULT_PAYMENT_METHODS) {
      await prisma.configurablePaymentMethod.upsert({
        where: { id: pm.id },
        update: pm,
        create: pm
      });
    }

    // Create an audit entry for this reset event
    try {
      await prisma.auditLog.create({
        data: {
          id: 'audit-reset-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'PLATFORM_DATA_RESET',
          module: 'CONTROL_CENTER',
          recordId: 'system',
          details: `Super Admin ${user.name} initiated clean business data reset. Purged ${purgedTables.length} tables. All cash & bank balances reset to ৳0.`
        }
      });
    } catch (e) {
      // Ignored if audit table truncated
    }

    return NextResponse.json({
      success: true,
      mode: 'CLEAN_BUSINESS_DATA',
      message: 'All business and transactional data successfully purged. Accounts reset to ৳0 balance. Super Admin login preserved.',
      purgedTables,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('System reset error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
