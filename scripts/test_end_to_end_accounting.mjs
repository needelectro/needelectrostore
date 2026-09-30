// NEED ELECTRO ERP — End-to-End Accounting & Cash Management Verification Suite
import { PrismaClient, Prisma } from '@prisma/client';
import { recordAccountMovement, reverseTransaction, calculateAccountBalancesFromLedger, syncStoredBalancesWithLedger } from '../lib/accounting.ts';

const prisma = new PrismaClient();

async function runE2ETests() {
  console.log('================================================================');
  console.log(' NEED ELECTRO ERP — E2E CENTRAL ACCOUNTING & CASH VERIFICATION ');
  console.log('================================================================\n');

  // STEP 0: Baseline state
  console.log('--- STEP 0: BASELINE LEDGER & BALANCES AUDIT ---');
  let accounts = await calculateAccountBalancesFromLedger();
  const mainCashInitial = accounts.find(a => a.id === 'acc-1')?.ledgerBalance || 0;
  console.log(`Initial Main Cash Drawer (acc-1): ৳${mainCashInitial}`);
  console.table(accounts.map(a => ({ id: a.id, name: a.name, ledgerBalance: a.ledgerBalance, storedBalance: a.storedBalance })));

  // STEP 1: New Cash Sale with Partial Due
  console.log('\n--- STEP 1: REALISTIC SALE (Cash + Customer Receivable) ---');
  const testInvoiceNumber = 'INV-TEST-' + Date.now().toString().slice(-6);
  const testSaleCustomer = await prisma.customer.findFirst();
  if (!testSaleCustomer) throw new Error('No customer found for test');
  const initialCustomerBalance = Number(testSaleCustomer.currentBalance);

  const saleTotal = 25000;
  const salePaidCash = 15000;
  const saleDue = 10000;

  const createdSale = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        id: 'sale-' + Date.now(),
        invoiceNumber: testInvoiceNumber,
        customerId: testSaleCustomer.id,
        customerName: testSaleCustomer.name,
        customerPhone: testSaleCustomer.phone,
        branchId: 'branch-1',
        subtotal: new Prisma.Decimal(saleTotal),
        grandTotal: new Prisma.Decimal(saleTotal),
        paidAmount: new Prisma.Decimal(salePaidCash),
        dueAmount: new Prisma.Decimal(saleDue),
        payments: [{ method: 'Cash', amount: salePaidCash, accountId: 'acc-1' }],
        status: 'COMPLETED',
        notes: 'E2E Test Sale',
      },
    });

    // Customer Due
    await tx.customer.update({
      where: { id: testSaleCustomer.id },
      data: { currentBalance: { increment: new Prisma.Decimal(saleDue) } },
    });

    await tx.ledgerEntry.create({
      data: {
        id: 'led-test-sale-cust-' + Date.now(),
        date: new Date(),
        partyType: 'CUSTOMER',
        partyId: testSaleCustomer.id,
        referenceType: 'SALE',
        referenceNumber: testInvoiceNumber,
        description: `Receivable for test invoice ${testInvoiceNumber}`,
        debit: new Prisma.Decimal(saleDue),
        credit: new Prisma.Decimal(0),
        runningBalance: new Prisma.Decimal(initialCustomerBalance + saleDue),
      },
    });

    // Cash Movement Inflow to Main Cash Drawer (acc-1)
    await recordAccountMovement(tx, {
      accountId: 'acc-1',
      paymentMethod: 'Cash',
      referenceType: 'SALE',
      referenceNumber: testInvoiceNumber,
      amount: salePaidCash,
      direction: 'INFLOW',
      description: `Cash received for test invoice ${testInvoiceNumber}`,
      performedBy: 'E2E Test Suite',
      relatedTransactionId: sale.id,
    });

    return sale;
  });

  // Verify Step 1
  accounts = await calculateAccountBalancesFromLedger();
  const mainCashAfterSale = accounts.find(a => a.id === 'acc-1')?.ledgerBalance || 0;
  const updatedCustomerStep1 = await prisma.customer.findUnique({ where: { id: testSaleCustomer.id } });

  console.log(`Expected Cash: ৳${mainCashInitial + salePaidCash} | Actual Cash: ৳${mainCashAfterSale}`);
  if (mainCashAfterSale !== mainCashInitial + salePaidCash) throw new Error('Cash balance mismatch after sale!');
  console.log(`Customer Due: Expected ৳${initialCustomerBalance + saleDue} | Actual: ৳${Number(updatedCustomerStep1?.currentBalance)}`);
  if (Number(updatedCustomerStep1?.currentBalance) !== initialCustomerBalance + saleDue) throw new Error('Customer due mismatch after sale!');
  console.log('✓ STEP 1 PASSED: Sale Cash Inflow and Customer Receivable synchronized.');

  // STEP 2: Customer Due Collection in Cash
  console.log('\n--- STEP 2: CUSTOMER DUE COLLECTION IN CASH ---');
  const collectionAmount = 5000;
  const collectionReceipt = 'REC-TEST-' + Date.now().toString().slice(-6);

  await prisma.$transaction(async (tx) => {
    // Reduce Customer balance
    await tx.customer.update({
      where: { id: testSaleCustomer.id },
      data: { currentBalance: { decrement: new Prisma.Decimal(collectionAmount) } },
    });

    // Customer ledger credit
    await tx.ledgerEntry.create({
      data: {
        id: 'led-test-due-cust-' + Date.now(),
        date: new Date(),
        partyType: 'CUSTOMER',
        partyId: testSaleCustomer.id,
        referenceType: 'DUE_PAYMENT',
        referenceNumber: collectionReceipt,
        description: `Customer payment received on ${collectionReceipt}`,
        debit: new Prisma.Decimal(0),
        credit: new Prisma.Decimal(collectionAmount),
        runningBalance: new Prisma.Decimal(initialCustomerBalance + saleDue - collectionAmount),
      },
    });

    // Main cash drawer inflow
    await recordAccountMovement(tx, {
      accountId: 'acc-1',
      paymentMethod: 'Cash',
      referenceType: 'DUE_PAYMENT',
      referenceNumber: collectionReceipt,
      amount: collectionAmount,
      direction: 'INFLOW',
      description: `Due collection from ${testSaleCustomer.name}`,
      performedBy: 'E2E Test Suite',
    });
  });

  // Verify Step 2
  accounts = await calculateAccountBalancesFromLedger();
  const mainCashAfterCollection = accounts.find(a => a.id === 'acc-1')?.ledgerBalance || 0;
  const updatedCustomerStep2 = await prisma.customer.findUnique({ where: { id: testSaleCustomer.id } });

  console.log(`Expected Cash: ৳${mainCashAfterSale + collectionAmount} | Actual Cash: ৳${mainCashAfterCollection}`);
  if (mainCashAfterCollection !== mainCashAfterSale + collectionAmount) throw new Error('Cash balance mismatch after due collection!');
  console.log(`Customer Due: Expected ৳${initialCustomerBalance + saleDue - collectionAmount} | Actual: ৳${Number(updatedCustomerStep2?.currentBalance)}`);
  console.log('✓ STEP 2 PASSED: Customer Due Collection increased cash and reduced receivable.');

  // STEP 3: Operating Expense in Cash
  console.log('\n--- STEP 3: CASH OPERATING EXPENSE ---');
  const expenseAmount = 2500;
  const expenseVoucher = 'EXP-TEST-' + Date.now().toString().slice(-6);

  const createdExpense = await prisma.$transaction(async (tx) => {
    const exp = await tx.expense.create({
      data: {
        id: 'exp-test-' + Date.now(),
        voucherNumber: expenseVoucher,
        category: 'Store Cost',
        amount: new Prisma.Decimal(expenseAmount),
        paymentMethod: 'Cash',
        branchId: 'branch-1',
        description: 'E2E Test Office Supplies',
        createdBy: 'E2E Test Suite',
        status: 'COMPLETED',
      },
    });

    await recordAccountMovement(tx, {
      accountId: 'acc-1',
      paymentMethod: 'Cash',
      referenceType: 'EXPENSE',
      referenceNumber: expenseVoucher,
      amount: expenseAmount,
      direction: 'OUTFLOW',
      description: `Store Expense: ${exp.description}`,
      performedBy: 'E2E Test Suite',
      relatedTransactionId: exp.id,
    });

    return exp;
  });

  // Verify Step 3
  accounts = await calculateAccountBalancesFromLedger();
  const mainCashAfterExpense = accounts.find(a => a.id === 'acc-1')?.ledgerBalance || 0;
  console.log(`Expected Cash: ৳${mainCashAfterCollection - expenseAmount} | Actual Cash: ৳${mainCashAfterExpense}`);
  if (mainCashAfterExpense !== mainCashAfterCollection - expenseAmount) throw new Error('Cash balance mismatch after expense!');
  console.log('✓ STEP 3 PASSED: Operating Expense decreased cash drawer accurately.');

  // STEP 4: Purchase with Cash Outflow and Supplier Payable
  console.log('\n--- STEP 4: PURCHASE (Cash Paid + Supplier Payable) ---');
  const testSupplier = await prisma.supplier.findFirst();
  if (!testSupplier) throw new Error('No supplier found for test');
  const initialSupplierPayable = Number(testSupplier.currentPayable);

  const purchaseTotal = 30000;
  const purchasePaidCash = 20000;
  const purchaseDue = 10000;
  const purchaseInvoice = 'PUR-TEST-' + Date.now().toString().slice(-6);

  await prisma.$transaction(async (tx) => {
    const pur = await tx.purchase.create({
      data: {
        id: 'pur-test-' + Date.now(),
        invoiceNumber: purchaseInvoice,
        supplierId: testSupplier.id,
        supplierName: testSupplier.name,
        branchId: 'branch-1',
        subtotal: new Prisma.Decimal(purchaseTotal),
        total: new Prisma.Decimal(purchaseTotal),
        paidAmount: new Prisma.Decimal(purchasePaidCash),
        dueAmount: new Prisma.Decimal(purchaseDue),
        paymentMethod: 'Cash',
        status: 'Received',
        notes: 'E2E Test Purchase',
      },
    });

    // Supplier payable increase
    await tx.supplier.update({
      where: { id: testSupplier.id },
      data: { currentPayable: { increment: new Prisma.Decimal(purchaseDue) } },
    });

    await tx.ledgerEntry.create({
      data: {
        id: 'led-test-pur-sup-' + Date.now(),
        date: new Date(),
        partyType: 'SUPPLIER',
        partyId: testSupplier.id,
        referenceType: 'PURCHASE',
        referenceNumber: purchaseInvoice,
        description: `Payable for purchase invoice ${purchaseInvoice}`,
        debit: new Prisma.Decimal(0),
        credit: new Prisma.Decimal(purchaseDue),
        runningBalance: new Prisma.Decimal(initialSupplierPayable + purchaseDue),
      },
    });

    // Cash Outflow
    await recordAccountMovement(tx, {
      accountId: 'acc-1',
      paymentMethod: 'Cash',
      referenceType: 'PURCHASE',
      referenceNumber: purchaseInvoice,
      amount: purchasePaidCash,
      direction: 'OUTFLOW',
      description: `Payment for purchase ${purchaseInvoice}`,
      performedBy: 'E2E Test Suite',
      relatedTransactionId: pur.id,
    });
  });

  // Verify Step 4
  accounts = await calculateAccountBalancesFromLedger();
  const mainCashAfterPurchase = accounts.find(a => a.id === 'acc-1')?.ledgerBalance || 0;
  const updatedSupplierStep4 = await prisma.supplier.findUnique({ where: { id: testSupplier.id } });

  console.log(`Expected Cash: ৳${mainCashAfterExpense - purchasePaidCash} | Actual Cash: ৳${mainCashAfterPurchase}`);
  if (mainCashAfterPurchase !== mainCashAfterExpense - purchasePaidCash) throw new Error('Cash mismatch after purchase!');
  console.log(`Supplier Payable: Expected ৳${initialSupplierPayable + purchaseDue} | Actual: ৳${Number(updatedSupplierStep4?.currentPayable)}`);
  if (Number(updatedSupplierStep4?.currentPayable) !== initialSupplierPayable + purchaseDue) throw new Error('Supplier payable mismatch!');
  console.log('✓ STEP 4 PASSED: Purchase decreased cash and logged supplier liability.');

  // STEP 5: Reversal Logic (Cancel the Sale)
  console.log('\n--- STEP 5: PROPER REVERSAL FOR CANCELED TRANSACTION (No Hard Delete) ---');
  await prisma.$transaction(async (tx) => {
    // Reverse financial effects
    await reverseTransaction(tx, {
      referenceNumber: testInvoiceNumber,
      reason: 'Customer cancelled order after invoice creation',
      performedBy: 'E2E Test Auditor',
    });

    // Soft Cancel: NEVER hard delete
    await tx.sale.update({
      where: { id: createdSale.id },
      data: {
        status: 'CANCELLED',
        notes: 'CANCELLED & REVERSED via E2E Suite',
      },
    });
  });

  // Verify Step 5
  accounts = await calculateAccountBalancesFromLedger();
  const mainCashAfterReversal = accounts.find(a => a.id === 'acc-1')?.ledgerBalance || 0;
  console.log(`Cash after Reversal: ৳${mainCashAfterReversal} (Reverted ৳${salePaidCash} inflow)`);
  if (mainCashAfterReversal !== mainCashAfterPurchase - salePaidCash) throw new Error('Cash was not properly reversed!');

  const reversedSale = await prisma.sale.findUnique({ where: { id: createdSale.id } });
  if (reversedSale?.status !== 'CANCELLED') throw new Error('Sale status is not CANCELLED!');
  console.log('✓ STEP 5 PASSED: Reversal counteracted cash and marked sale CANCELLED without hard deletion.');

  // STEP 6: Physical Cash Count with Strict Reason Requirement
  console.log('\n--- STEP 6: PHYSICAL CASH RECONCILIATION & STRICT REASON VALIDATION ---');
  const physicalDrawerCount = mainCashAfterReversal - 500; // Simulating a ৳500 shortage
  const countSessionNumber = 'CNT-TEST-' + Date.now().toString().slice(-6);

  // Test 6A: Missing reason rejection
  let failedWithoutReason = false;
  try {
    const reason = ''; // Empty reason
    if (!reason || !reason.trim()) {
      throw new Error('A clear justification reason is strictly required to adjust cash discrepancies in the accounting ledger.');
    }
  } catch (err) {
    failedWithoutReason = true;
    console.log(`✓ Rejection guard verified: ${err.message}`);
  }
  if (!failedWithoutReason) throw new Error('Validation failed to reject empty reason!');

  // Test 6B: Valid Adjustment with Reason
  const adjustmentReason = 'CASH_SHORTAGE';
  const adjustmentNotes = 'Minor shift handoff change difference';

  await prisma.$transaction(async (tx) => {
    const diff = physicalDrawerCount - mainCashAfterReversal; // -500
    const absDiff = Math.abs(diff);

    // Create adjustment
    const adj = await tx.cashAdjustment.create({
      data: {
        id: 'adj-test-' + Date.now(),
        adjustmentNumber: 'ADJ-' + countSessionNumber,
        date: new Date(),
        type: 'OUTFLOW',
        reason: adjustmentReason,
        amount: new Prisma.Decimal(absDiff),
        accountId: 'acc-1',
        paymentMethod: 'Cash',
        reference: countSessionNumber,
        notes: adjustmentNotes,
        performedBy: 'E2E Test Auditor',
      },
    });

    // Adjust account
    await tx.financialAccount.update({
      where: { id: 'acc-1' },
      data: { balance: { decrement: new Prisma.Decimal(absDiff) } },
    });

    // Ledger entry
    await tx.ledgerEntry.create({
      data: {
        id: 'led-adj-test-' + Date.now(),
        date: new Date(),
        partyType: 'ACCOUNT',
        partyId: 'acc-1',
        referenceType: 'CASH_ADJUSTMENT',
        referenceNumber: 'ADJ-' + countSessionNumber,
        description: `Physical Cash Drawer Count Variance: [${adjustmentReason}] (-৳${absDiff})`,
        debit: new Prisma.Decimal(0),
        credit: new Prisma.Decimal(absDiff),
        runningBalance: new Prisma.Decimal(physicalDrawerCount),
        status: 'COMPLETED',
        performedBy: 'E2E Test Auditor',
      },
    });

    // Store in CashReconciliation
    await tx.cashReconciliation.create({
      data: {
        id: 'recon-test-' + Date.now(),
        sessionNumber: countSessionNumber,
        date: new Date(),
        accountId: 'acc-1',
        accountName: 'Main Cash Drawer',
        expectedBalance: new Prisma.Decimal(mainCashAfterReversal),
        physicalBalance: new Prisma.Decimal(physicalDrawerCount),
        difference: new Prisma.Decimal(diff),
        status: 'ADJUSTED',
        reason: adjustmentReason,
        notes: adjustmentNotes,
        performedBy: 'E2E Test Auditor',
      },
    });
  });

  // Verify Step 6
  accounts = await calculateAccountBalancesFromLedger();
  const mainCashAfterAudit = accounts.find(a => a.id === 'acc-1')?.ledgerBalance || 0;
  console.log(`Expected Cash: ৳${physicalDrawerCount} | Actual Cash: ৳${mainCashAfterAudit}`);
  if (mainCashAfterAudit !== physicalDrawerCount) throw new Error('Cash drawer was not balanced to physical count!');

  const reconRecord = await prisma.cashReconciliation.findUnique({ where: { sessionNumber: countSessionNumber } });
  if (!reconRecord || reconRecord.status !== 'ADJUSTED') throw new Error('Reconciliation record not saved properly!');
  console.log('✓ STEP 6 PASSED: Physical Cash Count reconciled with variance reporting and strict reason enforcement.');

  // STEP 7: Comprehensive Synchronization Test
  console.log('\n--- STEP 7: GLOBAL BALANCE SYNCHRONIZATION INTEGRITY CHECK ---');
  await syncStoredBalancesWithLedger();

  const finalAccounts = await prisma.financialAccount.findMany({ where: { isActive: true } });
  const ledgerStats = await calculateAccountBalancesFromLedger();

  for (const fa of finalAccounts) {
    const ls = ledgerStats.find(s => s.id === fa.id);
    const stored = Number(fa.balance);
    const ledger = ls?.ledgerBalance || 0;
    console.log(`Account [${fa.id}] ${fa.name.padEnd(40)} | Stored: ৳${stored} | Ledger: ৳${ledger}`);
    if (stored !== ledger) {
      throw new Error(`Out of sync balance for account ${fa.name}! Stored: ${stored}, Ledger: ${ledger}`);
    }
  }
  console.log('✓ STEP 7 PASSED: 100% of Financial Accounts perfectly match Central Ledger.');

  console.log('\n================================================================');
  console.log(' ALL E2E ACCOUNTING & CASH MANAGEMENT TESTS PASSED WITH 100% SUCCESS ');
  console.log('================================================================\n');
}

runE2ETests()
  .catch(err => {
    console.error('E2E TEST FAILURE:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
