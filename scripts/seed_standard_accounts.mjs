import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl
    }
  }
});

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

const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'exp-rent', name: 'Office Rent', code: 'OFFICE_RENT', description: 'Showroom premises rent', isTaxDeductible: true, isActive: true },
  { id: 'exp-elec', name: 'Electricity & Utility', code: 'ELECTRICITY', description: 'BPDB electricity bills', isTaxDeductible: true, isActive: true },
  { id: 'exp-net', name: 'Internet & Communications', code: 'INTERNET', description: 'Fiber line & telephone', isTaxDeductible: true, isActive: true },
  { id: 'exp-sal', name: 'Staff Salaries & Commission', code: 'SALARY', description: 'Monthly employee compensation', isTaxDeductible: true, isActive: true },
  { id: 'exp-trans', name: 'Transport & Courier', code: 'TRANSPORT', description: 'Logistics and fuel', isTaxDeductible: true, isActive: true },
  { id: 'exp-mkt', name: 'Marketing & Advertising', code: 'MARKETING', description: 'Facebook ads & banners', isTaxDeductible: true, isActive: true },
  { id: 'exp-maint', name: 'Maintenance & Repairs', code: 'MAINTENANCE', description: 'Showroom equipment repair', isTaxDeductible: true, isActive: true },
  { id: 'exp-snack', name: 'Office Supplies & Hospitality', code: 'OFFICE_SUPPLIES', description: 'Tea, snacks, stationary', isTaxDeductible: true, isActive: true },
  { id: 'exp-other', name: 'Other Operating Expenses', code: 'OTHER', description: 'Miscellaneous operating costs', isTaxDeductible: true, isActive: true }
];

async function seedDefaults() {
  console.log('Seeding standard financial accounts (balance: 0)...');
  for (const acc of DEFAULT_ACCOUNTS) {
    await prisma.financialAccount.upsert({
      where: { id: acc.id },
      update: {
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
        balance: 0,
        currency: acc.currency,
        isActive: acc.isActive
      }
    });
  }

  console.log('Seeding standard payment methods...');
  for (const pm of DEFAULT_PAYMENT_METHODS) {
    await prisma.configurablePaymentMethod.upsert({
      where: { id: pm.id },
      update: pm,
      create: pm
    });
  }

  console.log('Seeding standard expense categories...');
  for (const exp of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.expenseCategoryConfig.upsert({
      where: { id: exp.id },
      update: exp,
      create: exp
    });
  }

  const accCount = await prisma.financialAccount.count();
  const pmCount = await prisma.configurablePaymentMethod.count();
  const expCount = await prisma.expenseCategoryConfig.count();
  console.log(`Successfully seeded: ${accCount} accounts, ${pmCount} payment methods, ${expCount} expense categories.`);
}

seedDefaults().catch(console.error).finally(() => prisma.$disconnect());
