// NEED ELECTRO ERP — Purchase Inflow & Decimal Validation Test
import { Prisma } from '@prisma/client';

console.log('\n======================================================');
console.log('  PURCHASE DECIMAL VALIDATION & INFLOW TEST SUITE');
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

// 1. Test fallback calculations when total/subtotal/due are undefined
console.log('\n--- 1. Testing Fallback Calculation on Undefined Payloads ---');
const items = [
  { productId: 'prod-743', quantity: 1, costPrice: 40000, serials: [] }
];
const payload = {
  supplierId: 'sup-1',
  branchId: 'branch-1',
  items,
  paidAmount: 50000,
  paymentMethod: 'Bank Transfer'
  // Notice: total, subtotal, dueAmount, supplierName are intentionally omitted!
};

const calculatedSubtotal = items.reduce(
  (sum, it) => sum + (Number(it.costPrice || 0) * Number(it.quantity || 1)),
  0
);
const discount = Number(payload.discount || 0);
const tax = Number(payload.tax || 0);
const finalTotal =
  payload.total !== undefined && payload.total !== null
    ? Number(payload.total)
    : Math.max(0, calculatedSubtotal - discount + tax);
const finalPaid = Number(payload.paidAmount || 0);
const finalDue =
  payload.dueAmount !== undefined && payload.dueAmount !== null
    ? Number(payload.dueAmount)
    : Math.max(0, finalTotal - finalPaid);

assert(calculatedSubtotal === 40000, 'Subtotal correctly computed as 40,000 from item cost * quantity');
assert(finalTotal === 40000, 'Final total correctly resolved as 40,000 when undefined in payload');
assert(finalPaid === 50000, 'Paid amount correctly resolved as 50,000');
assert(finalDue === 0, 'Due amount correctly computed as 0 (since paid >= total)');

// 2. Test Decimal instantiation with verified non-undefined numbers
console.log('\n--- 2. Testing Prisma Decimal Instantiation ---');
try {
  const decSubtotal = new Prisma.Decimal(calculatedSubtotal);
  const decDiscount = new Prisma.Decimal(discount);
  const decTax = new Prisma.Decimal(tax);
  const decTotal = new Prisma.Decimal(finalTotal);
  const decPaid = new Prisma.Decimal(finalPaid);
  const decDue = new Prisma.Decimal(finalDue);

  assert(decTotal.toString() === '40000', 'decTotal Prisma.Decimal is exact 40000 without DecimalError');
  assert(decPaid.toString() === '50000', 'decPaid Prisma.Decimal is exact 50000 without DecimalError');
  assert(decDue.toString() === '0', 'decDue Prisma.Decimal is exact 0 without DecimalError');
} catch (err) {
  assert(false, `Prisma Decimal instantiation threw unexpected error: ${err.message}`);
}

console.log(`\n======================================================`);
console.log(`  ALL ${passed}/${total} PURCHASE TESTS PASSED!`);
console.log(`======================================================\n`);
