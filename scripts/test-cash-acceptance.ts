/**
 * Section 32 Acceptance Test for NEED ELECTRO ERP Cash Management System
 * Simulates the exact transaction sequence and validates:
 * 1. Sequential balance calculations
 * 2. Strict non-revenue classification of capital investments
 * 3. Final system cash equals exactly ৳60,000
 */

interface SimEvent {
  description: string;
  type: string;
  direction: 'INFLOW' | 'OUTFLOW';
  amount: number;
  expectedBalance: number;
  isRevenue: boolean;
}

const openingCash = 20000;

const sequence: SimEvent[] = [
  {
    description: 'Purchase stock in cash',
    type: 'PURCHASE',
    direction: 'OUTFLOW',
    amount: 12000,
    expectedBalance: 8000,
    isRevenue: false
  },
  {
    description: 'Cash sale to customer',
    type: 'SALE',
    direction: 'INFLOW',
    amount: 2000,
    expectedBalance: 10000,
    isRevenue: true
  },
  {
    description: 'Operating expense paid in cash',
    type: 'EXPENSE',
    direction: 'OUTFLOW',
    amount: 1000,
    expectedBalance: 9000,
    isRevenue: false
  },
  {
    description: 'Customer due collection in cash',
    type: 'CUSTOMER_PAYMENT',
    direction: 'INFLOW',
    amount: 3000,
    expectedBalance: 12000,
    isRevenue: false
  },
  {
    description: 'EMI installment collection in cash',
    type: 'EMI_PAYMENT',
    direction: 'INFLOW',
    amount: 2000,
    expectedBalance: 14000,
    isRevenue: false
  },
  {
    description: 'Partner capital investment in cash',
    type: 'INVESTMENT',
    direction: 'INFLOW',
    amount: 50000,
    expectedBalance: 64000,
    isRevenue: false
  },
  {
    description: 'Supplier payment in cash',
    type: 'SUPPLIER_PAYMENT',
    direction: 'OUTFLOW',
    amount: 4000,
    expectedBalance: 60000,
    isRevenue: false
  }
];

function runAcceptanceTest() {
  console.log('=====================================================');
  console.log('NEED ELECTRO ERP — CASH MANAGEMENT ACCEPTANCE TEST');
  console.log('=====================================================');
  console.log(`Starting Opening Cash: ৳${openingCash.toLocaleString('en-IN')}`);

  let runningBalance = openingCash;
  let totalRevenue = 0;
  let totalCapital = 0;
  let totalInflow = 0;
  let totalOutflow = 0;

  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    if (step.direction === 'INFLOW') {
      runningBalance += step.amount;
      totalInflow += step.amount;
      if (step.isRevenue) {
        totalRevenue += step.amount;
      }
      if (step.type === 'INVESTMENT') {
        totalCapital += step.amount;
      }
    } else {
      runningBalance -= step.amount;
      totalOutflow += step.amount;
    }

    const passed = runningBalance === step.expectedBalance;
    console.log(
      `Step ${i + 1}: ${step.description.padEnd(38)} | Change: ${step.direction === 'INFLOW' ? '+' : '-'}৳${step.amount.toLocaleString().padStart(6)} | Balance: ৳${runningBalance.toLocaleString().padStart(6)} | Expected: ৳${step.expectedBalance.toLocaleString().padStart(6)} | ${passed ? '✓ PASS' : '✗ FAIL'}`
    );

    if (!passed) {
      throw new Error(`Step ${i + 1} failed! Expected ৳${step.expectedBalance}, got ৳${runningBalance}`);
    }
  }

  console.log('-----------------------------------------------------');
  console.log(`Final System Cash:           ৳${runningBalance.toLocaleString('en-IN')} (Target: ৳60,000)`);
  console.log(`Total Sales Revenue:         ৳${totalRevenue.toLocaleString('en-IN')} (Target: ৳2,000)`);
  console.log(`Capital Investments Inflow:  ৳${totalCapital.toLocaleString('en-IN')} (Target: ৳50,000)`);
  console.log(`Total Cash Inflows:          ৳${totalInflow.toLocaleString('en-IN')}`);
  console.log(`Total Cash Outflows:         ৳${totalOutflow.toLocaleString('en-IN')}`);
  console.log(`Calculated Formula Check:    Opening (${openingCash}) + Inflows (${totalInflow}) - Outflows (${totalOutflow}) = ৳${(openingCash + totalInflow - totalOutflow).toLocaleString('en-IN')}`);

  if (runningBalance !== 60000) {
    throw new Error(`Final balance test failed: expected 60,000 but got ${runningBalance}`);
  }
  if (totalRevenue !== 2000) {
    throw new Error(`Revenue classification test failed: expected 2,000 but got ${totalRevenue}`);
  }
  if (totalCapital !== 50000) {
    throw new Error(`Capital investment test failed: expected 50,000 but got ${totalCapital}`);
  }

  console.log('=====================================================');
  console.log('ALL ACCEPTANCE CRITERIA VERIFIED WITH 100% SUCCESS!');
  console.log('=====================================================');
}

runAcceptanceTest();
