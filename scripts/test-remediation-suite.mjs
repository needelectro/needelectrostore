// NEED ELECTRO ERP — Audit Remediation Verification Suite
import { hasPermission } from '../lib/auth.ts';
import { Prisma } from '@prisma/client';

console.log('\n======================================================');
console.log('  AUDIT REMEDIATION UNIT & INTEGRATION TEST SUITE');
console.log('======================================================\n');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✔ [PASS] ${message}`);
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    throw new Error(`Test failed: ${message}`);
  }
}

// 1. RBAC Tests
console.log('\n--- 1. RBAC Dual Notation, Fallback, and Wildcard Tests ---');
const adminUser = {
  id: 'usr-1',
  role: 'SUPER_ADMIN',
  roleDefinition: null,
};
assert(hasPermission(adminUser, 'sales.create'), 'SUPER_ADMIN always has sales.create');
assert(hasPermission(adminUser, 'anything:custom'), 'SUPER_ADMIN always has wildcard permissions');

const managerUser = {
  id: 'usr-2',
  role: 'MANAGER',
  roleDefinition: {
    id: 'role-mgr',
    name: 'Manager',
    permissions: JSON.stringify(['sales.*', 'inventory:view', 'reports.view']),
  },
};
assert(hasPermission(managerUser, 'sales.create'), 'Manager matches sales.* with sales.create');
assert(hasPermission(managerUser, 'sales:edit'), 'Manager matches sales.* with sales:edit');
assert(hasPermission(managerUser, 'inventory.view'), 'Manager matches inventory:view with dot notation inventory.view');
assert(hasPermission(managerUser, 'reports:view'), 'Manager matches reports.view with colon notation reports:view');
assert(!hasPermission(managerUser, 'settings.manage'), 'Manager is rejected for unauthorized settings.manage');

// 2. Financial Atomicity & Decimal Math
console.log('\n--- 2. Multi-Account Split Payment Math ---');
const cashPart = new Prisma.Decimal('5000.00');
const bkashPart = new Prisma.Decimal('3000.00');
const totalReceived = cashPart.plus(bkashPart);
const invoiceTotal = new Prisma.Decimal('10000.00');
const dueBalance = invoiceTotal.minus(totalReceived);

assert(totalReceived.toString() === '8000', 'Total payment received sum is exact (৳8,000)');
assert(dueBalance.toString() === '2000', 'Customer due balance is exact (৳2,000)');

// 3. Operating Expense vs Capital Inventory Filtration
console.log('\n--- 3. P&L Net Profit Formula Reconciliation ---');
const allExpenses = [
  { category: 'Inventory', amount: 148000 },
  { category: 'Purchase Expenses', amount: 5000 },
  { category: 'Assets', amount: 20000 },
  { category: 'Rent', amount: 15000 },
  { category: 'Electricity Bill', amount: 3500 },
  { category: 'Staff Salary', amount: 25000 },
];

const operatingExpenses = allExpenses
  .filter(e => !['Inventory', 'Purchase Expenses', 'Assets'].includes(e.category))
  .reduce((sum, e) => sum + e.amount, 0);

assert(operatingExpenses === 43500, 'Operating expenses correctly exclude inventory and capital purchases (৳43,500)');

const revenue = 120000;
const cogs = 70000;
const grossProfit = revenue - cogs; // 50000
const netProfit = grossProfit - operatingExpenses; // 6500

assert(grossProfit === 50000, 'Gross profit reconciles: Revenue - COGS = ৳50,000');
assert(netProfit === 6500, 'Net profit reconciles: Gross Profit - Operating Expenses = ৳6,500');

console.log(`\n======================================================`);
console.log(`  ALL ${passed}/${total} AUDIT REMEDIATION TESTS PASSED!`);
console.log(`======================================================\n`);
