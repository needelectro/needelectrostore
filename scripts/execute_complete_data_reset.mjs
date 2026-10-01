// NEED ELECTRO ERP — COMPLETE MASTER DATA RESET
// Resets all business, inventory, financial, and transactional data to a completely clean slate
// while preserving software code, database schema, authentication, roles, settings, and ERP functionality.

import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function executeCompleteDataReset() {
  console.log('================================================================');
  console.log('  NEED ELECTRO ERP — EXECUTING COMPLETE DATA RESET');
  console.log('  Target: Supabase PostgreSQL Live Database');
  console.log('================================================================\n');

  // Step 1: List of all commercial transactional & business entity tables to purge
  const tablesToTruncate = [
    'sale_items',
    'sales',
    'purchase_items',
    'purchases',
    'supplier_payments',
    'customer_payments',
    'emi_payments',
    'emi_installments',
    'emi_accounts',
    'product_serials',
    'products',
    'product_returns',
    'service_jobs',
    'technicians',
    'service_categories_config',
    'warranty_claims',
    'warranty_rules_config',
    'expenses',
    'expense_categories_config',
    'investor_monthly_profits',
    'monthly_settlements',
    'investments',
    'investors',
    'fund_transfers',
    'owner_withdrawals',
    'other_incomes',
    'customers',
    'suppliers',
    'customer_merge_audits',
    'attendance',
    'employees',
    'inventory_transactions',
    'ledger_entries',
    'price_audits',
    'opening_balances',
    'cash_adjustments',
    'cash_reconciliations',
    'database_backups',
    'login_history',
    'categories_config',
    'brands_config',
    'notification_templates_config',
    'audit_logs',
  ];

  console.log('[1/5] Truncating business & transactional tables with CASCADE...');
  for (const table of tablesToTruncate) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`  ✔ Truncated "${table}"`);
    } catch (err) {
      console.warn(`  ⚠ Truncate note for "${table}": ${err.message}`);
    }
  }

  // Step 2: Ensure System Configuration & Settings
  console.log('\n[2/5] Initializing & validating System Configurations...');

  // 2a. System Settings
  await prisma.systemSettings.upsert({
    where: { id: 'main' },
    update: {
      companyName: 'NEED ELECTRO',
      companyTagline: 'Trusted Electrical & Technological Solutions',
      sisterConcern: 'Amdadur Technology & Electrical Enterprise',
      mainBranchName: 'NEED ELECTRO Main Showroom',
      phone: '+880 1733-983752',
      email: 'contact.amdadur@gmail.com',
      website: 'https://needelectroerp.vercel.app',
      address: 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
      binNumber: 'BIN-NEED-2026-BD',
      currencySymbol: '৳',
      currencyCode: 'BDT',
      theme: 'dark',
    },
    create: {
      id: 'main',
      companyName: 'NEED ELECTRO',
      companyTagline: 'Trusted Electrical & Technological Solutions',
      sisterConcern: 'Amdadur Technology & Electrical Enterprise',
      mainBranchName: 'NEED ELECTRO Main Showroom',
      phone: '+880 1733-983752',
      email: 'contact.amdadur@gmail.com',
      website: 'https://needelectroerp.vercel.app',
      address: 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh',
      binNumber: 'BIN-NEED-2026-BD',
      currencySymbol: '৳',
      currencyCode: 'BDT',
      theme: 'dark',
    },
  });
  console.log('  ✔ System Settings initialized.');

  // 2b. POS Settings
  await prisma.posSettings.upsert({
    where: { id: 'main' },
    update: {
      invoicePrefix: 'INV-2026-',
      nextInvoiceNumber: 1001,
      returnWindowDays: 7,
      enablePosDiscounts: true,
      maxDiscountPercent: 15.0,
      enableCreditSales: true,
      requireCustomerPhone: true,
      taxPercent: 5.0,
      printLogoOnReceipt: true,
      printWarrantyOnReceipt: true,
    },
    create: {
      id: 'main',
      invoicePrefix: 'INV-2026-',
      nextInvoiceNumber: 1001,
      returnWindowDays: 7,
      enablePosDiscounts: true,
      maxDiscountPercent: 15.0,
      enableCreditSales: true,
      requireCustomerPhone: true,
      taxPercent: 5.0,
      printLogoOnReceipt: true,
      printWarrantyOnReceipt: true,
    },
  });
  console.log('  ✔ POS Settings initialized.');

  // 2c. Inventory Rules
  await prisma.inventoryRules.upsert({
    where: { id: 'main' },
    update: {
      lowStockThresholdDefault: 3,
      enableOutOfStockWarnings: true,
      allowNegativeStock: false,
      requireSerialOnPurchase: true,
      requireSerialOnSale: true,
      autoGenerateSerials: true,
      defaultSerialPrefix: 'NEC-SN-',
    },
    create: {
      id: 'main',
      lowStockThresholdDefault: 3,
      enableOutOfStockWarnings: true,
      allowNegativeStock: false,
      requireSerialOnPurchase: true,
      requireSerialOnSale: true,
      autoGenerateSerials: true,
      defaultSerialPrefix: 'NEC-SN-',
    },
  });
  console.log('  ✔ Inventory Rules initialized.');

  // 2d. Setup Status
  await prisma.setupStatus.upsert({
    where: { id: 'main' },
    update: {
      initialSetupCompleted: true,
      setupDate: new Date(),
      initializedBy: 'contact.amdadur@gmail.com',
    },
    create: {
      id: 'main',
      initialSetupCompleted: true,
      setupDate: new Date(),
      initializedBy: 'contact.amdadur@gmail.com',
    },
  });
  console.log('  ✔ Setup Status set to completed.');

  // 2e. Main Branch
  await prisma.branch.upsert({
    where: { code: 'DHK-MAIN' },
    update: {
      name: 'NEED ELECTRO Main Showroom (Moulvibazar)',
      address: 'NEED ELECTRO Building, Central Road, Moulvibazar',
      phone: '+880 1733-983752',
      email: 'contact.amdadur@gmail.com',
      isWarehouse: false,
      active: true,
    },
    create: {
      id: 'branch-main-1',
      name: 'NEED ELECTRO Main Showroom (Moulvibazar)',
      code: 'DHK-MAIN',
      address: 'NEED ELECTRO Building, Central Road, Moulvibazar',
      phone: '+880 1733-983752',
      email: 'contact.amdadur@gmail.com',
      isWarehouse: false,
      active: true,
    },
  });
  console.log('  ✔ Main Branch verified.');

  // 2f. Super Admin Role
  await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {
      name: 'Super Administrator',
      description: 'Full unconstrained system authority over all ERP operations and settings',
      isSystem: true,
      permissions: ['*'],
      isActive: true,
    },
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
  console.log('  ✔ Super Admin Role verified.');

  // Step 3: Clean Financial Accounts & Payment Methods (Opening Balance = ৳0.00)
  console.log('\n[3/5] Initializing clean Financial Accounts (Opening Balance = ৳0.00)...');

  // Purge any existing methods and accounts first to guarantee 0 foreign keys / orphans
  await prisma.configurablePaymentMethod.deleteMany({});
  await prisma.financialAccount.deleteMany({});

  const standardAccounts = [
    {
      id: 'acc-1',
      name: 'Main Cash Drawer (Moulvibazar Showroom)',
      type: 'CASH',
      accountNumber: 'CASH-MB-01',
      bankName: 'Cash Vault',
      branchName: 'Moulvibazar Showroom',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-ebl-amdadur',
      name: 'Eastern Bank - Amdadur Rahman',
      type: 'BANK',
      accountNumber: 'EBL-AMDADUR',
      bankName: 'Eastern Bank PLC',
      branchName: 'Moulvibazar Branch',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-pubali-amdadur',
      name: 'Pubali Bank - Amdadur Rahman',
      type: 'BANK',
      accountNumber: 'PUBALI-AMDADUR',
      bankName: 'Pubali Bank PLC',
      branchName: 'Moulvibazar Branch',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-pubali-fulori',
      name: 'Pubali Bank - Fulori Miha',
      type: 'BANK',
      accountNumber: 'PUBALI-FULORI',
      bankName: 'Pubali Bank PLC',
      branchName: 'Moulvibazar Branch',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-bkash-primary',
      name: 'bKash Payment (01884599271)',
      type: 'MOBILE_BANKING',
      accountNumber: '01884599271',
      bankName: 'bKash Limited',
      branchName: 'Official Payment Wallet',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-nagad-primary',
      name: 'Nagad Payment Wallet (01733-983752)',
      type: 'MOBILE_BANKING',
      accountNumber: '01733-983752',
      bankName: 'Nagad (Bangladesh Post Office)',
      branchName: 'Showroom Merchant Wallet',
      balance: 0.00,
      currency: 'BDT',
      isActive: true,
    },
  ];

  for (const acc of standardAccounts) {
    await prisma.financialAccount.create({ data: acc });
    console.log(`  ✔ Created Financial Account "${acc.name}" with balance ৳0.00`);
  }

  // Standard Payment Methods
  const standardPaymentMethods = [
    {
      id: 'pm-1',
      name: 'Cash',
      code: 'CASH',
      type: 'CASH',
      linkedAccountId: 'acc-1',
      accountNumber: '',
      chargePercent: 0,
      instructions: 'Accepted at counter. Verify currency security strips.',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'pm-2',
      name: 'bKash Payment (01884599271)',
      code: 'BKASH',
      type: 'MOBILE_BANKING',
      linkedAccountId: 'acc-bkash-primary',
      accountNumber: '01884599271',
      chargePercent: 0,
      instructions: 'Payment / Send Money to 01884599271. Verify TrxID at counter.',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'pm-nagad',
      name: 'Nagad',
      code: 'NAGAD',
      type: 'MOBILE_BANKING',
      linkedAccountId: 'acc-nagad-primary',
      accountNumber: '01733-983752',
      chargePercent: 0,
      instructions: 'Send money or merchant pay to 01733-983752',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'pm-3',
      name: 'Eastern Bank - Amdadur Rahman',
      code: 'EASTERN_BANK',
      type: 'BANK',
      linkedAccountId: 'acc-ebl-amdadur',
      accountNumber: 'EBL-AMDADUR',
      chargePercent: 0,
      instructions: 'BEFTN / NPSB / RTGS transfer to Eastern Bank — Account: Amdadur Rahman.',
      isActive: true,
      sortOrder: 4,
    },
    {
      id: 'pm-4',
      name: 'Pubali Bank - Amdadur Rahman',
      code: 'PUBALI_AMDADUR',
      type: 'BANK',
      linkedAccountId: 'acc-pubali-amdadur',
      accountNumber: 'PUBALI-AMDADUR',
      chargePercent: 0,
      instructions: 'BEFTN / NPSB / RTGS transfer to Pubali Bank — Account: Amdadur Rahman.',
      isActive: true,
      sortOrder: 5,
    },
    {
      id: 'pm-5',
      name: 'Pubali Bank - Fulori Miha',
      code: 'PUBALI_FULORI',
      type: 'BANK',
      linkedAccountId: 'acc-pubali-fulori',
      accountNumber: 'PUBALI-FULORI',
      chargePercent: 0,
      instructions: 'BEFTN / NPSB / RTGS transfer to Pubali Bank — Account: Fulori Miha.',
      isActive: true,
      sortOrder: 6,
    },
    {
      id: 'pm-6',
      name: 'Credit / Debit Card (POS)',
      code: 'CARD_POS',
      type: 'CARD',
      linkedAccountId: 'acc-ebl-amdadur',
      accountNumber: '',
      chargePercent: 1.5,
      instructions: 'Visa, MasterCard, Amex via counter POS swipe terminal.',
      isActive: true,
      sortOrder: 7,
    },
    {
      id: 'pm-7',
      name: 'Credit / Customer Due',
      code: 'CREDIT_SALE',
      type: 'OTHER',
      linkedAccountId: 'acc-1',
      accountNumber: '',
      chargePercent: 0,
      instructions: 'Allowed only for pre-approved credit customers.',
      isActive: true,
      sortOrder: 8,
    },
    {
      id: 'pm-8',
      name: 'Laptop EMI Facility',
      code: 'EMI_SALE',
      type: 'OTHER',
      linkedAccountId: 'acc-1',
      accountNumber: '',
      chargePercent: 0,
      instructions: 'Financed via Need Electro EMI installment system.',
      isActive: true,
      sortOrder: 9,
    },
  ];

  for (const pm of standardPaymentMethods) {
    await prisma.configurablePaymentMethod.create({ data: pm });
    console.log(`  ✔ Created Payment Method "${pm.name}" (${pm.code})`);
  }

  // Step 4: Record Initial Audit Log for Clean State
  console.log('\n[4/5] Recording system audit trail...');
  await prisma.auditLog.create({
    data: {
      id: 'audit-reset-' + Date.now(),
      userId: 'user-superadmin-1',
      userName: 'Amdadur Rahman',
      action: 'COMPLETE_DATA_RESET',
      module: 'DATABASE',
      recordId: 'main',
      details: 'All commercial transactional, product, customer, supplier, and inventory data reset to clean production state. Financial accounts reset to ৳0.00.',
      ipAddress: '127.0.0.1',
    },
  });
  console.log('  ✔ Audit trail logged.');

  // Step 5: Full Database Audit & Verification
  console.log('\n[5/5] Performing comprehensive verification audit...');
  const auditReport = {
    users: await prisma.user.count(),
    branches: await prisma.branch.count(),
    roles: await prisma.role.count(),
    systemSettings: await prisma.systemSettings.count(),
    posSettings: await prisma.posSettings.count(),
    inventoryRules: await prisma.inventoryRules.count(),
    setupStatus: (await prisma.setupStatus.findUnique({ where: { id: 'main' } }))?.initialSetupCompleted ?? false,
    financialAccountsCount: await prisma.financialAccount.count(),
    paymentMethodsCount: await prisma.configurablePaymentMethod.count(),
    products: await prisma.product.count(),
    productSerials: await prisma.productSerial.count(),
    customers: await prisma.customer.count(),
    suppliers: await prisma.supplier.count(),
    sales: await prisma.sale.count(),
    saleItems: await prisma.saleItem.count(),
    purchases: await prisma.purchase.count(),
    purchaseItems: await prisma.purchaseItem.count(),
    expenses: await prisma.expense.count(),
    investments: await prisma.investment.count(),
    ledgerEntries: await prisma.ledgerEntry.count(),
    inventoryTransactions: await prisma.inventoryTransaction.count(),
    customerPayments: await prisma.customerPayment.count(),
    supplierPayments: await prisma.supplierPayment.count(),
    cashAdjustments: await prisma.cashAdjustment.count(),
    cashReconciliations: await prisma.cashReconciliation.count(),
    otherIncomes: await prisma.otherIncome.count(),
    ownerWithdrawals: await prisma.ownerWithdrawal.count(),
  };

  console.table(auditReport);

  // Financial Balances Audit
  const accounts = await prisma.financialAccount.findMany();
  const balances = accounts.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    balance: Number(a.balance),
  }));
  console.log('\nFinancial Accounts Balances:');
  console.table(balances);

  const totalCash = balances.filter(b => b.type === 'CASH').reduce((s, b) => s + b.balance, 0);
  const totalBank = balances.filter(b => b.type === 'BANK').reduce((s, b) => s + b.balance, 0);
  const totalMobile = balances.filter(b => b.type === 'MOBILE_BANKING').reduce((s, b) => s + b.balance, 0);
  const totalLiquid = totalCash + totalBank + totalMobile;

  console.log(`\n================================================================`);
  console.log(`  VERIFICATION RESULTS:`);
  console.log(`  Cash Balance:       ৳${totalCash.toFixed(2)}`);
  console.log(`  Bank Balance:       ৳${totalBank.toFixed(2)}`);
  console.log(`  Mobile Banking:     ৳${totalMobile.toFixed(2)}`);
  console.log(`  Total Liquid Asset: ৳${totalLiquid.toFixed(2)}`);
  console.log(`  Products Count:     ${auditReport.products}`);
  console.log(`  Customers Count:    ${auditReport.customers}`);
  console.log(`  Suppliers Count:    ${auditReport.suppliers}`);
  console.log(`  Sales Count:        ${auditReport.sales}`);
  console.log(`  Purchases Count:    ${auditReport.purchases}`);
  console.log(`  Expenses Count:     ${auditReport.expenses}`);
  console.log(`  Ledger Entries:     ${auditReport.ledgerEntries}`);
  console.log(`================================================================\n`);
}

executeCompleteDataReset()
  .catch(err => {
    console.error('Data reset fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
